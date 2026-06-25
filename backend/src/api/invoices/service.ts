import { pool } from '../../db';
import { invoiceRepository } from './repository';

export const invoiceService = {
  async createInvoice(data: any, userId: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Auto-create or find client if client_id is missing
      if (!data.client_id && data.customerName) {
          const cRes = await client.query('SELECT id FROM clients WHERE email = $1 OR name = $2 LIMIT 1', [data.customerEmail || '', data.customerName]);
          if (cRes.rows.length > 0) {
              data.client_id = cRes.rows[0].id;
          } else {
              const customId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
              const cIns = await client.query('INSERT INTO clients (custom_id, name, email, type) VALUES ($1, $2, $3, $4) RETURNING id', [customId, data.customerName, data.customerEmail || null, 'customer']);
              data.client_id = cIns.rows[0].id;
          }
      }

      // Calculate totals
      let sub_total = 0;
      let tax_total = 0;
      let discount_total = 0;

      if (data.items && Array.isArray(data.items)) {
          data.items.forEach((item: any) => {
              const amount = (item.quantity * item.rate) - (item.discount || 0);
              sub_total += (item.quantity * item.rate);
              discount_total += (item.discount || 0);
              tax_total += (item.tax_amount || 0);
              item.amount = amount + (item.tax_amount || 0);
          });
      }

      data.sub_total = sub_total;
      data.tax_total = tax_total;
      data.discount_total = discount_total;
      data.amount = sub_total - discount_total + tax_total + (data.shipping_charges || 0) + (data.round_off || 0);
      data.balance = data.amount; // Initially balance is full amount
      data.status = 'Draft';

      // Ensure unique invoice number
      if (!data.number) {
          const rand = Math.floor(1000 + Math.random() * 9000);
          data.number = `INV-${new Date().getFullYear()}-${rand}`;
      }

      // Create Invoice
      const invoice = await invoiceRepository.createInvoice(data, client);

      // Create Items
      if (data.items && data.items.length > 0) {
          await invoiceRepository.createInvoiceItems(invoice.id, data.items, client);
      }

      // Log Activity
      await invoiceRepository.logActivity(invoice.id, userId, 'Created', 'Invoice created successfully', client);

      await client.query('COMMIT');
      return this.getInvoiceDetails(invoice.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async updateInvoice(id: number, data: any, userId: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existing = await invoiceRepository.getInvoiceById(id);
      if (!existing) throw new Error('Invoice not found');

      let sub_total = 0;
      let tax_total = 0;
      let discount_total = 0;

      if (data.items && Array.isArray(data.items)) {
          data.items.forEach((item: any) => {
              const amount = (item.quantity * item.rate) - (item.discount || 0);
              sub_total += (item.quantity * item.rate);
              discount_total += (item.discount || 0);
              tax_total += (item.tax_amount || 0);
              item.amount = amount + (item.tax_amount || 0);
          });
      }

      data.sub_total = sub_total;
      data.tax_total = tax_total;
      data.discount_total = discount_total;
      data.amount = sub_total - discount_total + tax_total + (data.shipping_charges || 0) + (data.round_off || 0);
      
      // recalculate balance based on previous payments
      const payments = await invoiceRepository.getInvoicePayments(id);
      const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount_received), 0);
      data.balance = data.amount - paidAmount;

      if (data.balance <= 0) {
          data.status = 'Paid';
          data.balance = 0;
      } else if (data.balance < data.amount) {
          data.status = 'Partial';
      }

      const { items, customerName, customerEmail, ...invoiceData } = data;

      // Sanitize empty dates
      if (invoiceData.due_date === "") invoiceData.due_date = null;
      if (invoiceData.invoice_date === "") invoiceData.invoice_date = null;

      // Update client if customer details changed
      if (customerName || customerEmail) {
          await client.query(
              'UPDATE clients SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3',
              [customerName || null, customerEmail || null, existing.client_id]
          );
      }

      // Update invoice
      await invoiceRepository.updateInvoice(id, invoiceData, client);

      // Replace items
      if (items) {
          await invoiceRepository.deleteInvoiceItems(id, client);
          if (items.length > 0) {
              await invoiceRepository.createInvoiceItems(id, items, client);
          }
      }

      // Log Activity
      await invoiceRepository.logActivity(id, userId, 'Updated', 'Invoice updated', client);

      await client.query('COMMIT');
      return this.getInvoiceDetails(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getInvoices(filters: any, limit: number, offset: number) {
      return await invoiceRepository.getInvoices(filters, limit, offset);
  },

  async getInvoiceDetails(id: number) {
      const invoice = await invoiceRepository.getInvoiceById(id);
      if (!invoice) return null;
      
      const items = await invoiceRepository.getInvoiceItems(id);
      const payments = await invoiceRepository.getInvoicePayments(id);
      const activity = await invoiceRepository.getActivityLogs(id);

      return {
          ...invoice,
          items,
          payments,
          activity
      };
  },

  async deleteInvoice(id: number, userId: number) {
      const invoice = await invoiceRepository.deleteInvoice(id);
      await invoiceRepository.logActivity(id, userId, 'Deleted', 'Invoice moved to trash');
      return invoice;
  },

  async recordPayment(id: number, paymentData: any, userId: number) {
      const client = await pool.connect();
      try {
          await client.query('BEGIN');
          
          const invoice = await invoiceRepository.getInvoiceById(id);
          if (!invoice) throw new Error('Invoice not found');

          const newBalance = Number(invoice.balance) - Number(paymentData.amount_received);
          if (newBalance < 0) throw new Error('Payment amount exceeds balance');

          let newStatus = invoice.status;
          if (newBalance === 0) newStatus = 'Paid';
          else newStatus = 'Partial';

          // Update invoice
          await invoiceRepository.updateInvoice(id, {
              balance: newBalance,
              status: newStatus
          }, client);

          // Record payment
          const payment = await invoiceRepository.recordPayment(id, paymentData, client);

          // Log Activity
          await invoiceRepository.logActivity(id, userId, 'Payment Received', `Payment of ${paymentData.amount_received} received via ${paymentData.payment_method}`, client);

          await client.query('COMMIT');
          return payment;
      } catch (error) {
          await client.query('ROLLBACK');
          throw error;
      } finally {
          client.release();
      }
  }
};

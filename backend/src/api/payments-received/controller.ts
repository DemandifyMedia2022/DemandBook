import { Request, Response } from 'express';
import { query, pool } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT ip.*, i.number as invoice_number, c.name as client_name
      FROM invoice_payments ip
      JOIN invoices i ON ip.invoice_id = i.id
      JOIN clients c ON i.client_id = c.id
      ORDER BY ip.payment_date DESC, ip.created_at DESC
    `);
    return res.status(200).json({ success: true, payments: result.rows });
  } catch (error) {
    console.error('Failed to list payments received:', error);
    return res.status(500).json({ success: false, message: 'Database error listing payments received.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { invoice_id, payment_date, payment_method, amount_received, reference_number, notes } = req.body;

  if (!invoice_id || !amount_received || !payment_method) {
    return res.status(400).json({ success: false, message: 'Invoice ID, Amount Received, and Payment Method are required.' });
  }

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    // Fetch invoice details
    const invRes = await dbClient.query('SELECT amount, balance, status FROM invoices WHERE id = $1', [invoice_id]);
    if (invRes.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const invoice = invRes.rows[0];
    const amountVal = parseFloat(amount_received);
    const newBalance = Math.max(0, parseFloat(invoice.balance) - amountVal);
    const newStatus = newBalance === 0 ? 'Paid' : 'Partial';

    // Insert payment record
    const insertPaymentQuery = `
      INSERT INTO invoice_payments (invoice_id, payment_date, payment_method, amount_received, reference_number, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const paymentRes = await dbClient.query(insertPaymentQuery, [
      invoice_id,
      payment_date || new Date(),
      payment_method,
      amountVal,
      reference_number || '',
      notes || ''
    ]);

    // Update invoice balance
    await dbClient.query(`
      UPDATE invoices
      SET balance = $1, status = $2, updated_at = NOW()
      WHERE id = $3
    `, [newBalance, newStatus, invoice_id]);

    await dbClient.query('COMMIT');
    return res.status(201).json({ success: true, payment: paymentRes.rows[0] });
  } catch (error) {
    console.error('Failed to record payment received:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error recording payment.' });
  } finally {
    (await client).release();
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  const { id } = req.params;

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    // Fetch payment to get invoice details & amount
    const payRes = await dbClient.query('SELECT invoice_id, amount_received FROM invoice_payments WHERE id = $1', [id]);
    if (payRes.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const payment = payRes.rows[0];

    // Delete payment
    await dbClient.query('DELETE FROM invoice_payments WHERE id = $1', [id]);

    // Fetch current invoice state
    const invRes = await dbClient.query('SELECT amount, balance FROM invoices WHERE id = $1', [payment.invoice_id]);
    if (invRes.rows.length > 0) {
      const invoice = invRes.rows[0];
      const newBalance = Math.min(parseFloat(invoice.amount), parseFloat(invoice.balance) + parseFloat(payment.amount_received));
      const newStatus = newBalance === parseFloat(invoice.amount) ? 'Sent' : 'Partial';

      await dbClient.query(`
        UPDATE invoices
        SET balance = $1, status = $2, updated_at = NOW()
        WHERE id = $3
      `, [newBalance, newStatus, payment.invoice_id]);
    }

    await dbClient.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Payment record deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete payment received:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error deleting payment.' });
  } finally {
    (await client).release();
  }
};

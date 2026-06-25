import { query } from '../../db';

export const invoiceRepository = {
  // --- Invoices ---
  async createInvoice(data: any, client?: any) {
    const sql = `
      INSERT INTO invoices (
        number, client_id, invoice_date, due_date, currency, payment_terms, 
        sales_person_id, reference_number, sub_total, discount_total, 
        tax_total, shipping_charges, round_off, amount, balance, status, 
        customer_notes, terms_conditions, internal_notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING *
    `;
    const values = [
      data.number, data.client_id, data.invoice_date, data.due_date, data.currency || 'USD',
      data.payment_terms, data.sales_person_id || null, data.reference_number,
      data.sub_total || 0, data.discount_total || 0, data.tax_total || 0,
      data.shipping_charges || 0, data.round_off || 0, data.amount || 0,
      data.balance !== undefined ? data.balance : (data.amount || 0),
      data.status || 'Draft', data.customer_notes, data.terms_conditions, data.internal_notes
    ];
    
    if (client) {
        return (await client.query(sql, values)).rows[0];
    }
    return (await query(sql, values)).rows[0];
  },

  async getInvoices(filters: any = {}, limit: number = 10, offset: number = 0) {
    let sql = `
      SELECT i.*, c.name as customer_name, c.email as customer_email
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      WHERE i.deleted_at IS NULL
    `;
    const values: any[] = [];
    let idx = 1;

    if (filters.status) {
      sql += ` AND i.status = $${idx++}`;
      values.push(filters.status);
    }
    if (filters.search) {
      sql += ` AND (i.number ILIKE $${idx} OR c.name ILIKE $${idx})`;
      values.push(`%${filters.search}%`);
      idx++;
    }
    if (filters.customer_id) {
        sql += ` AND i.client_id = $${idx++}`;
        values.push(filters.customer_id);
    }

    sql += ` ORDER BY i.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    
    // get total count
    let countSql = `SELECT COUNT(*) FROM invoices i JOIN clients c ON i.client_id = c.id WHERE i.deleted_at IS NULL`;
    const countValues: any[] = [];
    let countIdx = 1;
    if (filters.status) {
      countSql += ` AND i.status = $${countIdx++}`;
      countValues.push(filters.status);
    }
    if (filters.search) {
      countSql += ` AND (i.number ILIKE $${countIdx} OR c.name ILIKE $${countIdx})`;
      countValues.push(`%${filters.search}%`);
      countIdx++;
    }
    if (filters.customer_id) {
        countSql += ` AND i.client_id = $${countIdx++}`;
        countValues.push(filters.customer_id);
    }

    const countResult = await query(countSql, countValues);
    
    return {
        data: result.rows,
        total: parseInt(countResult.rows[0].count)
    };
  },

  async getInvoiceById(id: number) {
    const sql = `
      SELECT i.*, c.name as customer_name, c.email as customer_email,
             c.phone as customer_phone, c.custom_id as customer_custom_id
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      WHERE i.id = $1 AND i.deleted_at IS NULL
    `;
    const res = await query(sql, [id]);
    return res.rows[0];
  },

  async updateInvoice(id: number, data: any, client?: any) {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const key of Object.keys(data)) {
      updates.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
    values.push(id);
    const sql = `UPDATE invoices SET ${updates.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`;
    
    if (client) {
        return (await client.query(sql, values)).rows[0];
    }
    return (await query(sql, values)).rows[0];
  },

  async deleteInvoice(id: number) {
    const sql = `UPDATE invoices SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    return (await query(sql, [id])).rows[0];
  },

  // --- Invoice Items ---
  async createInvoiceItems(invoiceId: number, items: any[], client?: any) {
    if (!items || items.length === 0) return [];
    
    const valueStrings = items.map((_, i) => {
        const base = i * 9;
        return `($${base+1}, $${base+2}, $${base+3}, $${base+4}, $${base+5}, $${base+6}, $${base+7}, $${base+8}, $${base+9})`;
    });
    
    const sql = `
      INSERT INTO invoice_items (
        invoice_id, product_id, description, quantity, unit, rate, discount, tax_amount, amount
      ) VALUES ${valueStrings.join(', ')} RETURNING *
    `;
    
    const values = items.flatMap(item => [
        invoiceId, item.product_id || null, item.description, item.quantity, item.unit || 'pcs',
        item.rate, item.discount || 0, item.tax_amount || 0, item.amount
    ]);

    if (client) {
        return (await client.query(sql, values)).rows;
    }
    return (await query(sql, values)).rows;
  },

  async getInvoiceItems(invoiceId: number) {
    const sql = `SELECT * FROM invoice_items WHERE invoice_id = $1`;
    return (await query(sql, [invoiceId])).rows;
  },

  async deleteInvoiceItems(invoiceId: number, client?: any) {
    const sql = `DELETE FROM invoice_items WHERE invoice_id = $1`;
    if (client) {
        return await client.query(sql, [invoiceId]);
    }
    return await query(sql, [invoiceId]);
  },

  // --- Payments ---
  async recordPayment(invoiceId: number, data: any, client?: any) {
    const sql = `
      INSERT INTO invoice_payments (invoice_id, payment_date, payment_method, amount_received, reference_number, notes)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const values = [invoiceId, data.payment_date || new Date(), data.payment_method, data.amount_received, data.reference_number, data.notes];
    if (client) {
        return (await client.query(sql, values)).rows[0];
    }
    return (await query(sql, values)).rows[0];
  },

  async getInvoicePayments(invoiceId: number) {
    const sql = `SELECT * FROM invoice_payments WHERE invoice_id = $1 ORDER BY payment_date DESC, created_at DESC`;
    return (await query(sql, [invoiceId])).rows;
  },

  // --- Activity Logs ---
  async logActivity(invoiceId: number, userId: number | null, action: string, remarks: string, client?: any) {
    const sql = `
      INSERT INTO invoice_activity_logs (invoice_id, user_id, action, remarks)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const values = [invoiceId, userId, action, remarks];
    if (client) {
        return (await client.query(sql, values)).rows[0];
    }
    return (await query(sql, values)).rows[0];
  },
  
  async getActivityLogs(invoiceId: number) {
      const sql = `
        SELECT l.*, u.name as user_name
        FROM invoice_activity_logs l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.invoice_id = $1
        ORDER BY l.timestamp DESC
      `;
      return (await query(sql, [invoiceId])).rows;
  }
};

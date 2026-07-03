import { query } from '../../db';

export const quoteRepository = {
    // --- Quotes ---
    async createQuote(data: any, client?: any) {
        const sql = `
      INSERT INTO quotes (
        quote_number, client_id, subject, reference_number, sales_person_id,
        billing_address, shipping_address, place_of_supply, quote_date, expiry_date,
        currency, sub_total, discount_total, tax_total, shipping_charges, round_off,
        amount, status, customer_notes, terms_conditions
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *
    `;
        const values = [
            data.quote_number, data.client_id, data.subject, data.reference_number || null,
            data.sales_person_id || null, data.billing_address || null, data.shipping_address || null,
            data.place_of_supply || null, data.quote_date, data.expiry_date || null,
            data.currency || 'INR', data.sub_total || 0, data.discount_total || 0,
            data.tax_total || 0, data.shipping_charges || 0, data.round_off || 0,
            data.amount || 0, data.status || 'Draft', data.customer_notes || null,
            data.terms_conditions || null,
        ];

        if (client) {
            return (await client.query(sql, values)).rows[0];
        }
        return (await query(sql, values)).rows[0];
    },

    async getQuotes(filters: any = {}, limit: number = 10, offset: number = 0) {
        let sql = `
      SELECT q.*, c.name as customer_name, c.email as customer_email
      FROM quotes q
      JOIN clients c ON q.client_id = c.id
      WHERE q.deleted_at IS NULL
    `;
        const values: any[] = [];
        let idx = 1;

        if (filters.status) {
            sql += ` AND q.status = $${idx++}`;
            values.push(filters.status);
        }
        if (filters.search) {
            sql += ` AND (q.quote_number ILIKE $${idx} OR c.name ILIKE $${idx} OR q.subject ILIKE $${idx})`;
            values.push(`%${filters.search}%`);
            idx++;
        }
        if (filters.client_id) {
            sql += ` AND q.client_id = $${idx++}`;
            values.push(filters.client_id);
        }

        sql += ` ORDER BY q.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
        values.push(limit, offset);

        const result = await query(sql, values);

        let countSql = `SELECT COUNT(*) FROM quotes q JOIN clients c ON q.client_id = c.id WHERE q.deleted_at IS NULL`;
        const countValues: any[] = [];
        let countIdx = 1;
        if (filters.status) {
            countSql += ` AND q.status = $${countIdx++}`;
            countValues.push(filters.status);
        }
        if (filters.search) {
            countSql += ` AND (q.quote_number ILIKE $${countIdx} OR c.name ILIKE $${countIdx} OR q.subject ILIKE $${countIdx})`;
            countValues.push(`%${filters.search}%`);
            countIdx++;
        }
        if (filters.client_id) {
            countSql += ` AND q.client_id = $${countIdx++}`;
            countValues.push(filters.client_id);
        }

        const countResult = await query(countSql, countValues);

        return {
            data: result.rows,
            total: parseInt(countResult.rows[0].count),
        };
    },

    async getQuoteById(id: number) {
        const sql = `
      SELECT q.*, c.name as customer_name, c.email as customer_email,
             c.phone as customer_phone, c.custom_id as customer_custom_id,
             c.gstin as customer_gstin
      FROM quotes q
      JOIN clients c ON q.client_id = c.id
      WHERE q.id = $1 AND q.deleted_at IS NULL
    `;
        const res = await query(sql, [id]);
        return res.rows[0];
    },

    async updateQuote(id: number, data: any, client?: any) {
        const updates: string[] = [];
        const values: any[] = [];
        let idx = 1;
        for (const key of Object.keys(data)) {
            updates.push(`${key} = $${idx++}`);
            values.push(data[key]);
        }
        values.push(id);
        const sql = `UPDATE quotes SET ${updates.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`;

        if (client) {
            return (await client.query(sql, values)).rows[0];
        }
        return (await query(sql, values)).rows[0];
    },

    async deleteQuote(id: number) {
        const sql = `UPDATE quotes SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
        return (await query(sql, [id])).rows[0];
    },

    // --- Quote Items ---
    async createQuoteItems(quoteId: number, items: any[], client?: any) {
        if (!items || items.length === 0) return [];

        const valueStrings = items.map((_, i) => {
            const base = i * 10;
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10})`;
        });

        const sql = `
      INSERT INTO quote_items (
        quote_id, product_id, description, hsn_sac, quantity, unit, rate, discount_pct, tax_rate, amount
      ) VALUES ${valueStrings.join(', ')} RETURNING *
    `;

        const values = items.flatMap((item) => [
            quoteId, item.product_id || null, item.description, item.hsn_sac || null,
            item.quantity, item.unit || 'pcs', item.rate, item.discount_pct || 0,
            item.tax_rate || 0, item.amount,
        ]);

        if (client) {
            return (await client.query(sql, values)).rows;
        }
        return (await query(sql, values)).rows;
    },

    async getQuoteItems(quoteId: number) {
        const sql = `SELECT * FROM quote_items WHERE quote_id = $1`;
        return (await query(sql, [quoteId])).rows;
    },

    async deleteQuoteItems(quoteId: number, client?: any) {
        const sql = `DELETE FROM quote_items WHERE quote_id = $1`;
        if (client) {
            return await client.query(sql, [quoteId]);
        }
        return await query(sql, [quoteId]);
    },

    // --- Activity Logs ---
    async logActivity(quoteId: number, userId: number | null, action: string, remarks: string, client?: any) {
        const sql = `
      INSERT INTO quote_activity_logs (quote_id, user_id, action, remarks)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
        const values = [quoteId, userId, action, remarks];
        if (client) {
            return (await client.query(sql, values)).rows[0];
        }
        return (await query(sql, values)).rows[0];
    },

    async getActivityLogs(quoteId: number) {
        const sql = `
      SELECT l.*, u.name as user_name
      FROM quote_activity_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.quote_id = $1
      ORDER BY l.timestamp DESC
    `;
        return (await query(sql, [quoteId])).rows;
    },
};
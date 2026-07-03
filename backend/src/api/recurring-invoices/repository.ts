import { query } from '../../db';

export const recurringInvoiceRepository = {
    async createProfile(data: any, client?: any) {
        const sql = `
      INSERT INTO recurring_invoices (
        custom_id, profile_name, client_id, frequency, interval_count, start_date,
        next_generation_date, end_condition, end_date, max_occurrences,
        creation_mode, due_date_offset_days, currency, sub_total, discount_total,
        tax_total, shipping_charges, round_off, amount, payment_terms,
        reference_number, customer_notes, terms_conditions, internal_notes, status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
      ) RETURNING *
    `;
        const values = [
            data.custom_id, data.profile_name, data.client_id, data.frequency, data.interval_count || 1,
            data.start_date, data.next_generation_date, data.end_condition || 'Never', data.end_date || null,
            data.max_occurrences || null, data.creation_mode || 'Draft', data.due_date_offset_days || 0,
            data.currency || 'INR', data.sub_total || 0, data.discount_total || 0, data.tax_total || 0,
            data.shipping_charges || 0, data.round_off || 0, data.amount || 0, data.payment_terms || null,
            data.reference_number || null, data.customer_notes || null, data.terms_conditions || null,
            data.internal_notes || null, data.status || 'Active'
        ];
        const runner = client || { query };
        return (await runner.query(sql, values)).rows[0];
    },

    async getProfiles(filters: any = {}, limit: number = 20, offset: number = 0) {
        let sql = `
      SELECT r.*, c.name as customer_name, c.custom_id as customer_custom_id,
        (SELECT COUNT(*) FROM invoices i WHERE i.recurring_invoice_id = r.id AND i.deleted_at IS NULL) AS child_count
      FROM recurring_invoices r
      JOIN clients c ON r.client_id = c.id
      WHERE r.deleted_at IS NULL
    `;
        const values: any[] = [];
        let idx = 1;

        if (filters.status) {
            sql += ` AND r.status = $${idx++}`;
            values.push(filters.status);
        }
        if (filters.frequency) {
            sql += ` AND r.frequency = $${idx++}`;
            values.push(filters.frequency);
        }
        if (filters.search) {
            sql += ` AND (r.profile_name ILIKE $${idx} OR r.custom_id ILIKE $${idx} OR c.name ILIKE $${idx})`;
            values.push(`%${filters.search}%`);
            idx++;
        }

        sql += ` ORDER BY r.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
        values.push(limit, offset);

        const result = await query(sql, values);

        let countSql = `SELECT COUNT(*) FROM recurring_invoices r JOIN clients c ON r.client_id = c.id WHERE r.deleted_at IS NULL`;
        const countValues: any[] = [];
        let countIdx = 1;
        if (filters.status) { countSql += ` AND r.status = $${countIdx++}`; countValues.push(filters.status); }
        if (filters.frequency) { countSql += ` AND r.frequency = $${countIdx++}`; countValues.push(filters.frequency); }
        if (filters.search) { countSql += ` AND (r.profile_name ILIKE $${countIdx} OR r.custom_id ILIKE $${countIdx} OR c.name ILIKE $${countIdx})`; countValues.push(`%${filters.search}%`); countIdx++; }

        const countResult = await query(countSql, countValues);
        return { data: result.rows, total: parseInt(countResult.rows[0].count) };
    },

    async getProfileById(id: number) {
        const sql = `
      SELECT r.*, c.name as customer_name, c.email as customer_email, c.custom_id as customer_custom_id
      FROM recurring_invoices r
      JOIN clients c ON r.client_id = c.id
      WHERE r.id = $1 AND r.deleted_at IS NULL
    `;
        return (await query(sql, [id])).rows[0];
    },

    // Active profiles due to generate an invoice today (or earlier)
    async getDueProfiles(asOfDate: string) {
        const sql = `
      SELECT r.*, c.name as customer_name, c.email as customer_email
      FROM recurring_invoices r
      JOIN clients c ON r.client_id = c.id
      WHERE r.status = 'Active' AND r.deleted_at IS NULL AND r.next_generation_date <= $1
    `;
        return (await query(sql, [asOfDate])).rows;
    },

    async updateProfile(id: number, data: any, client?: any) {
        const updates: string[] = [];
        const values: any[] = [];
        let idx = 1;
        for (const key of Object.keys(data)) {
            updates.push(`${key} = $${idx++}`);
            values.push(data[key]);
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const sql = `UPDATE recurring_invoices SET ${updates.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`;
        const runner = client || { query };
        return (await runner.query(sql, values)).rows[0];
    },

    async deleteProfile(id: number) {
        const sql = `UPDATE recurring_invoices SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
        return (await query(sql, [id])).rows[0];
    },

    // --- Items (template) ---
    async createItems(recurringInvoiceId: number, items: any[], client?: any) {
        if (!items || items.length === 0) return [];
        const valueStrings = items.map((_, i) => {
            const base = i * 9;
            return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7},$${base + 8},$${base + 9})`;
        });
        const sql = `
      INSERT INTO recurring_invoice_items (
        recurring_invoice_id, product_id, description, quantity, unit, rate, discount, tax_amount, amount
      ) VALUES ${valueStrings.join(', ')} RETURNING *
    `;
        const values = items.flatMap(item => [
            recurringInvoiceId, item.product_id || null, item.description, item.quantity, item.unit || 'pcs',
            item.rate, item.discount || 0, item.tax_amount || 0, item.amount
        ]);
        const runner = client || { query };
        return (await runner.query(sql, values)).rows;
    },

    async getItems(recurringInvoiceId: number) {
        const sql = `SELECT * FROM recurring_invoice_items WHERE recurring_invoice_id = $1`;
        return (await query(sql, [recurringInvoiceId])).rows;
    },

    async deleteItems(recurringInvoiceId: number, client?: any) {
        const sql = `DELETE FROM recurring_invoice_items WHERE recurring_invoice_id = $1`;
        const runner = client || { query };
        return await runner.query(sql, [recurringInvoiceId]);
    },

    // --- Activity logs ---
    async logActivity(recurringInvoiceId: number, userId: number | null, action: string, remarks: string, client?: any) {
        const sql = `
      INSERT INTO recurring_invoice_activity_logs (recurring_invoice_id, user_id, action, remarks)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
        const values = [recurringInvoiceId, userId, action, remarks];
        const runner = client || { query };
        return (await runner.query(sql, values)).rows[0];
    },

    async getActivityLogs(recurringInvoiceId: number) {
        const sql = `
      SELECT l.*, u.name as user_name
      FROM recurring_invoice_activity_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.recurring_invoice_id = $1
      ORDER BY l.timestamp DESC
    `;
        return (await query(sql, [recurringInvoiceId])).rows;
    },

    // --- Child invoices & trend ---
    async getChildInvoices(recurringInvoiceId: number) {
        const sql = `
      SELECT id, number, amount, status, invoice_date, due_date
      FROM invoices WHERE recurring_invoice_id = $1 AND deleted_at IS NULL
      ORDER BY invoice_date ASC
    `;
        return (await query(sql, [recurringInvoiceId])).rows;
    },

    async getTrend(recurringInvoiceId: number, points: number = 8) {
        const sql = `
      SELECT amount FROM invoices
      WHERE recurring_invoice_id = $1 AND deleted_at IS NULL
      ORDER BY invoice_date DESC LIMIT $2
    `;
        const rows = (await query(sql, [recurringInvoiceId, points])).rows;
        return rows.map(r => Number(r.amount)).reverse();
    }
};
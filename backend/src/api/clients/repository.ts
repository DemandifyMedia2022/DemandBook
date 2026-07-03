import { query } from '../../db';

export const clientRepository = {
    findAll: async (filters: { type?: string; status?: string; q?: string }) => {
        let queryText = 'SELECT * FROM clients WHERE deleted_at IS NULL';
        const params: any[] = [];

        if (filters.type) {
            params.push(filters.type);
            queryText += ` AND type = $${params.length}`;
        }
        if (filters.status) {
            params.push(filters.status);
            queryText += ` AND status = $${params.length}`;
        }
        if (filters.q) {
            params.push(`%${filters.q.toLowerCase()}%`);
            queryText += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(display_name) LIKE $${params.length} OR LOWER(custom_id) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
        }

        queryText += ' ORDER BY created_at DESC';
        const result = await query(queryText, params);
        return result.rows;
    },

    findById: async (id: number) => {
        const result = await query('SELECT * FROM clients WHERE id = $1 AND deleted_at IS NULL', [id]);
        return result.rows[0] || null;
    },

    findByCustomId: async (customId: string) => {
        const result = await query('SELECT * FROM clients WHERE custom_id = $1 AND deleted_at IS NULL', [customId]);
        return result.rows[0] || null;
    },

    create: async (data: Record<string, any>) => {
        const columns = Object.keys(data);
        const placeholders = columns.map((_, i) => `$${i + 1}`);
        const values = columns.map((c) => data[c]);

        const insertQuery = `
      INSERT INTO clients (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *;
    `;
        const result = await query(insertQuery, values);
        return result.rows[0];
    },

    update: async (id: number, data: Record<string, any>) => {
        const columns = Object.keys(data);
        if (columns.length === 0) return null;

        const setClause = columns.map((c, i) => `${c} = $${i + 1}`).join(', ');
        const values = columns.map((c) => data[c]);
        values.push(id);

        const updateQuery = `
      UPDATE clients
      SET ${setClause}
      WHERE id = $${values.length} AND deleted_at IS NULL
      RETURNING *;
    `;
        const result = await query(updateQuery, values);
        return result.rows[0] || null;
    },

    softDelete: async (id: number) => {
        const result = await query(
            `UPDATE clients SET deleted_at = NOW(), status = 'Inactive' WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
            [id]
        );
        return result.rows[0] || null;
    },

    hasOpenTransactions: async (id: number) => {
        // Blocks delete if the client has any non-draft, non-cancelled financial history
        const result = await query(
            `SELECT
         (SELECT COUNT(*) FROM invoices WHERE client_id = $1 AND status NOT IN ('Draft', 'Cancelled')) AS invoice_count,
         (SELECT COUNT(*) FROM bills WHERE client_id = $1 AND status != 'Paid') AS bill_count
      `,
            [id]
        );
        const row = result.rows[0];
        return parseInt(row.invoice_count) > 0 || parseInt(row.bill_count) > 0;
    },

    getOutstandingBalance: async (id: number) => {
        // Computed, not stored — source of truth for receivables
        const result = await query(
            `SELECT COALESCE(SUM(balance), 0) AS outstanding
       FROM invoices
       WHERE client_id = $1 AND status NOT IN ('Draft', 'Cancelled')`,
            [id]
        );
        return parseFloat(result.rows[0].outstanding);
    },

    getSummaryCounts: async () => {
        const result = await query(`
      SELECT
        COUNT(id) AS total_count,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) AS active_count
      FROM clients
      WHERE deleted_at IS NULL;
    `);
        return result.rows[0];
    },

    getTotalReceivables: async () => {
        const result = await query(`
      SELECT COALESCE(SUM(balance), 0) AS total_receivables
      FROM invoices
      WHERE status NOT IN ('Draft', 'Cancelled')
      AND client_id IN (SELECT id FROM clients WHERE type = 'customer' AND deleted_at IS NULL);
    `);
        return parseFloat(result.rows[0].total_receivables);
    },
};
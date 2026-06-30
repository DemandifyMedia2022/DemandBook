import { Request, Response } from 'express';
import { query, pool } from '../../db';

export const list = async (req: Request, res: Response) => {
  const { status, q } = req.query;

  try {
    let queryText = `
      SELECT b.*, c.name AS vendor
      FROM bills b
      JOIN clients c ON b.client_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'All') {
      params.push(status);
      queryText += ` AND b.status = $${params.length}`;
    }

    if (q) {
      params.push(`%${(q as string).toLowerCase()}%`);
      queryText += ` AND (LOWER(b.number) LIKE $${params.length} OR LOWER(c.name) LIKE $${params.length})`;
    }

    queryText += ' ORDER BY b.created_at DESC';

    const result = await query(queryText, params);
    return res.status(200).json({ success: true, bills: result.rows });
  } catch (error) {
    console.error('Failed to list bills:', error);
    return res.status(500).json({ success: false, message: 'Database error listing bills.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { number, vendorName, amount, due_date, payment_method, status, other_details } = req.body;

  if (!number || !vendorName || !amount) {
    return res.status(400).json({ success: false, message: 'Bill number, vendor name, and amount are required.' });
  }

  const clientConn = await pool.connect();
  try {
    await clientConn.query('BEGIN');

    // 1. Resolve or create vendor client
    let clientResult = await clientConn.query('SELECT id FROM clients WHERE LOWER(name) = $1 AND type = \'vendor\'', [vendorName.toLowerCase()]);
    let clientId: number;

    if (clientResult.rows.length > 0) {
      clientId = clientResult.rows[0].id;
    } else {
      const newCustomId = `VEND-${Math.floor(1000 + Math.random() * 9000)}`;
      const insertClient = `
        INSERT INTO clients (custom_id, name, email, type, status, balance)
        VALUES ($1, $2, $3, 'vendor', 'Active', 0.00)
        RETURNING id;
      `;
      const clientInsertRes = await clientConn.query(insertClient, [
        newCustomId,
        vendorName,
        'billing@vendor.com',
      ]);
      clientId = clientInsertRes.rows[0].id;
    }

    // 2. Insert bill
    const insertBill = `
      INSERT INTO bills (number, client_id, amount, due_date, payment_method, status, other_details)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const billRes = await clientConn.query(insertBill, [
      number,
      clientId,
      parseFloat(amount),
      due_date || '—',
      payment_method || 'Bank Transfer',
      status || 'Open',
      other_details ? JSON.stringify(other_details) : null
    ]);

    await clientConn.query('COMMIT');
    return res.status(201).json({ success: true, bill: billRes.rows[0] });
  } catch (error: any) {
    await clientConn.query('ROLLBACK');
    console.error('Failed to create bill:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'A bill with this number already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Database error creating bill.' });
  } finally {
    clientConn.release();
  }
};

export const recordPayment = async (req: Request, res: Response) => {
  const { billNumber } = req.body;

  if (!billNumber) {
    return res.status(400).json({ success: false, message: 'Bill number is required to clear payment.' });
  }

  try {
    const formattedDate = new Date().toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const updateQuery = `
      UPDATE bills
      SET status = 'Paid', cleared_date = $1
      WHERE number = $2
      RETURNING *;
    `;
    const result = await query(updateQuery, [formattedDate, billNumber]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    return res.status(200).json({ success: true, bill: result.rows[0] });
  } catch (error) {
    console.error('Failed to clear bill:', error);
    return res.status(500).json({ success: false, message: 'Database error updating bill payment status.' });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query(`
      SELECT b.*, c.name AS vendor_name, c.company_name
      FROM bills b
      JOIN clients c ON b.client_id = c.id
      WHERE b.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    return res.status(200).json({
      success: true,
      bill: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to get bill details:', error);
    return res.status(500).json({ success: false, message: 'Database error getting bill.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { number, vendorName, amount, due_date, payment_method, status, other_details } = req.body;

  const clientConn = await pool.connect();
  try {
    await clientConn.query('BEGIN');

    // 1. Resolve or create vendor client
    let clientResult = await clientConn.query('SELECT id FROM clients WHERE LOWER(name) = $1 AND type = \'vendor\'', [vendorName.toLowerCase()]);
    let clientId: number;

    if (clientResult.rows.length > 0) {
      clientId = clientResult.rows[0].id;
    } else {
      const newCustomId = `VEND-${Math.floor(1000 + Math.random() * 9000)}`;
      const insertClient = `
        INSERT INTO clients (custom_id, name, email, type, status, balance)
        VALUES ($1, $2, $3, 'vendor', 'Active', 0.00)
        RETURNING id;
      `;
      const clientInsertRes = await clientConn.query(insertClient, [
        newCustomId,
        vendorName,
        'billing@vendor.com',
      ]);
      clientId = clientInsertRes.rows[0].id;
    }

    // 2. Update bill record
    const updateQuery = `
      UPDATE bills
      SET number = $1, client_id = $2, amount = $3, due_date = $4, payment_method = $5, status = $6, other_details = $7
      WHERE id = $8
      RETURNING *;
    `;
    const result = await clientConn.query(updateQuery, [
      number,
      clientId,
      parseFloat(amount),
      due_date,
      payment_method,
      status,
      other_details ? JSON.stringify(other_details) : null,
      id
    ]);

    if (result.rows.length === 0) {
      await clientConn.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    await clientConn.query('COMMIT');
    return res.status(200).json({ success: true, bill: result.rows[0] });
  } catch (error) {
    await clientConn.query('ROLLBACK');
    console.error('Failed to update bill:', error);
    return res.status(500).json({ success: false, message: 'Database error updating bill.' });
  } finally {
    clientConn.release();
  }
};

export const deleteBill = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM bills WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }
    return res.status(200).json({ success: true, message: 'Bill deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete bill:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting bill.' });
  }
};

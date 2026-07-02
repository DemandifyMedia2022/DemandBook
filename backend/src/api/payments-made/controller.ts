import { Request, Response } from 'express';
import { query, pool } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT pm.*, c.name as client_name, c.company_name, b.number as bill_number
      FROM payments_made pm
      JOIN clients c ON pm.client_id = c.id
      LEFT JOIN bills b ON pm.bill_id = b.id
      ORDER BY pm.payment_date DESC, pm.created_at DESC
    `);
    return res.status(200).json({ success: true, paymentsMade: result.rows });
  } catch (error) {
    console.error('Failed to list payments made:', error);
    return res.status(500).json({ success: false, message: 'Database error listing payments made.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { 
    custom_id, 
    client_id, 
    bill_id, 
    payment_date, 
    payment_method, 
    amount_paid, 
    reference_number, 
    notes,
    paid_through,
    amount_refunded,
    attachments,
    bill_allocations
  } = req.body;

  if (!custom_id || !client_id || !amount_paid || !payment_method) {
    return res.status(400).json({ success: false, message: 'Payment Custom ID, Client ID, Amount Paid, and Payment Method are required.' });
  }

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    // 1. Update bill status for single bill_id if provided
    if (bill_id) {
      await dbClient.query(`
        UPDATE bills
        SET status = 'Paid', cleared_date = $1
        WHERE id = $2
      `, [payment_date || new Date().toISOString().split('T')[0], bill_id]);
    }

    // 2. Also update status for all bills specified in bill_allocations map
    if (bill_allocations && typeof bill_allocations === 'object') {
      const allocatedBillIds = Object.keys(bill_allocations).map(Number).filter(id => !isNaN(id) && bill_allocations[id] > 0);
      if (allocatedBillIds.length > 0) {
        await dbClient.query(`
          UPDATE bills
          SET status = 'Paid', cleared_date = $1
          WHERE id = ANY($2::int[])
        `, [payment_date || new Date().toISOString().split('T')[0], allocatedBillIds]);
      }
    }

    // 3. Insert payment made record with all fields
    const insertQuery = `
      INSERT INTO payments_made (
        custom_id, client_id, bill_id, payment_date, payment_method, 
        amount_paid, reference_number, notes, paid_through, 
        amount_refunded, attachments, bill_allocations
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    
    const result = await dbClient.query(insertQuery, [
      custom_id,
      client_id,
      bill_id || null,
      payment_date || new Date(),
      payment_method,
      amount_paid,
      reference_number || '',
      notes || '',
      paid_through || 'HDFC Bank Account',
      amount_refunded || 0.00,
      JSON.stringify(attachments || []),
      JSON.stringify(bill_allocations || {})
    ]);

    await dbClient.query('COMMIT');
    return res.status(201).json({ success: true, paymentMade: result.rows[0] });
  } catch (error) {
    console.error('Failed to create payment made:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error recording payment made.' });
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

    const payRes = await dbClient.query('SELECT bill_id FROM payments_made WHERE id = $1', [id]);
    if (payRes.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const payment = payRes.rows[0];

    // Revert bill status to Open if applicable
    if (payment.bill_id) {
      await dbClient.query(`
        UPDATE bills
        SET status = 'Open', cleared_date = NULL
        WHERE id = $1
      `, [payment.bill_id]);
    }

    await dbClient.query('DELETE FROM payments_made WHERE id = $1', [id]);

    await dbClient.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Payment record deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete payment made:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error deleting payment.' });
  } finally {
    (await client).release();
  }
};

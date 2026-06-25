import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT ri.*, i.number as base_invoice_number, c.name as client_name
      FROM recurring_invoices ri
      JOIN invoices i ON ri.base_invoice_id = i.id
      JOIN clients c ON i.client_id = c.id
      ORDER BY ri.created_at DESC
    `);
    return res.status(200).json({ success: true, recurringInvoices: result.rows });
  } catch (error) {
    console.error('Failed to list recurring invoices:', error);
    return res.status(500).json({ success: false, message: 'Database error listing recurring invoices.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { base_invoice_id, frequency, start_date, end_date, next_generation_date, is_active } = req.body;

  if (!base_invoice_id || !frequency || !start_date) {
    return res.status(400).json({ success: false, message: 'Base Invoice ID, Frequency, and Start Date are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO recurring_invoices (base_invoice_id, frequency, start_date, end_date, next_generation_date, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [
      base_invoice_id,
      frequency,
      start_date,
      end_date || null,
      next_generation_date || start_date,
      is_active !== undefined ? is_active : true
    ]);
    return res.status(201).json({ success: true, recurringInvoice: result.rows[0] });
  } catch (error) {
    console.error('Failed to create recurring invoice:', error);
    return res.status(500).json({ success: false, message: 'Database error creating recurring invoice.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { frequency, start_date, end_date, next_generation_date, is_active } = req.body;

  try {
    const result = await query(`
      UPDATE recurring_invoices
      SET frequency = $1, start_date = $2, end_date = $3, next_generation_date = $4, is_active = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *;
    `, [
      frequency,
      start_date,
      end_date || null,
      next_generation_date,
      is_active !== undefined ? is_active : true,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Recurring invoice schedule not found.' });
    }

    return res.status(200).json({ success: true, recurringInvoice: result.rows[0] });
  } catch (error) {
    console.error('Failed to update recurring invoice:', error);
    return res.status(500).json({ success: false, message: 'Database error updating recurring invoice.' });
  }
};

export const deleteRecurring = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM recurring_invoices WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Recurring invoice schedule not found.' });
    }
    return res.status(200).json({ success: true, message: 'Recurring invoice schedule deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete recurring invoice:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting recurring invoice.' });
  }
};

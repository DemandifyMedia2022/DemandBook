import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT cn.*, c.name as client_name, c.company_name
      FROM credit_notes cn
      JOIN clients c ON cn.client_id = c.id
      ORDER BY cn.created_at DESC
    `);
    return res.status(200).json({ success: true, creditNotes: result.rows });
  } catch (error) {
    console.error('Failed to list credit notes:', error);
    return res.status(500).json({ success: false, message: 'Database error listing credit notes.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { credit_note_number, client_id, invoice_id, date, amount, balance, status, reason } = req.body;

  if (!credit_note_number || !client_id || !amount) {
    return res.status(400).json({ success: false, message: 'Credit Note Number, Client ID, and Amount are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO credit_notes (credit_note_number, client_id, invoice_id, date, amount, balance, status, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `, [
      credit_note_number,
      client_id,
      invoice_id || null,
      date || new Date(),
      amount,
      balance !== undefined ? balance : amount,
      status || 'Draft',
      reason || ''
    ]);
    return res.status(201).json({ success: true, creditNote: result.rows[0] });
  } catch (error) {
    console.error('Failed to create credit note:', error);
    return res.status(500).json({ success: false, message: 'Database error creating credit note.' });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query(`
      SELECT cn.*, c.name as client_name, c.company_name, c.email as client_email, i.number as invoice_number
      FROM credit_notes cn
      JOIN clients c ON cn.client_id = c.id
      LEFT JOIN invoices i ON cn.invoice_id = i.id
      WHERE cn.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Credit note not found.' });
    }

    return res.status(200).json({ success: true, creditNote: result.rows[0] });
  } catch (error) {
    console.error('Failed to get credit note details:', error);
    return res.status(500).json({ success: false, message: 'Database error getting credit note.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { credit_note_number, client_id, invoice_id, date, amount, balance, status, reason } = req.body;

  try {
    const result = await query(`
      UPDATE credit_notes
      SET credit_note_number = $1, client_id = $2, invoice_id = $3, date = $4, amount = $5, balance = $6, status = $7, reason = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *;
    `, [
      credit_note_number,
      client_id,
      invoice_id || null,
      date,
      amount,
      balance,
      status || 'Draft',
      reason || '',
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Credit note not found.' });
    }

    return res.status(200).json({ success: true, creditNote: result.rows[0] });
  } catch (error) {
    console.error('Failed to update credit note:', error);
    return res.status(500).json({ success: false, message: 'Database error updating credit note.' });
  }
};

export const deleteCreditNote = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM credit_notes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Credit note not found.' });
    }
    return res.status(200).json({ success: true, message: 'Credit note deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete credit note:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting credit note.' });
  }
};

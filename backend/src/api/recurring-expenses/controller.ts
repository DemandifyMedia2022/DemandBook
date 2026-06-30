import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM recurring_expenses ORDER BY created_at DESC');
    return res.status(200).json({ success: true, recurringExpenses: result.rows });
  } catch (error) {
    console.error('Failed to list recurring expenses:', error);
    return res.status(500).json({ success: false, message: 'Database error listing recurring expenses.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { merchant, category, amount, frequency, next_date, is_active, other_details } = req.body;

  if (!merchant || !category || !amount || !frequency || !next_date) {
    return res.status(400).json({ success: false, message: 'Merchant, Category, Amount, Frequency, and Next Date are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO recurring_expenses (merchant, category, amount, frequency, next_date, is_active, other_details)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `, [
      merchant,
      category,
      amount,
      frequency,
      next_date,
      is_active !== undefined ? is_active : true,
      other_details ? JSON.stringify(other_details) : null
    ]);
    return res.status(201).json({ success: true, recurringExpense: result.rows[0] });
  } catch (error) {
    console.error('Failed to create recurring expense:', error);
    return res.status(500).json({ success: false, message: 'Database error creating recurring expense.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { merchant, category, amount, frequency, next_date, is_active, other_details } = req.body;

  try {
    const result = await query(`
      UPDATE recurring_expenses
      SET merchant = $1, category = $2, amount = $3, frequency = $4, next_date = $5, is_active = $6, other_details = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING *;
    `, [
      merchant,
      category,
      amount,
      frequency,
      next_date,
      is_active !== undefined ? is_active : true,
      other_details ? JSON.stringify(other_details) : null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Recurring expense template not found.' });
    }

    return res.status(200).json({ success: true, recurringExpense: result.rows[0] });
  } catch (error) {
    console.error('Failed to update recurring expense:', error);
    return res.status(500).json({ success: false, message: 'Database error updating recurring expense.' });
  }
};

export const deleteRecurring = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM recurring_expenses WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Recurring expense template not found.' });
    }
    return res.status(200).json({ success: true, message: 'Recurring expense template deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete recurring expense:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting recurring expense.' });
  }
};

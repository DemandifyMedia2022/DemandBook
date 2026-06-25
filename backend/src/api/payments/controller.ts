import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  const { category, status, q } = req.query;

  try {
    let queryText = 'SELECT * FROM payments WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'All') {
      params.push(category);
      queryText += ` AND category = $${params.length}`;
    }

    if (status && status !== 'All') {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }

    if (q) {
      params.push(`%${(q as string).toLowerCase()}%`);
      queryText += ` AND (LOWER(merchant) LIKE $${params.length} OR LOWER(custom_id) LIKE $${params.length})`;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return res.status(200).json({ success: true, expenses: result.rows });
  } catch (error) {
    console.error('Failed to list payments/expenses:', error);
    return res.status(500).json({ success: false, message: 'Database error listing payments.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { custom_id, merchant, category, date, amount, status } = req.body;

  if (!custom_id || !merchant || !category || !amount) {
    return res.status(400).json({ success: false, message: 'ID, Merchant, Category, and Amount are required.' });
  }

  try {
    const insertQuery = `
      INSERT INTO payments (custom_id, merchant, category, date, amount, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const params = [
      custom_id,
      merchant,
      category,
      date || 'Today',
      parseFloat(amount),
      status || 'Draft'
    ];

    const result = await query(insertQuery, params);
    return res.status(201).json({ success: true, expense: result.rows[0] });
  } catch (error: any) {
    console.error('Failed to create payment/expense:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'An expense with this ID already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Database error logging expense.' });
  }
};

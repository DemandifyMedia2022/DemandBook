import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  const { status, q } = req.query;

  try {
    let queryText = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'All') {
      params.push((status as string).toLowerCase());
      queryText += ` AND LOWER(status) = $${params.length}`;
    }

    if (q) {
      params.push(`%${(q as string).toLowerCase()}%`);
      queryText += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(custom_id) LIKE $${params.length})`;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return res.status(200).json({ success: true, products: result.rows });
  } catch (error) {
    console.error('Failed to list products:', error);
    return res.status(500).json({ success: false, message: 'Database error listing products.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { custom_id, name, category, price, status, stock } = req.body;

  if (!custom_id || !name || !price) {
    return res.status(400).json({ success: false, message: 'Product ID, Name, and Price are required.' });
  }

  try {
    const insertQuery = `
      INSERT INTO products (custom_id, name, category, price, status, stock)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const params = [
      custom_id,
      name,
      category || 'General',
      parseFloat(price),
      status || 'in stock',
      stock ? parseInt(stock) : 0
    ];

    const result = await query(insertQuery, params);
    return res.status(201).json({ success: true, product: result.rows[0] });
  } catch (error: any) {
    console.error('Failed to create product:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'A product with this ID already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Database error creating product.' });
  }
};

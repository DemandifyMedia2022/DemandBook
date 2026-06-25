import { Request, Response } from 'express';
import { query, pool } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT q.*, c.name as client_name, c.company_name
      FROM quotes q
      JOIN clients c ON q.client_id = c.id
      ORDER BY q.created_at DESC
    `);
    return res.status(200).json({ success: true, quotes: result.rows });
  } catch (error) {
    console.error('Failed to list quotes:', error);
    return res.status(500).json({ success: false, message: 'Database error listing quotes.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { quote_number, client_id, quote_date, expiry_date, items, sub_total, discount_total, tax_total, amount, status, customer_notes, terms_conditions } = req.body;

  if (!quote_number || !client_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Quote Number, Client ID, and items are required.' });
  }

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    const quoteQuery = `
      INSERT INTO quotes (quote_number, client_id, quote_date, expiry_date, sub_total, discount_total, tax_total, amount, status, customer_notes, terms_conditions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const quoteParams = [
      quote_number,
      client_id,
      quote_date || new Date(),
      expiry_date || null,
      sub_total || 0,
      discount_total || 0,
      tax_total || 0,
      amount || 0,
      status || 'Draft',
      customer_notes || '',
      terms_conditions || ''
    ];

    const quoteRes = await dbClient.query(quoteQuery, quoteParams);
    const newQuote = quoteRes.rows[0];

    const itemQuery = `
      INSERT INTO quote_items (quote_id, product_id, description, quantity, unit, rate, discount, tax_rate, amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `;

    for (const item of items) {
      await dbClient.query(itemQuery, [
        newQuote.id,
        item.product_id || null,
        item.description || '',
        item.quantity || 1,
        item.unit || '',
        item.rate || 0,
        item.discount || 0,
        item.tax_rate || 0,
        item.amount || 0
      ]);
    }

    await dbClient.query('COMMIT');
    return res.status(201).json({ success: true, quote: newQuote });
  } catch (error) {
    console.error('Failed to create quote:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error creating quote.' });
  } finally {
    (await client).release();
  }
};

export const getDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const quoteRes = await query(`
      SELECT q.*, c.name as client_name, c.company_name, c.email as client_email, c.phone as client_phone
      FROM quotes q
      JOIN clients c ON q.client_id = c.id
      WHERE q.id = $1
    `, [id]);

    if (quoteRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quote not found.' });
    }

    const itemsRes = await query(`
      SELECT qi.*, p.name as product_name
      FROM quote_items qi
      LEFT JOIN products p ON qi.product_id = p.id
      WHERE qi.quote_id = $1
    `, [id]);

    return res.status(200).json({
      success: true,
      quote: quoteRes.rows[0],
      items: itemsRes.rows
    });
  } catch (error) {
    console.error('Failed to get quote details:', error);
    return res.status(500).json({ success: false, message: 'Database error getting quote.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quote_number, client_id, quote_date, expiry_date, items, sub_total, discount_total, tax_total, amount, status, customer_notes, terms_conditions } = req.body;

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    const updateQuoteQuery = `
      UPDATE quotes
      SET quote_number = $1, client_id = $2, quote_date = $3, expiry_date = $4, sub_total = $5, discount_total = $6, tax_total = $7, amount = $8, status = $9, customer_notes = $10, terms_conditions = $11, updated_at = NOW()
      WHERE id = $12
      RETURNING *;
    `;

    const quoteRes = await dbClient.query(updateQuoteQuery, [
      quote_number,
      client_id,
      quote_date,
      expiry_date || null,
      sub_total || 0,
      discount_total || 0,
      tax_total || 0,
      amount || 0,
      status || 'Draft',
      customer_notes || '',
      terms_conditions || '',
      id
    ]);

    if (quoteRes.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Quote not found.' });
    }

    if (items && Array.isArray(items)) {
      // Delete old items
      await dbClient.query('DELETE FROM quote_items WHERE quote_id = $1', [id]);

      // Re-insert items
      const itemQuery = `
        INSERT INTO quote_items (quote_id, product_id, description, quantity, unit, rate, discount, tax_rate, amount)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `;

      for (const item of items) {
        await dbClient.query(itemQuery, [
          id,
          item.product_id || null,
          item.description || '',
          item.quantity || 1,
          item.unit || '',
          item.rate || 0,
          item.discount || 0,
          item.tax_rate || 0,
          item.amount || 0
        ]);
      }
    }

    await dbClient.query('COMMIT');
    return res.status(200).json({ success: true, quote: quoteRes.rows[0] });
  } catch (error) {
    console.error('Failed to update quote:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error updating quote.' });
  } finally {
    (await client).release();
  }
};

export const deleteQuote = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM quotes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quote not found.' });
    }
    return res.status(200).json({ success: true, message: 'Quote deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete quote:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting quote.' });
  }
};

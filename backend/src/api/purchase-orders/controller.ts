import { Request, Response } from 'express';
import { query, pool } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT po.*, c.name as client_name, c.company_name
      FROM purchase_orders po
      JOIN clients c ON po.client_id = c.id
      ORDER BY po.created_at DESC
    `);
    return res.status(200).json({ success: true, purchaseOrders: result.rows });
  } catch (error) {
    console.error('Failed to list purchase orders:', error);
    return res.status(500).json({ success: false, message: 'Database error listing purchase orders.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { po_number, client_id, date, delivery_date, items, sub_total, tax_total, amount, status, notes } = req.body;

  if (!po_number || !client_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Purchase Order Number, Vendor ID (client_id), and items are required.' });
  }

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    const poQuery = `
      INSERT INTO purchase_orders (po_number, client_id, date, delivery_date, sub_total, tax_total, amount, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const poParams = [
      po_number,
      client_id,
      date || new Date(),
      delivery_date || null,
      sub_total || 0,
      tax_total || 0,
      amount || 0,
      status || 'Draft',
      notes || ''
    ];

    const poRes = await dbClient.query(poQuery, poParams);
    const newPO = poRes.rows[0];

    const itemQuery = `
      INSERT INTO purchase_order_items (purchase_order_id, product_id, description, quantity, unit, rate, tax_rate, amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;

    for (const item of items) {
      await dbClient.query(itemQuery, [
        newPO.id,
        item.product_id || null,
        item.description || '',
        item.quantity || 1,
        item.unit || '',
        item.rate || 0,
        item.tax_rate || 0,
        item.amount || 0
      ]);
    }

    await dbClient.query('COMMIT');
    return res.status(201).json({ success: true, purchaseOrder: newPO });
  } catch (error) {
    console.error('Failed to create purchase order:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error creating purchase order.' });
  } finally {
    (await client).release();
  }
};

export const getDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const poRes = await query(`
      SELECT po.*, c.name as client_name, c.company_name, c.email as client_email, c.phone as client_phone
      FROM purchase_orders po
      JOIN clients c ON po.client_id = c.id
      WHERE po.id = $1
    `, [id]);

    if (poRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    const itemsRes = await query(`
      SELECT poi.*, p.name as product_name
      FROM purchase_order_items poi
      LEFT JOIN products p ON poi.product_id = p.id
      WHERE poi.purchase_order_id = $1
    `, [id]);

    return res.status(200).json({
      success: true,
      purchaseOrder: poRes.rows[0],
      items: itemsRes.rows
    });
  } catch (error) {
    console.error('Failed to get purchase order details:', error);
    return res.status(500).json({ success: false, message: 'Database error getting purchase order.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { po_number, client_id, date, delivery_date, items, sub_total, tax_total, amount, status, notes } = req.body;

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    const updatePOQuery = `
      UPDATE purchase_orders
      SET po_number = $1, client_id = $2, date = $3, delivery_date = $4, sub_total = $5, tax_total = $6, amount = $7, status = $8, notes = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING *;
    `;

    const poRes = await dbClient.query(updatePOQuery, [
      po_number,
      client_id,
      date,
      delivery_date || null,
      sub_total || 0,
      tax_total || 0,
      amount || 0,
      status || 'Draft',
      notes || '',
      id
    ]);

    if (poRes.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    if (items && Array.isArray(items)) {
      await dbClient.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [id]);

      const itemQuery = `
        INSERT INTO purchase_order_items (purchase_order_id, product_id, description, quantity, unit, rate, tax_rate, amount)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `;

      for (const item of items) {
        await dbClient.query(itemQuery, [
          id,
          item.product_id || null,
          item.description || '',
          item.quantity || 1,
          item.unit || '',
          item.rate || 0,
          item.tax_rate || 0,
          item.amount || 0
        ]);
      }
    }

    await dbClient.query('COMMIT');
    return res.status(200).json({ success: true, purchaseOrder: poRes.rows[0] });
  } catch (error) {
    console.error('Failed to update purchase order:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error updating purchase order.' });
  } finally {
    (await client).release();
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM purchase_orders WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }
    return res.status(200).json({ success: true, message: 'Purchase order deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete purchase order:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting purchase order.' });
  }
};

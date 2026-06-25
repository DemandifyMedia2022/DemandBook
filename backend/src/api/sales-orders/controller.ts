import { Request, Response } from 'express';
import { query, pool } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT so.*, c.name as client_name, c.company_name
      FROM sales_orders so
      JOIN clients c ON so.client_id = c.id
      ORDER BY so.created_at DESC
    `);
    return res.status(200).json({ success: true, salesOrders: result.rows });
  } catch (error) {
    console.error('Failed to list sales orders:', error);
    return res.status(500).json({ success: false, message: 'Database error listing sales orders.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { order_number, client_id, order_date, shipment_date, items, sub_total, discount_total, tax_total, amount, status, customer_notes, terms_conditions } = req.body;

  if (!order_number || !client_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order Number, Client ID, and items are required.' });
  }

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    const orderQuery = `
      INSERT INTO sales_orders (order_number, client_id, order_date, shipment_date, sub_total, discount_total, tax_total, amount, status, customer_notes, terms_conditions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const orderParams = [
      order_number,
      client_id,
      order_date || new Date(),
      shipment_date || null,
      sub_total || 0,
      discount_total || 0,
      tax_total || 0,
      amount || 0,
      status || 'Draft',
      customer_notes || '',
      terms_conditions || ''
    ];

    const orderRes = await dbClient.query(orderQuery, orderParams);
    const newOrder = orderRes.rows[0];

    const itemQuery = `
      INSERT INTO sales_order_items (sales_order_id, product_id, description, quantity, unit, rate, discount, tax_rate, amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `;

    for (const item of items) {
      await dbClient.query(itemQuery, [
        newOrder.id,
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
    return res.status(201).json({ success: true, salesOrder: newOrder });
  } catch (error) {
    console.error('Failed to create sales order:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error creating sales order.' });
  } finally {
    (await client).release();
  }
};

export const getDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const orderRes = await query(`
      SELECT so.*, c.name as client_name, c.company_name, c.email as client_email, c.phone as client_phone
      FROM sales_orders so
      JOIN clients c ON so.client_id = c.id
      WHERE so.id = $1
    `, [id]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales order not found.' });
    }

    const itemsRes = await query(`
      SELECT soi.*, p.name as product_name
      FROM sales_order_items soi
      LEFT JOIN products p ON soi.product_id = p.id
      WHERE soi.sales_order_id = $1
    `, [id]);

    return res.status(200).json({
      success: true,
      salesOrder: orderRes.rows[0],
      items: itemsRes.rows
    });
  } catch (error) {
    console.error('Failed to get sales order details:', error);
    return res.status(500).json({ success: false, message: 'Database error getting sales order.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { order_number, client_id, order_date, shipment_date, items, sub_total, discount_total, tax_total, amount, status, customer_notes, terms_conditions } = req.body;

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    const updateOrderQuery = `
      UPDATE sales_orders
      SET order_number = $1, client_id = $2, order_date = $3, shipment_date = $4, sub_total = $5, discount_total = $6, tax_total = $7, amount = $8, status = $9, customer_notes = $10, terms_conditions = $11, updated_at = NOW()
      WHERE id = $12
      RETURNING *;
    `;

    const orderRes = await dbClient.query(updateOrderQuery, [
      order_number,
      client_id,
      order_date,
      shipment_date || null,
      sub_total || 0,
      discount_total || 0,
      tax_total || 0,
      amount || 0,
      status || 'Draft',
      customer_notes || '',
      terms_conditions || '',
      id
    ]);

    if (orderRes.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Sales order not found.' });
    }

    if (items && Array.isArray(items)) {
      await dbClient.query('DELETE FROM sales_order_items WHERE sales_order_id = $1', [id]);

      const itemQuery = `
        INSERT INTO sales_order_items (sales_order_id, product_id, description, quantity, unit, rate, discount, tax_rate, amount)
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
    return res.status(200).json({ success: true, salesOrder: orderRes.rows[0] });
  } catch (error) {
    console.error('Failed to update sales order:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error updating sales order.' });
  } finally {
    (await client).release();
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM sales_orders WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales order not found.' });
    }
    return res.status(200).json({ success: true, message: 'Sales order deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete sales order:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting sales order.' });
  }
};

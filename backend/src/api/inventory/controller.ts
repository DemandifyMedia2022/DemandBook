import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    // 1. Fetch adjustments
    const adjResult = await query('SELECT * FROM inventory_adjustments ORDER BY created_at DESC');
    const adjustments = adjResult.rows;

    if (adjustments.length === 0) {
      return res.status(200).json({ success: true, adjustments: [] });
    }

    // 2. Fetch items with product names
    const itemsResult = await query(`
      SELECT iai.*, p.name as product_name, p.custom_id as product_sku
      FROM inventory_adjustment_items iai
      JOIN products p ON iai.product_id = p.id
    `);
    const items = itemsResult.rows;

    // 3. Fetch attachments
    const attachResult = await query('SELECT id, adjustment_id, file_name FROM inventory_adjustment_attachments');
    const attachments = attachResult.rows;

    // 4. Map them together
    const mapped = adjustments.map((adj) => {
      return {
        ...adj,
        items: items.filter((item) => item.adjustment_id === adj.id),
        attachments: attachments.filter((att) => att.adjustment_id === adj.id),
      };
    });

    return res.status(200).json({ success: true, adjustments: mapped });
  } catch (error) {
    console.error('Failed to list inventory adjustments:', error);
    return res.status(500).json({ success: false, message: 'Database error listing adjustments.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const {
    mode,
    reference_number,
    adjustment_date,
    account_name,
    reason,
    description,
    status,
    items,       // Array of { product_id, quantity_available, new_quantity_on_hand, quantity_adjusted, value_adjusted }
    attachments  // Array of { file_name, file_data } (file_data is base64 string)
  } = req.body;

  if (!mode || !reference_number || !reason || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Required fields are missing.' });
  }

  try {
    // Start transaction
    await query('BEGIN');

    // 1. Insert inventory adjustment header
    const insertAdjQuery = `
      INSERT INTO inventory_adjustments (mode, reference_number, adjustment_date, account_name, reason, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const adjParams = [
      mode,
      reference_number,
      adjustment_date || new Date().toISOString().split('T')[0],
      account_name || null,
      reason,
      description || null,
      status || 'Approved'
    ];

    const adjRes = await query(insertAdjQuery, adjParams);
    const newAdj = adjRes.rows[0];

    // 2. Loop and insert items, and update products stock
    for (const item of items) {
      const { product_id, quantity_available, new_quantity_on_hand, quantity_adjusted, value_adjusted } = item;
      
      const insertItemQuery = `
        INSERT INTO inventory_adjustment_items (adjustment_id, product_id, quantity_available, new_quantity_on_hand, quantity_adjusted, value_adjusted)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      const itemParams = [
        newAdj.id,
        parseInt(product_id),
        parseFloat(quantity_available),
        parseFloat(new_quantity_on_hand),
        parseFloat(quantity_adjusted),
        value_adjusted ? parseFloat(value_adjusted) : 0.00
      ];
      await query(insertItemQuery, itemParams);

      // If status is Approved, modify the stock in products table
      if (newAdj.status === 'Approved') {
        const newStock = parseFloat(new_quantity_on_hand);
        const derivedStatus = newStock === 0 ? 'out of stock' : newStock < 20 ? 'low stock' : 'in stock';
        
        await query(
          'UPDATE products SET stock = $1, status = $2 WHERE id = $3',
          [newStock, derivedStatus, parseInt(product_id)]
        );
      }
    }

    // 3. Insert attachments if provided
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        const { file_name, file_data } = att;
        if (file_name && file_data) {
          const insertAttachQuery = `
            INSERT INTO inventory_adjustment_attachments (adjustment_id, file_name, file_data)
            VALUES ($1, $2, $3);
          `;
          await query(insertAttachQuery, [newAdj.id, file_name, file_data]);
        }
      }
    }

    // Commit transaction
    await query('COMMIT');

    return res.status(201).json({ success: true, adjustment: newAdj });
  } catch (error: any) {
    // Rollback transaction on failure
    await query('ROLLBACK');
    console.error('Failed to create inventory adjustment:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Adjustment reference number already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Database error recording adjustment.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    mode,
    reference_number,
    adjustment_date,
    account_name,
    reason,
    description,
    status,
    items,       // Array of { product_id, quantity_available, new_quantity_on_hand, quantity_adjusted, value_adjusted }
    attachments  // Array of { file_name, file_data } (file_data is base64 string)
  } = req.body;

  if (!id || !mode || !reference_number || !reason || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Required fields are missing.' });
  }

  try {
    await query('BEGIN');

    // 1. Fetch old items to revert stock
    const oldItemsRes = await query('SELECT * FROM inventory_adjustment_items WHERE adjustment_id = $1', [id]);
    const oldItems = oldItemsRes.rows;

    for (const oldItem of oldItems) {
      // Revert old stock change: stock = stock - old_quantity_adjusted
      const revertRes = await query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING stock',
        [parseFloat(oldItem.quantity_adjusted), parseInt(oldItem.product_id)]
      );
      if (revertRes.rows.length > 0) {
        const revertedStock = parseFloat(revertRes.rows[0].stock);
        const derivedStatus = revertedStock === 0 ? 'out of stock' : revertedStock < 20 ? 'low stock' : 'in stock';
        await query('UPDATE products SET status = $1 WHERE id = $2', [derivedStatus, parseInt(oldItem.product_id)]);
      }
    }

    // 2. Clear old items and attachments
    await query('DELETE FROM inventory_adjustment_items WHERE adjustment_id = $1', [id]);
    await query('DELETE FROM inventory_adjustment_attachments WHERE adjustment_id = $1', [id]);

    // 3. Update adjustment header
    const updateHeaderQuery = `
      UPDATE inventory_adjustments
      SET mode = $1, reference_number = $2, adjustment_date = $3, account_name = $4, reason = $5, description = $6, status = $7
      WHERE id = $8
      RETURNING *;
    `;
    const headerParams = [
      mode,
      reference_number,
      adjustment_date,
      account_name || null,
      reason,
      description || null,
      status || 'Approved',
      id
    ];
    const headerRes = await query(updateHeaderQuery, headerParams);
    if (headerRes.rows.length === 0) {
      throw new Error('Adjustment not found.');
    }
    const updatedAdj = headerRes.rows[0];

    // 4. Insert new items and apply new stock level
    for (const item of items) {
      const { product_id, quantity_available, new_quantity_on_hand, quantity_adjusted, value_adjusted } = item;
      
      const insertItemQuery = `
        INSERT INTO inventory_adjustment_items (adjustment_id, product_id, quantity_available, new_quantity_on_hand, quantity_adjusted, value_adjusted)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      const itemParams = [
        id,
        parseInt(product_id),
        parseFloat(quantity_available),
        parseFloat(new_quantity_on_hand),
        parseFloat(quantity_adjusted),
        value_adjusted ? parseFloat(value_adjusted) : 0.00
      ];
      await query(insertItemQuery, itemParams);

      if (updatedAdj.status === 'Approved') {
        const newStock = parseFloat(new_quantity_on_hand);
        const derivedStatus = newStock === 0 ? 'out of stock' : newStock < 20 ? 'low stock' : 'in stock';
        await query(
          'UPDATE products SET stock = $1, status = $2 WHERE id = $3',
          [newStock, derivedStatus, parseInt(product_id)]
        );
      }
    }

    // 5. Re-insert attachments if provided
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        const { file_name, file_data } = att;
        if (file_name && file_data) {
          // If file_data contains the full base64 string, insert it
          const insertAttachQuery = `
            INSERT INTO inventory_adjustment_attachments (adjustment_id, file_name, file_data)
            VALUES ($1, $2, $3);
          `;
          await query(insertAttachQuery, [id, file_name, file_data]);
        }
      }
    }

    await query('COMMIT');
    return res.status(200).json({ success: true, adjustment: updatedAdj });
  } catch (error: any) {
    await query('ROLLBACK');
    console.error('Failed to update inventory adjustment:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Adjustment reference number already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Database error updating adjustment.' });
  }
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID parameter is required.' });
  }

  try {
    await query('BEGIN');

    // 1. Fetch old items to revert stock
    const oldItemsRes = await query('SELECT * FROM inventory_adjustment_items WHERE adjustment_id = $1', [id]);
    const oldItems = oldItemsRes.rows;

    for (const oldItem of oldItems) {
      // Revert old stock change: stock = stock - old_quantity_adjusted
      const revertRes = await query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING stock',
        [parseFloat(oldItem.quantity_adjusted), parseInt(oldItem.product_id)]
      );
      if (revertRes.rows.length > 0) {
        const revertedStock = parseFloat(revertRes.rows[0].stock);
        const derivedStatus = revertedStock === 0 ? 'out of stock' : revertedStock < 20 ? 'low stock' : 'in stock';
        await query('UPDATE products SET status = $1 WHERE id = $2', [derivedStatus, parseInt(oldItem.product_id)]);
      }
    }

    // 2. Delete the adjustment header (cascade deletes items and attachments)
    const deleteRes = await query('DELETE FROM inventory_adjustments WHERE id = $1 RETURNING *', [id]);
    if (deleteRes.rows.length === 0) {
      throw new Error('Adjustment not found.');
    }

    await query('COMMIT');
    return res.status(200).json({ success: true, message: 'Successfully deleted adjustment.' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Failed to delete inventory adjustment:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting adjustment.' });
  }
};

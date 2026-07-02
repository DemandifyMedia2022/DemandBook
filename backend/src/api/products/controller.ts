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
  const {
    custom_id, name, category, price, status, stock,
    type, unit, hsn_code, tax_preference, image_url,
    selling_price, sales_account, sales_description,
    cost_price, purchase_account, purchase_description,
    preferred_vendor_id, intra_state_tax_rate, inter_state_tax_rate,
    track_inventory
  } = req.body;

  if (!custom_id || !name || price === undefined) {
    return res.status(400).json({ success: false, message: 'Product ID, Name, and Selling Price (price) are required.' });
  }

  try {
    const insertQuery = `
      INSERT INTO products (
        custom_id, name, category, price, status, stock,
        type, unit, hsn_code, tax_preference, image_url,
        selling_price, sales_account, sales_description,
        cost_price, purchase_account, purchase_description,
        preferred_vendor_id, intra_state_tax_rate, inter_state_tax_rate,
        track_inventory
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *;
    `;
    const params = [
      custom_id,
      name,
      category || 'General',
      parseFloat(price),
      status || 'in stock',
      stock ? parseInt(stock) : 0,
      type || 'Goods',
      unit || 'pcs',
      hsn_code || null,
      tax_preference || 'Taxable',
      image_url || null,
      selling_price !== undefined ? parseFloat(selling_price) : parseFloat(price),
      sales_account || null,
      sales_description || null,
      cost_price !== undefined ? parseFloat(cost_price) : 0.00,
      purchase_account || null,
      purchase_description || null,
      preferred_vendor_id && preferred_vendor_id !== '' ? parseInt(preferred_vendor_id) : null,
      intra_state_tax_rate || 'GST18 (18 %)',
      inter_state_tax_rate || 'IGST18 (18 %)',
      track_inventory !== undefined ? track_inventory : true
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

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    custom_id, name, category, price, status, stock,
    type, unit, hsn_code, tax_preference, image_url,
    selling_price, sales_account, sales_description,
    cost_price, purchase_account, purchase_description,
    preferred_vendor_id, intra_state_tax_rate, inter_state_tax_rate,
    track_inventory
  } = req.body;

  try {
    // Check if product exists
    const checkRes = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updateQuery = `
      UPDATE products
      SET 
        custom_id = COALESCE($1, custom_id),
        name = COALESCE($2, name),
        category = COALESCE($3, category),
        price = COALESCE($4, price),
        status = COALESCE($5, status),
        stock = COALESCE($6, stock),
        type = COALESCE($7, type),
        unit = COALESCE($8, unit),
        hsn_code = COALESCE($9, hsn_code),
        tax_preference = COALESCE($10, tax_preference),
        image_url = COALESCE($11, image_url),
        selling_price = COALESCE($12, selling_price),
        sales_account = COALESCE($13, sales_account),
        sales_description = COALESCE($14, sales_description),
        cost_price = COALESCE($15, cost_price),
        purchase_account = COALESCE($16, purchase_account),
        purchase_description = COALESCE($17, purchase_description),
        preferred_vendor_id = COALESCE($18, preferred_vendor_id),
        intra_state_tax_rate = COALESCE($19, intra_state_tax_rate),
        inter_state_tax_rate = COALESCE($20, inter_state_tax_rate),
        track_inventory = COALESCE($21, track_inventory),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $22
      RETURNING *;
    `;

    const params = [
      custom_id !== undefined ? custom_id : null,
      name !== undefined ? name : null,
      category !== undefined ? category : null,
      price !== undefined ? parseFloat(price) : null,
      status !== undefined ? status : null,
      stock !== undefined ? parseInt(stock) : null,
      type !== undefined ? type : null,
      unit !== undefined ? unit : null,
      hsn_code !== undefined ? hsn_code : null,
      tax_preference !== undefined ? tax_preference : null,
      image_url !== undefined ? image_url : null,
      selling_price !== undefined ? parseFloat(selling_price) : null,
      sales_account !== undefined ? sales_account : null,
      sales_description !== undefined ? sales_description : null,
      cost_price !== undefined ? parseFloat(cost_price) : null,
      purchase_account !== undefined ? purchase_account : null,
      purchase_description !== undefined ? purchase_description : null,
      preferred_vendor_id !== undefined && preferred_vendor_id !== '' && preferred_vendor_id !== null ? parseInt(preferred_vendor_id) : null,
      intra_state_tax_rate !== undefined ? intra_state_tax_rate : null,
      inter_state_tax_rate !== undefined ? inter_state_tax_rate : null,
      track_inventory !== undefined ? track_inventory : null,
      parseInt(id)
    ];

    const result = await query(updateQuery, params);
    return res.status(200).json({ success: true, product: result.rows[0] });
  } catch (error: any) {
    console.error('Failed to update product:', error);
    return res.status(500).json({ success: false, message: 'Database error updating product.' });
  }
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [parseInt(id)]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting product.' });
  }
};

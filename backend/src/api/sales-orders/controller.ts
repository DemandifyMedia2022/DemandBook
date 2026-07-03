// import { Request, Response } from 'express';
// import { query, pool } from '../../db';

// export const list = async (req: Request, res: Response) => {
//   try {
//     const result = await query(`
//       SELECT so.*, c.name as client_name, c.company_name
//       FROM sales_orders so
//       JOIN clients c ON so.client_id = c.id
//       ORDER BY so.created_at DESC
//     `);
//     return res.status(200).json({ success: true, salesOrders: result.rows });
//   } catch (error) {
//     console.error('Failed to list sales orders:', error);
//     return res.status(500).json({ success: false, message: 'Database error listing sales orders.' });
//   }
// };

// export const create = async (req: Request, res: Response) => {
//   const { order_number, client_id, order_date, shipment_date, items, sub_total, discount_total, tax_total, amount, status, customer_notes, terms_conditions } = req.body;

//   if (!order_number || !client_id || !items || !Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({ success: false, message: 'Order Number, Client ID, and items are required.' });
//   }

//   const client = pool.connect();
//   try {
//     const dbClient = await client;
//     await dbClient.query('BEGIN');

//     const orderQuery = `
//       INSERT INTO sales_orders (order_number, client_id, order_date, shipment_date, sub_total, discount_total, tax_total, amount, status, customer_notes, terms_conditions)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
//       RETURNING *;
//     `;
//     const orderParams = [
//       order_number,
//       client_id,
//       order_date || new Date(),
//       shipment_date || null,
//       sub_total || 0,
//       discount_total || 0,
//       tax_total || 0,
//       amount || 0,
//       status || 'Draft',
//       customer_notes || '',
//       terms_conditions || ''
//     ];

//     const orderRes = await dbClient.query(orderQuery, orderParams);
//     const newOrder = orderRes.rows[0];

//     const itemQuery = `
//       INSERT INTO sales_order_items (sales_order_id, product_id, description, quantity, unit, rate, discount, tax_rate, amount)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
//     `;

//     for (const item of items) {
//       await dbClient.query(itemQuery, [
//         newOrder.id,
//         item.product_id || null,
//         item.description || '',
//         item.quantity || 1,
//         item.unit || '',
//         item.rate || 0,
//         item.discount || 0,
//         item.tax_rate || 0,
//         item.amount || 0
//       ]);
//     }

//     await dbClient.query('COMMIT');
//     return res.status(201).json({ success: true, salesOrder: newOrder });
//   } catch (error) {
//     console.error('Failed to create sales order:', error);
//     try {
//       await (await client).query('ROLLBACK');
//     } catch (_) {}
//     return res.status(500).json({ success: false, message: 'Database error creating sales order.' });
//   } finally {
//     (await client).release();
//   }
// };

// export const getDetails = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const orderRes = await query(`
//       SELECT so.*, c.name as client_name, c.company_name, c.email as client_email, c.phone as client_phone
//       FROM sales_orders so
//       JOIN clients c ON so.client_id = c.id
//       WHERE so.id = $1
//     `, [id]);

//     if (orderRes.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Sales order not found.' });
//     }

//     const itemsRes = await query(`
//       SELECT soi.*, p.name as product_name
//       FROM sales_order_items soi
//       LEFT JOIN products p ON soi.product_id = p.id
//       WHERE soi.sales_order_id = $1
//     `, [id]);

//     return res.status(200).json({
//       success: true,
//       salesOrder: orderRes.rows[0],
//       items: itemsRes.rows
//     });
//   } catch (error) {
//     console.error('Failed to get sales order details:', error);
//     return res.status(500).json({ success: false, message: 'Database error getting sales order.' });
//   }
// };

// export const update = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { order_number, client_id, order_date, shipment_date, items, sub_total, discount_total, tax_total, amount, status, customer_notes, terms_conditions } = req.body;

//   const client = pool.connect();
//   try {
//     const dbClient = await client;
//     await dbClient.query('BEGIN');

//     const updateOrderQuery = `
//       UPDATE sales_orders
//       SET order_number = $1, client_id = $2, order_date = $3, shipment_date = $4, sub_total = $5, discount_total = $6, tax_total = $7, amount = $8, status = $9, customer_notes = $10, terms_conditions = $11, updated_at = NOW()
//       WHERE id = $12
//       RETURNING *;
//     `;

//     const orderRes = await dbClient.query(updateOrderQuery, [
//       order_number,
//       client_id,
//       order_date,
//       shipment_date || null,
//       sub_total || 0,
//       discount_total || 0,
//       tax_total || 0,
//       amount || 0,
//       status || 'Draft',
//       customer_notes || '',
//       terms_conditions || '',
//       id
//     ]);

//     if (orderRes.rows.length === 0) {
//       await dbClient.query('ROLLBACK');
//       return res.status(404).json({ success: false, message: 'Sales order not found.' });
//     }

//     if (items && Array.isArray(items)) {
//       await dbClient.query('DELETE FROM sales_order_items WHERE sales_order_id = $1', [id]);

//       const itemQuery = `
//         INSERT INTO sales_order_items (sales_order_id, product_id, description, quantity, unit, rate, discount, tax_rate, amount)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
//       `;

//       for (const item of items) {
//         await dbClient.query(itemQuery, [
//           id,
//           item.product_id || null,
//           item.description || '',
//           item.quantity || 1,
//           item.unit || '',
//           item.rate || 0,
//           item.discount || 0,
//           item.tax_rate || 0,
//           item.amount || 0
//         ]);
//       }
//     }

//     await dbClient.query('COMMIT');
//     return res.status(200).json({ success: true, salesOrder: orderRes.rows[0] });
//   } catch (error) {
//     console.error('Failed to update sales order:', error);
//     try {
//       await (await client).query('ROLLBACK');
//     } catch (_) {}
//     return res.status(500).json({ success: false, message: 'Database error updating sales order.' });
//   } finally {
//     (await client).release();
//   }
// };

// export const deleteOrder = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const result = await query('DELETE FROM sales_orders WHERE id = $1 RETURNING *', [id]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Sales order not found.' });
//     }
//     return res.status(200).json({ success: true, message: 'Sales order deleted successfully.' });
//   } catch (error) {
//     console.error('Failed to delete sales order:', error);
//     return res.status(500).json({ success: false, message: 'Database error deleting sales order.' });
//   }
// };



import { Request, Response } from 'express';
import { query, pool } from '../../db';

// ============================================================================
// LIST - with sorting, filtering, pagination
// ============================================================================
export const list = async (req: Request, res: Response) => {
  try {
    const {
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
      search = '',
      status = '',
      dateFrom = '',
      dateTo = '',
      amountMin = '',
      amountMax = '',
    } = req.query;

    // Validate sort order
    const order = (sortOrder as string).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Map frontend field names to DB columns
    const sortFieldMap: Record<string, string> = {
      id: 'so.order_number',
      customer: 'c.company_name',
      date: 'so.order_date',
      amount: 'so.amount',
      status: 'so.status',
    };

    const sortField = sortFieldMap[sortBy as string] || 'so.created_at';

    // Build WHERE conditions
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    // Search (order number or customer name)
    if (search) {
      whereConditions.push(
        `(so.order_number ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Status filter
    if (status) {
      whereConditions.push(`so.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Date range
    if (dateFrom) {
      whereConditions.push(`so.order_date >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      whereConditions.push(`so.order_date <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }

    // Amount range
    if (amountMin) {
      whereConditions.push(`so.amount >= $${paramIndex}`);
      params.push(parseFloat(amountMin as string));
      paramIndex++;
    }

    if (amountMax) {
      whereConditions.push(`so.amount <= $${paramIndex}`);
      params.push(parseFloat(amountMax as string));
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total FROM sales_orders so JOIN clients c ON so.client_id = c.id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);
    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 10, 100);
    const offset = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(total / limitNum);

    // Get orders with pagination
    const result = await query(
      `
      SELECT 
        so.id,
        so.order_number,
        so.client_id,
        c.name as client_name,
        c.company_name as customer,
        so.order_date as date,
        so.shipment_date,
        so.status,
        so.amount,
        so.created_at,
        (SELECT COUNT(*) FROM sales_order_items WHERE sales_order_id = so.id) as items_count
      FROM sales_orders so
      JOIN clients c ON so.client_id = c.id
      ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Failed to list sales orders:', error);
    return res.status(500).json({ success: false, message: 'Database error listing sales orders.' });
  }
};

// ============================================================================
// CREATE
// ============================================================================
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
    } catch (_) { }
    return res.status(500).json({ success: false, message: 'Database error creating sales order.' });
  } finally {
    (await client).release();
  }
};

// ============================================================================
// GET DETAILS
// ============================================================================
export const getDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const orderRes = await query(`
      SELECT 
        so.*,
        c.name as client_name,
        c.company_name,
        c.email as client_email,
        c.phone as client_phone
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

// ============================================================================
// UPDATE
// ============================================================================
export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { order_number, client_id, order_date, shipment_date, items, sub_total, discount_total, tax_total, amount, status, customer_notes, terms_conditions } = req.body;

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    const updateOrderQuery = `
      UPDATE sales_orders
      SET 
        order_number = $1,
        client_id = $2,
        order_date = $3,
        shipment_date = $4,
        sub_total = $5,
        discount_total = $6,
        tax_total = $7,
        amount = $8,
        status = $9,
        customer_notes = $10,
        terms_conditions = $11,
        updated_at = NOW()
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
    } catch (_) { }
    return res.status(500).json({ success: false, message: 'Database error updating sales order.' });
  } finally {
    (await client).release();
  }
};

// ============================================================================
// BULK UPDATE STATUS
// ============================================================================
export const bulkUpdateStatus = async (req: Request, res: Response) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'IDs array is required.' });
  }

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required.' });
  }

  try {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const result = await query(
      `UPDATE sales_orders SET status = $${ids.length + 1}, updated_at = NOW() WHERE id IN (${placeholders}) RETURNING *`,
      [...ids, status]
    );

    return res.status(200).json({
      success: true,
      updated: result.rows.length,
      salesOrders: result.rows
    });
  } catch (error) {
    console.error('Failed to bulk update sales orders:', error);
    return res.status(500).json({ success: false, message: 'Database error updating sales orders.' });
  }
};

// ============================================================================
// DELETE
// ============================================================================
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

// ============================================================================
// EXPORT TO CSV
// ============================================================================
export const exportCSV = async (req: Request, res: Response) => {
  try {
    const {
      search = '',
      status = '',
      dateFrom = '',
      dateTo = '',
      amountMin = '',
      amountMax = '',
    } = req.query;

    // Build WHERE conditions (same as list endpoint)
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(
        `(so.order_number ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`so.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (dateFrom) {
      whereConditions.push(`so.order_date >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      whereConditions.push(`so.order_date <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }

    if (amountMin) {
      whereConditions.push(`so.amount >= $${paramIndex}`);
      params.push(parseFloat(amountMin as string));
      paramIndex++;
    }

    if (amountMax) {
      whereConditions.push(`so.amount <= $${paramIndex}`);
      params.push(parseFloat(amountMax as string));
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get all matching orders
    const result = await query(
      `
      SELECT 
        so.order_number,
        c.company_name as customer,
        so.order_date as date,
        so.shipment_date,
        so.status,
        so.amount,
        (SELECT COUNT(*) FROM sales_order_items WHERE sales_order_id = so.id) as items_count
      FROM sales_orders so
      JOIN clients c ON so.client_id = c.id
      ${whereClause}
      ORDER BY so.created_at DESC
      `,
      params
    );

    // Generate CSV
    const headers = ['Order ID', 'Customer', 'Date', 'Shipment Date', 'Status', 'Amount', 'Items'];
    const rows = result.rows.map(row => [
      row.order_number,
      row.customer,
      new Date(row.date).toLocaleDateString('en-IN'),
      row.shipment_date ? new Date(row.shipment_date).toLocaleDateString('en-IN') : '',
      row.status,
      row.amount,
      row.items_count
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sales-orders-${new Date().toISOString().split('T')[0]}.csv"`);
    return res.send(csv);
  } catch (error) {
    console.error('Failed to export sales orders:', error);
    return res.status(500).json({ success: false, message: 'Database error exporting sales orders.' });
  }
};
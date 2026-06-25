import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT dc.*, c.name as client_name, c.company_name
      FROM delivery_challans dc
      JOIN clients c ON dc.client_id = c.id
      ORDER BY dc.created_at DESC
    `);
    return res.status(200).json({ success: true, deliveryChallans: result.rows });
  } catch (error) {
    console.error('Failed to list delivery challans:', error);
    return res.status(500).json({ success: false, message: 'Database error listing delivery challans.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { challan_number, client_id, challan_date, status, reference_number, notes } = req.body;

  if (!challan_number || !client_id) {
    return res.status(400).json({ success: false, message: 'Challan Number and Client ID are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO delivery_challans (challan_number, client_id, challan_date, status, reference_number, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [
      challan_number,
      client_id,
      challan_date || new Date(),
      status || 'Draft',
      reference_number || '',
      notes || ''
    ]);
    return res.status(201).json({ success: true, deliveryChallan: result.rows[0] });
  } catch (error) {
    console.error('Failed to create delivery challan:', error);
    return res.status(500).json({ success: false, message: 'Database error creating delivery challan.' });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query(`
      SELECT dc.*, c.name as client_name, c.company_name, c.email as client_email, c.phone as client_phone
      FROM delivery_challans dc
      JOIN clients c ON dc.client_id = c.id
      WHERE dc.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Delivery challan not found.' });
    }

    return res.status(200).json({ success: true, deliveryChallan: result.rows[0] });
  } catch (error) {
    console.error('Failed to get delivery challan details:', error);
    return res.status(500).json({ success: false, message: 'Database error getting delivery challan.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { challan_number, client_id, challan_date, status, reference_number, notes } = req.body;

  try {
    const result = await query(`
      UPDATE delivery_challans
      SET challan_number = $1, client_id = $2, challan_date = $3, status = $4, reference_number = $5, notes = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *;
    `, [
      challan_number,
      client_id,
      challan_date,
      status || 'Draft',
      reference_number || '',
      notes || '',
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Delivery challan not found.' });
    }

    return res.status(200).json({ success: true, deliveryChallan: result.rows[0] });
  } catch (error) {
    console.error('Failed to update delivery challan:', error);
    return res.status(500).json({ success: false, message: 'Database error updating delivery challan.' });
  }
};

export const deleteChallan = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM delivery_challans WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Delivery challan not found.' });
    }
    return res.status(200).json({ success: true, message: 'Delivery challan deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete delivery challan:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting delivery challan.' });
  }
};

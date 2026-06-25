import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT eb.*, i.number as invoice_number, dc.challan_number
      FROM eway_bills eb
      LEFT JOIN invoices i ON eb.invoice_id = i.id
      LEFT JOIN delivery_challans dc ON eb.challan_id = dc.id
      ORDER BY eb.created_at DESC
    `);
    return res.status(200).json({ success: true, ewayBills: result.rows });
  } catch (error) {
    console.error('Failed to list e-way bills:', error);
    return res.status(500).json({ success: false, message: 'Database error listing e-way bills.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { eway_bill_number, invoice_id, challan_id, transport_mode, vehicle_number, from_place, to_place, date, status } = req.body;

  if (!eway_bill_number) {
    return res.status(400).json({ success: false, message: 'e-Way Bill Number is required.' });
  }

  try {
    const result = await query(`
      INSERT INTO eway_bills (eway_bill_number, invoice_id, challan_id, transport_mode, vehicle_number, from_place, to_place, date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `, [
      eway_bill_number,
      invoice_id || null,
      challan_id || null,
      transport_mode || 'Road',
      vehicle_number || '',
      from_place || '',
      to_place || '',
      date || new Date(),
      status || 'Active'
    ]);
    return res.status(201).json({ success: true, ewayBill: result.rows[0] });
  } catch (error) {
    console.error('Failed to create e-way bill:', error);
    return res.status(500).json({ success: false, message: 'Database error creating e-way bill.' });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query(`
      SELECT eb.*, i.number as invoice_number, dc.challan_number
      FROM eway_bills eb
      LEFT JOIN invoices i ON eb.invoice_id = i.id
      LEFT JOIN delivery_challans dc ON eb.challan_id = dc.id
      WHERE eb.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'e-Way bill not found.' });
    }

    return res.status(200).json({ success: true, ewayBill: result.rows[0] });
  } catch (error) {
    console.error('Failed to get e-way bill details:', error);
    return res.status(500).json({ success: false, message: 'Database error getting e-way bill.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { eway_bill_number, invoice_id, challan_id, transport_mode, vehicle_number, from_place, to_place, date, status } = req.body;

  try {
    const result = await query(`
      UPDATE eway_bills
      SET eway_bill_number = $1, invoice_id = $2, challan_id = $3, transport_mode = $4, vehicle_number = $5, from_place = $6, to_place = $7, date = $8, status = $9
      WHERE id = $10
      RETURNING *;
    `, [
      eway_bill_number,
      invoice_id || null,
      challan_id || null,
      transport_mode || 'Road',
      vehicle_number || '',
      from_place || '',
      to_place || '',
      date,
      status || 'Active',
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'e-Way bill not found.' });
    }

    return res.status(200).json({ success: true, ewayBill: result.rows[0] });
  } catch (error) {
    console.error('Failed to update e-way bill:', error);
    return res.status(500).json({ success: false, message: 'Database error updating e-way bill.' });
  }
};

export const cancel = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query(`
      UPDATE eway_bills
      SET status = 'Cancelled'
      WHERE id = $1
      RETURNING *;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'e-Way bill not found.' });
    }

    return res.status(200).json({ success: true, ewayBill: result.rows[0], message: 'e-Way bill cancelled successfully.' });
  } catch (error) {
    console.error('Failed to cancel e-way bill:', error);
    return res.status(500).json({ success: false, message: 'Database error cancelling e-way bill.' });
  }
};

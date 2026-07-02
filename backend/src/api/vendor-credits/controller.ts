import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT vc.*, c.name as client_name, c.company_name
      FROM vendor_credits vc
      JOIN clients c ON vc.client_id = c.id
      ORDER BY vc.created_at DESC
    `);
    return res.status(200).json({ success: true, vendorCredits: result.rows });
  } catch (error) {
    console.error('Failed to list vendor credits:', error);
    return res.status(500).json({ success: false, message: 'Database error listing vendor credits.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const {
    credit_number,
    client_id,
    bill_id,
    date,
    amount,
    balance,
    status,
    reason,
    order_number,
    subject,
    accounts_payable,
    reverse_charge,
    items,
    sub_total,
    discount_pct,
    discount_amount,
    tds,
    tcs,
    adjustment,
    total,
    notes,
    attachments
  } = req.body;

  if (!credit_number || !client_id || amount === undefined) {
    return res.status(400).json({ success: false, message: 'Credit Number, Vendor ID (client_id), and Amount are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO vendor_credits (
        credit_number, client_id, bill_id, date, amount, balance, status, reason,
        order_number, subject, accounts_payable, reverse_charge, items, sub_total,
        discount_pct, discount_amount, tds, tcs, adjustment, total, notes, attachments
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *;
    `, [
      credit_number,
      client_id,
      bill_id || null,
      date || new Date(),
      amount,
      balance !== undefined ? balance : amount,
      status || 'Open',
      reason || '',
      order_number || '',
      subject || '',
      accounts_payable || 'Accounts Payable',
      reverse_charge || false,
      JSON.stringify(items || []),
      sub_total || 0.00,
      discount_pct || 0.00,
      discount_amount || 0.00,
      tds || '',
      tcs || '',
      adjustment || 0.00,
      total || 0.00,
      notes || '',
      JSON.stringify(attachments || [])
    ]);
    return res.status(201).json({ success: true, vendorCredit: result.rows[0] });
  } catch (error) {
    console.error('Failed to create vendor credit:', error);
    return res.status(500).json({ success: false, message: 'Database error creating vendor credit.' });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query(`
      SELECT vc.*, c.name as client_name, c.company_name, b.number as bill_number
      FROM vendor_credits vc
      JOIN clients c ON vc.client_id = c.id
      LEFT JOIN bills b ON vc.bill_id = b.id
      WHERE vc.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor credit record not found.' });
    }

    return res.status(200).json({ success: true, vendorCredit: result.rows[0] });
  } catch (error) {
    console.error('Failed to get vendor credit details:', error);
    return res.status(500).json({ success: false, message: 'Database error getting vendor credit.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    credit_number,
    client_id,
    bill_id,
    date,
    amount,
    balance,
    status,
    reason,
    order_number,
    subject,
    accounts_payable,
    reverse_charge,
    items,
    sub_total,
    discount_pct,
    discount_amount,
    tds,
    tcs,
    adjustment,
    total,
    notes,
    attachments
  } = req.body;

  try {
    const result = await query(`
      UPDATE vendor_credits
      SET credit_number = $1, client_id = $2, bill_id = $3, date = $4, amount = $5, balance = $6, status = $7, reason = $8,
          order_number = $9, subject = $10, accounts_payable = $11, reverse_charge = $12, items = $13, sub_total = $14,
          discount_pct = $15, discount_amount = $16, tds = $17, tcs = $18, adjustment = $19, total = $20, notes = $21,
          attachments = $22, updated_at = NOW()
      WHERE id = $23
      RETURNING *;
    `, [
      credit_number,
      client_id,
      bill_id || null,
      date,
      amount,
      balance,
      status || 'Open',
      reason || '',
      order_number || '',
      subject || '',
      accounts_payable || 'Accounts Payable',
      reverse_charge || false,
      JSON.stringify(items || []),
      sub_total || 0.00,
      discount_pct || 0.00,
      discount_amount || 0.00,
      tds || '',
      tcs || '',
      adjustment || 0.00,
      total || 0.00,
      notes || '',
      JSON.stringify(attachments || []),
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor credit record not found.' });
    }

    return res.status(200).json({ success: true, vendorCredit: result.rows[0] });
  } catch (error) {
    console.error('Failed to update vendor credit:', error);
    return res.status(500).json({ success: false, message: 'Database error updating vendor credit.' });
  }
};

export const deleteCredit = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM vendor_credits WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor credit record not found.' });
    }
    return res.status(200).json({ success: true, message: 'Vendor credit deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete vendor credit:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting vendor credit.' });
  }
};

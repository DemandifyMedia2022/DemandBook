import { Request, Response } from 'express';
import { query } from '../../db';

// GST Filings
export const listGstFilings = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM gst_filings ORDER BY created_at DESC');
    return res.status(200).json({ success: true, gstFilings: result.rows });
  } catch (error) {
    console.error('Failed to list GST filings:', error);
    return res.status(500).json({ success: false, message: 'Database error listing GST filings.' });
  }
};

export const createGstFiling = async (req: Request, res: Response) => {
  const { return_type, period, status, filing_date, data } = req.body;

  if (!return_type || !period) {
    return res.status(400).json({ success: false, message: 'Return Type and Period are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO gst_filings (return_type, period, status, filing_date, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [
      return_type,
      period,
      status || 'Draft',
      filing_date || null,
      data ? JSON.stringify(data) : null
    ]);
    return res.status(201).json({ success: true, gstFiling: result.rows[0] });
  } catch (error) {
    console.error('Failed to create GST filing:', error);
    return res.status(500).json({ success: false, message: 'Database error creating GST filing.' });
  }
};

// TDS Liabilities
export const listTdsLiabilities = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM tds_liabilities ORDER BY created_at DESC');
    return res.status(200).json({ success: true, tdsLiabilities: result.rows });
  } catch (error) {
    console.error('Failed to list TDS liabilities:', error);
    return res.status(500).json({ success: false, message: 'Database error listing TDS liabilities.' });
  }
};

export const createTdsLiability = async (req: Request, res: Response) => {
  const { section, assessment_year, deductee_name, amount, status } = req.body;

  if (!section || !assessment_year || !deductee_name || !amount) {
    return res.status(400).json({ success: false, message: 'Section, Assessment Year, Deductee Name, and Amount are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO tds_liabilities (section, assessment_year, deductee_name, amount, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [
      section,
      assessment_year,
      deductee_name,
      amount,
      status || 'Pending'
    ]);
    return res.status(201).json({ success: true, tdsLiability: result.rows[0] });
  } catch (error) {
    console.error('Failed to create TDS liability:', error);
    return res.status(500).json({ success: false, message: 'Database error creating TDS liability.' });
  }
};

// TDS Challans
export const listTdsChallans = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM tds_challans ORDER BY created_at DESC');
    return res.status(200).json({ success: true, tdsChallans: result.rows });
  } catch (error) {
    console.error('Failed to list TDS challans:', error);
    return res.status(500).json({ success: false, message: 'Database error listing TDS challans.' });
  }
};

export const createTdsChallan = async (req: Request, res: Response) => {
  const { challan_number, paid_date, amount, status, bsr_code } = req.body;

  if (!challan_number || !amount) {
    return res.status(400).json({ success: false, message: 'Challan Number and Amount are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO tds_challans (challan_number, paid_date, amount, status, bsr_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [
      challan_number,
      paid_date || new Date(),
      amount,
      status || 'Completed',
      bsr_code || ''
    ]);
    return res.status(201).json({ success: true, tdsChallan: result.rows[0] });
  } catch (error) {
    console.error('Failed to create TDS challan:', error);
    return res.status(500).json({ success: false, message: 'Database error creating TDS challan.' });
  }
};

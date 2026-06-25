import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  const { type, status, q } = req.query;

  try {
    let queryText = 'SELECT * FROM clients WHERE 1=1';
    const params: any[] = [];

    if (type) {
      params.push(type);
      queryText += ` AND type = $${params.length}`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }

    if (q) {
      params.push(`%${(q as string).toLowerCase()}%`);
      queryText += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(custom_id) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return res.status(200).json({ success: true, clients: result.rows });
  } catch (error) {
    console.error('Failed to list clients:', error);
    return res.status(500).json({ success: false, message: 'Database error listing clients.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { 
    custom_id, name, email, phone, type, status, balance,
    gstin, customer_type, primary_contact_salutation, primary_contact_first_name,
    primary_contact_last_name, company_name, display_name, work_phone,
    mobile_phone, customer_language, gst_treatment, place_of_supply, pan,
    tax_preference, currency, payment_terms, enable_portal, customer_owner_id,
    other_details
  } = req.body;

  if (!custom_id || !name || !email || !type) {
    return res.status(400).json({ success: false, message: 'ID, Name, Email, and Type are required.' });
  }

  try {
    const insertQuery = `
      INSERT INTO clients (
        custom_id, name, email, phone, type, status, balance,
        gstin, customer_type, primary_contact_salutation, primary_contact_first_name,
        primary_contact_last_name, company_name, display_name, work_phone,
        mobile_phone, customer_language, gst_treatment, place_of_supply, pan,
        tax_preference, currency, payment_terms, enable_portal, customer_owner_id,
        other_details
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING *;
    `;
    const params = [
      custom_id,
      name,
      email.toLowerCase(),
      phone || '—',
      type,
      status || 'Active',
      balance ? parseFloat(balance) : 0.00,
      gstin || null,
      customer_type || null,
      primary_contact_salutation || null,
      primary_contact_first_name || null,
      primary_contact_last_name || null,
      company_name || null,
      display_name || null,
      work_phone || null,
      mobile_phone || null,
      customer_language || null,
      gst_treatment || null,
      place_of_supply || null,
      pan || null,
      tax_preference || null,
      currency || 'INR',
      payment_terms || null,
      enable_portal || false,
      customer_owner_id || null,
      other_details || null
    ];

    const result = await query(insertQuery, params);
    return res.status(201).json({ success: true, client: result.rows[0] });
  } catch (error: any) {
    console.error('Failed to create client:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'A client with this ID already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Database error creating client.' });
  }
};

export const summary = async (req: Request, res: Response) => {
  try {
    const countsQuery = `
      SELECT 
        COUNT(id) AS total_count,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) AS active_count,
        SUM(CASE WHEN type = 'customer' THEN balance ELSE 0 END) AS total_receivables
      FROM clients;
    `;
    const result = await query(countsQuery);
    const row = result.rows[0];

    return res.status(200).json({
      success: true,
      totalCount: parseInt(row.total_count) || 0,
      activeCount: parseInt(row.active_count) || 0,
      totalReceivables: parseFloat(row.total_receivables) || 0.00
    });
  } catch (error) {
    console.error('Failed to fetch clients summary:', error);
    return res.status(500).json({ success: false, message: 'Database error fetching client summary.' });
  }
};

export const fetchGSTIN = async (req: Request, res: Response) => {
  const { gstin } = req.params;
  
  if (!gstin) {
    return res.status(400).json({ success: false, message: 'GSTIN is required.' });
  }

  // Mock implementation for fetching GST details
  // In a real application, you would call a GST verification API here (e.g., ClearTax, Razorpay, etc.)
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock data based on format matching
    if (gstin.length !== 15) {
      return res.status(400).json({ success: false, message: 'Invalid GSTIN length. Must be 15 characters.' });
    }

    const mockResponse = {
      success: true,
      data: {
        company_name: '',
        pan: gstin.substring(2, 12).toUpperCase(), // Extract PAN from GSTIN format (characters 3-12)
        customer_type: 'Business',
        gst_treatment: 'Registered Business - Regular',
        primary_contact_salutation: '',
        primary_contact_first_name: '',
        primary_contact_last_name: '',
        place_of_supply: '',
        tax_preference: 'Taxable'
      }
    };

    return res.status(200).json(mockResponse);
  } catch (error) {
    console.error('Failed to fetch GSTIN:', error);
    return res.status(500).json({ success: false, message: 'Error fetching GSTIN details.' });
  }
};

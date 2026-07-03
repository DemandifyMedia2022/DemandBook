// import { Request, Response } from 'express';
// import { query } from '../../db';

// export const list = async (req: Request, res: Response) => {
//   const { type, status, q } = req.query;

//   try {
//     let queryText = 'SELECT * FROM clients WHERE 1=1';
//     const params: any[] = [];

//     if (type) {
//       params.push(type);
//       queryText += ` AND type = $${params.length}`;
//     }

//     if (status) {
//       params.push(status);
//       queryText += ` AND status = $${params.length}`;
//     }

//     if (q) {
//       params.push(`%${(q as string).toLowerCase()}%`);
//       queryText += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(custom_id) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
//     }

//     queryText += ' ORDER BY created_at DESC';

//     const result = await query(queryText, params);
//     return res.status(200).json({ success: true, clients: result.rows });
//   } catch (error) {
//     console.error('Failed to list clients:', error);
//     return res.status(500).json({ success: false, message: 'Database error listing clients.' });
//   }
// };

// export const create = async (req: Request, res: Response) => {
//   const { 
//     custom_id, name, email, phone, type, status, balance,
//     gstin, customer_type, primary_contact_salutation, primary_contact_first_name,
//     primary_contact_last_name, company_name, display_name, work_phone,
//     mobile_phone, customer_language, gst_treatment, place_of_supply, pan,
//     tax_preference, currency, payment_terms, enable_portal, customer_owner_id,
//     other_details
//   } = req.body;

//   if (!custom_id || !name || !email || !type) {
//     return res.status(400).json({ success: false, message: 'ID, Name, Email, and Type are required.' });
//   }

//   try {
//     const insertQuery = `
//       INSERT INTO clients (
//         custom_id, name, email, phone, type, status, balance,
//         gstin, customer_type, primary_contact_salutation, primary_contact_first_name,
//         primary_contact_last_name, company_name, display_name, work_phone,
//         mobile_phone, customer_language, gst_treatment, place_of_supply, pan,
//         tax_preference, currency, payment_terms, enable_portal, customer_owner_id,
//         other_details
//       )
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
//       RETURNING *;
//     `;
//     const params = [
//       custom_id,
//       name,
//       email.toLowerCase(),
//       phone || '—',
//       type,
//       status || 'Active',
//       balance ? parseFloat(balance) : 0.00,
//       gstin || null,
//       customer_type || null,
//       primary_contact_salutation || null,
//       primary_contact_first_name || null,
//       primary_contact_last_name || null,
//       company_name || null,
//       display_name || null,
//       work_phone || null,
//       mobile_phone || null,
//       customer_language || null,
//       gst_treatment || null,
//       place_of_supply || null,
//       pan || null,
//       tax_preference || null,
//       currency || 'INR',
//       payment_terms || null,
//       enable_portal || false,
//       customer_owner_id || null,
//       other_details || null
//     ];

//     const result = await query(insertQuery, params);
//     return res.status(201).json({ success: true, client: result.rows[0] });
//   } catch (error: any) {
//     console.error('Failed to create client:', error);
//     if (error.code === '23505') {
//       return res.status(409).json({ success: false, message: 'A client with this ID already exists.' });
//     }
//     return res.status(500).json({ success: false, message: 'Database error creating client.' });
//   }
// };

// export const summary = async (req: Request, res: Response) => {
//   try {
//     const countsQuery = `
//       SELECT 
//         COUNT(id) AS total_count,
//         COUNT(CASE WHEN status = 'Active' THEN 1 END) AS active_count,
//         SUM(CASE WHEN type = 'customer' THEN balance ELSE 0 END) AS total_receivables
//       FROM clients;
//     `;
//     const result = await query(countsQuery);
//     const row = result.rows[0];

//     return res.status(200).json({
//       success: true,
//       totalCount: parseInt(row.total_count) || 0,
//       activeCount: parseInt(row.active_count) || 0,
//       totalReceivables: parseFloat(row.total_receivables) || 0.00
//     });
//   } catch (error) {
//     console.error('Failed to fetch clients summary:', error);
//     return res.status(500).json({ success: false, message: 'Database error fetching client summary.' });
//   }
// };

// export const fetchGSTIN = async (req: Request, res: Response) => {
//   const { gstin } = req.params;

//   if (!gstin) {
//     return res.status(400).json({ success: false, message: 'GSTIN is required.' });
//   }

//   // Mock implementation for fetching GST details
//   try {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 800));

//     if (gstin.length !== 15) {
//       return res.status(400).json({ success: false, message: 'Invalid GSTIN length. Must be 15 characters.' });
//     }

//     const stateCode = gstin.substring(0, 2);
//     const indianStates: Record<string, string> = {
//       "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
//       "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
//       "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
//       "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
//       "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
//       "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "29": "Karnataka",
//       "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
//       "35": "Andaman & Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh"
//     };

//     const stateName = indianStates[stateCode] || "Maharashtra";
//     const placeOfSupply = `${stateCode}-${stateName}`;
//     const pan = gstin.substring(2, 12).toUpperCase();

//     const mockResponse = {
//       success: true,
//       data: {
//         company_name: 'Acme Industrial Solutions Private Limited',
//         display_name: 'Acme Industrial Solutions',
//         pan: pan,
//         customer_type: 'Business',
//         gst_treatment: 'Registered Business - Regular',
//         primary_contact_salutation: 'Mr.',
//         primary_contact_first_name: 'Rohan',
//         primary_contact_last_name: 'Deshmukh',
//         place_of_supply: placeOfSupply,
//         tax_preference: 'Taxable',
//         email: 'billing@acmeindustrial.com',
//         work_phone: '022-25874130',
//         mobile_phone: '9820012345',
//         vendor_language: 'English',
//         currency: 'INR',
//         payment_terms: 'Net 30',
//         address: {
//           billing: {
//             attention: 'Accounts Manager',
//             country: 'India',
//             street1: 'Plot No. 12, Sector 5, Industrial Area',
//             street2: 'Opposite Railway Station',
//             city: stateCode === '27' ? 'Mumbai' : 'New Delhi',
//             state: stateName,
//             pin_code: stateCode === '27' ? '400705' : '110001',
//             phone: '022-25874130',
//             fax: '022-25874131'
//           },
//           shipping: {
//             attention: 'Store In-charge',
//             country: 'India',
//             street1: 'Warehouse Block B, Sector 5, Industrial Area',
//             street2: 'Opposite Railway Station',
//             city: stateCode === '27' ? 'Mumbai' : 'New Delhi',
//             state: stateName,
//             pin_code: stateCode === '27' ? '400705' : '110001',
//             phone: '9820012345',
//             fax: ''
//           }
//         },
//         bank_details: {
//           bank_name: 'HDFC Bank',
//           account_number: '50200045612398',
//           ifsc_code: 'HDFC0000123',
//           branch: 'Industrial Area Branch'
//         },
//         msme_registered: true,
//         tds: 'TDS-194C (1.0%)'
//       }
//     };

//     return res.status(200).json(mockResponse);
//   } catch (error) {
//     console.error('Failed to fetch GSTIN:', error);
//     return res.status(500).json({ success: false, message: 'Error fetching GSTIN details.' });
//   }
// };



import { Request, Response } from 'express';
import { clientService, ServiceError } from './service';
import { fetchGSTIN as fetchGSTINHandler } from './gstin'; // see note below

function handleError(res: Response, error: any, fallbackMessage: string) {
  if (error instanceof ServiceError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(fallbackMessage, error);
  if (error.code === '23505') {
    return res.status(409).json({ success: false, message: 'A client with this ID already exists.' });
  }
  return res.status(500).json({ success: false, message: fallbackMessage });
}

export const list = async (req: Request, res: Response) => {
  try {
    const { type, status, q } = req.query;
    const clients = await clientService.list({
      type: type as string,
      status: status as string,
      q: q as string,
    });
    return res.status(200).json({ success: true, clients });
  } catch (error) {
    return handleError(res, error, 'Database error listing clients.');
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const client = await clientService.getById(parseInt(req.params.id, 10));
    return res.status(200).json({ success: true, client });
  } catch (error) {
    return handleError(res, error, 'Database error fetching client.');
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    clientService.assertCanWrite((req as any).user?.role);
    const client = await clientService.create(req.body);
    return res.status(201).json({ success: true, client });
  } catch (error) {
    return handleError(res, error, 'Database error creating client.');
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    clientService.assertCanWrite((req as any).user?.role);
    const client = await clientService.update(parseInt(req.params.id, 10), req.body);
    return res.status(200).json({ success: true, client });
  } catch (error) {
    return handleError(res, error, 'Database error updating client.');
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    clientService.assertCanWrite((req as any).user?.role);
    await clientService.remove(parseInt(req.params.id, 10));
    return res.status(200).json({ success: true, message: 'Client deactivated.' });
  } catch (error) {
    return handleError(res, error, 'Database error deleting client.');
  }
};

export const summary = async (req: Request, res: Response) => {
  try {
    const data = await clientService.summary();
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return handleError(res, error, 'Database error fetching client summary.');
  }
};

export const fetchGSTIN = fetchGSTINHandler;
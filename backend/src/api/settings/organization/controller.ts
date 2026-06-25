import { Request, Response } from 'express';
import { query } from '../../../db';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM organization_profile LIMIT 1');
    if (result.rows.length === 0) {
      // Return a blank default profile if none exists
      return res.status(200).json({ success: true, profile: {} });
    }
    return res.status(200).json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Failed to get organization profile:', error);
    return res.status(500).json({ success: false, message: 'Database error fetching profile.' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const {
    logo_url,
    organization_name,
    industry,
    address_street,
    address_city,
    address_state,
    address_zip,
    address_country,
    phone,
    fax,
    website_url,
    different_payment_address,
    primary_contact_name,
    primary_contact_email,
    base_currency,
    fiscal_year,
    report_basis,
    organization_language,
    communication_languages,
    time_zone,
    date_format,
    company_id,
    additional_fields
  } = req.body;

  if (!organization_name) {
    return res.status(400).json({ success: false, message: 'Organization name is required.' });
  }

  try {
    // Check if profile exists
    const existing = await query('SELECT id FROM organization_profile LIMIT 1');
    
    let result;
    if (existing.rows.length === 0) {
      // Insert
      const insertQuery = `
        INSERT INTO organization_profile (
          logo_url, organization_name, industry,
          address_street, address_city, address_state, address_zip, address_country,
          phone, fax, website_url, different_payment_address,
          primary_contact_name, primary_contact_email,
          base_currency, fiscal_year, report_basis, organization_language,
          communication_languages, time_zone, date_format, company_id,
          additional_fields
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        ) RETURNING *;
      `;
      const params = [
        logo_url, organization_name, industry,
        address_street, address_city, address_state, address_zip, address_country,
        phone, fax, website_url, different_payment_address,
        primary_contact_name, primary_contact_email,
        base_currency, fiscal_year, report_basis, organization_language,
        communication_languages, time_zone, date_format, company_id,
        additional_fields
      ];
      result = await query(insertQuery, params);
    } else {
      // Update
      const updateQuery = `
        UPDATE organization_profile SET
          logo_url = $1, organization_name = $2, industry = $3,
          address_street = $4, address_city = $5, address_state = $6, address_zip = $7, address_country = $8,
          phone = $9, fax = $10, website_url = $11, different_payment_address = $12,
          primary_contact_name = $13, primary_contact_email = $14,
          base_currency = $15, fiscal_year = $16, report_basis = $17, organization_language = $18,
          communication_languages = $19, time_zone = $20, date_format = $21, company_id = $22,
          additional_fields = $23
        WHERE id = $24
        RETURNING *;
      `;
      const params = [
        logo_url, organization_name, industry,
        address_street, address_city, address_state, address_zip, address_country,
        phone, fax, website_url, different_payment_address,
        primary_contact_name, primary_contact_email,
        base_currency, fiscal_year, report_basis, organization_language,
        communication_languages, time_zone, date_format, company_id,
        additional_fields,
        existing.rows[0].id
      ];
      result = await query(updateQuery, params);
    }

    return res.status(200).json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Failed to update organization profile:', error);
    return res.status(500).json({ success: false, message: 'Database error updating profile.' });
  }
};

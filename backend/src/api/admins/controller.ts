import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  const { role, status, q } = req.query;

  try {
    let queryText = `
      SELECT id, name, email, role, 
             CASE WHEN is_active THEN 'active' ELSE 'inactive' END as status, 
             created_at 
      FROM users 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (role && role !== 'All') {
      params.push((role as string).toUpperCase());
      queryText += ` AND role = $${params.length}`;
    }

    if (status && status !== 'All') {
      const activeVal = (status as string).toLowerCase() === 'active';
      params.push(activeVal);
      queryText += ` AND is_active = $${params.length}`;
    }

    if (q) {
      params.push(`%${(q as string).toLowerCase()}%`);
      queryText += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return res.status(200).json({ success: true, admins: result.rows });
  } catch (error) {
    console.error('Failed to list users:', error);
    return res.status(500).json({ success: false, message: 'Database error listing administrative accounts.' });
  }
};

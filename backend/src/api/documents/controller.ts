import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT d.*, u.name as uploaded_by_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      ORDER BY d.created_at DESC
    `);
    return res.status(200).json({ success: true, documents: result.rows });
  } catch (error) {
    console.error('Failed to list documents:', error);
    return res.status(500).json({ success: false, message: 'Database error listing documents.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { name, file_url, file_size, file_type, category, uploaded_by } = req.body;

  if (!name || !file_url) {
    return res.status(400).json({ success: false, message: 'Document Name and URL are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO documents (name, file_url, file_size, file_type, category, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [
      name,
      file_url,
      file_size || null,
      file_type || '',
      category || 'General',
      uploaded_by || null
    ]);
    return res.status(201).json({ success: true, document: result.rows[0] });
  } catch (error) {
    console.error('Failed to create document:', error);
    return res.status(500).json({ success: false, message: 'Database error creating document.' });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }
    return res.status(200).json({ success: true, message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete document:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting document.' });
  }
};

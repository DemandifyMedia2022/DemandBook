import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT p.*, c.name as client_name
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `);
    return res.status(200).json({ success: true, projects: result.rows });
  } catch (error) {
    console.error('Failed to list projects:', error);
    return res.status(500).json({ success: false, message: 'Database error listing projects.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { name, description, client_id, billing_method, rate, budget, status, start_date, end_date } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Project Name is required.' });
  }

  try {
    const result = await query(`
      INSERT INTO projects (name, description, client_id, billing_method, rate, budget, status, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `, [
      name,
      description || '',
      client_id || null,
      billing_method || 'Fixed Price',
      rate || 0,
      budget || 0,
      status || 'Active',
      start_date || null,
      end_date || null
    ]);
    return res.status(201).json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error('Failed to create project:', error);
    return res.status(500).json({ success: false, message: 'Database error creating project.' });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query(`
      SELECT p.*, c.name as client_name, c.company_name
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    return res.status(200).json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error('Failed to get project details:', error);
    return res.status(500).json({ success: false, message: 'Database error getting project.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, client_id, billing_method, rate, budget, status, start_date, end_date } = req.body;

  try {
    const result = await query(`
      UPDATE projects
      SET name = $1, description = $2, client_id = $3, billing_method = $4, rate = $5, budget = $6, status = $7, start_date = $8, end_date = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING *;
    `, [
      name,
      description,
      client_id || null,
      billing_method || 'Fixed Price',
      rate || 0,
      budget || 0,
      status || 'Active',
      start_date || null,
      end_date || null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    return res.status(200).json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error('Failed to update project:', error);
    return res.status(500).json({ success: false, message: 'Database error updating project.' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    return res.status(200).json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting project.' });
  }
};

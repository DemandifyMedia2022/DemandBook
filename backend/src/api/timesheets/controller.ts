import { Request, Response } from 'express';
import { query } from '../../db';

export const list = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT ts.*, p.name as project_name, u.name as user_name
      FROM timesheets ts
      LEFT JOIN projects p ON ts.project_id = p.id
      LEFT JOIN users u ON ts.user_id = u.id
      ORDER BY ts.date DESC, ts.created_at DESC
    `);
    return res.status(200).json({ success: true, timesheets: result.rows });
  } catch (error) {
    console.error('Failed to list timesheets:', error);
    return res.status(500).json({ success: false, message: 'Database error listing timesheets.' });
  }
};

export const create = async (req: Request, res: Response) => {
  const { project_id, task_name, user_id, date, hours, description, billable, status } = req.body;

  if (!task_name || !hours) {
    return res.status(400).json({ success: false, message: 'Task Name and Hours are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO timesheets (project_id, task_name, user_id, date, hours, description, billable, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `, [
      project_id || null,
      task_name,
      user_id || null,
      date || new Date(),
      hours,
      description || '',
      billable !== undefined ? billable : true,
      status || 'Draft'
    ]);
    return res.status(201).json({ success: true, timesheet: result.rows[0] });
  } catch (error) {
    console.error('Failed to create timesheet:', error);
    return res.status(500).json({ success: false, message: 'Database error creating timesheet.' });
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { project_id, task_name, user_id, date, hours, description, billable, status } = req.body;

  try {
    const result = await query(`
      UPDATE timesheets
      SET project_id = $1, task_name = $2, user_id = $3, date = $4, hours = $5, description = $6, billable = $7, status = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *;
    `, [
      project_id || null,
      task_name,
      user_id || null,
      date,
      hours,
      description || '',
      billable !== undefined ? billable : true,
      status || 'Draft',
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Timesheet record not found.' });
    }

    return res.status(200).json({ success: true, timesheet: result.rows[0] });
  } catch (error) {
    console.error('Failed to update timesheet:', error);
    return res.status(500).json({ success: false, message: 'Database error updating timesheet.' });
  }
};

export const deleteTimesheet = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM timesheets WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Timesheet record not found.' });
    }
    return res.status(200).json({ success: true, message: 'Timesheet deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete timesheet:', error);
    return res.status(500).json({ success: false, message: 'Database error deleting timesheet.' });
  }
};

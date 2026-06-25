import { Request, Response } from 'express';
import { query, pool } from '../../db';

// Chart of Accounts
export const listAccounts = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM chart_of_accounts ORDER BY account_code ASC');
    return res.status(200).json({ success: true, accounts: result.rows });
  } catch (error) {
    console.error('Failed to list chart of accounts:', error);
    return res.status(500).json({ success: false, message: 'Database error listing chart of accounts.' });
  }
};

export const createAccount = async (req: Request, res: Response) => {
  const { account_code, account_name, account_type, parent_id, balance, is_system } = req.body;

  if (!account_code || !account_name || !account_type) {
    return res.status(400).json({ success: false, message: 'Account Code, Account Name, and Account Type are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO chart_of_accounts (account_code, account_name, account_type, parent_id, balance, is_system)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [
      account_code,
      account_name,
      account_type,
      parent_id || null,
      balance || 0.00,
      is_system || false
    ]);
    return res.status(201).json({ success: true, account: result.rows[0] });
  } catch (error) {
    console.error('Failed to create account:', error);
    return res.status(500).json({ success: false, message: 'Database error creating account.' });
  }
};

// Manual Journals
export const listJournals = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM manual_journals ORDER BY date DESC, created_at DESC');
    return res.status(200).json({ success: true, journals: result.rows });
  } catch (error) {
    console.error('Failed to list journals:', error);
    return res.status(500).json({ success: false, message: 'Database error listing journals.' });
  }
};

export const createJournal = async (req: Request, res: Response) => {
  const { journal_number, date, reference, notes, status, entries } = req.body;

  if (!journal_number || !entries || !Array.isArray(entries) || entries.length < 2) {
    return res.status(400).json({ success: false, message: 'Journal Number and at least 2 entries are required.' });
  }

  // Verify debits equal credits
  let totalDebit = 0;
  let totalCredit = 0;
  for (const entry of entries) {
    totalDebit += parseFloat(entry.debit || 0);
    totalCredit += parseFloat(entry.credit || 0);
  }

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    return res.status(400).json({ success: false, message: `Debits (${totalDebit}) and Credits (${totalCredit}) must balance.` });
  }

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    const journalQuery = `
      INSERT INTO manual_journals (journal_number, date, reference, notes, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const journalRes = await dbClient.query(journalQuery, [
      journal_number,
      date || new Date(),
      reference || '',
      notes || '',
      status || 'Draft'
    ]);
    const newJournal = journalRes.rows[0];

    const entryQuery = `
      INSERT INTO journal_entries (journal_id, account_id, debit, credit, description)
      VALUES ($1, $2, $3, $4, $5);
    `;

    for (const entry of entries) {
      await dbClient.query(entryQuery, [
        newJournal.id,
        entry.account_id,
        entry.debit || 0.00,
        entry.credit || 0.00,
        entry.description || ''
      ]);

      // If posted, update the account balance
      if (status === 'Posted') {
        const diff = parseFloat(entry.debit || 0) - parseFloat(entry.credit || 0);
        await dbClient.query(`
          UPDATE chart_of_accounts
          SET balance = balance + $1, updated_at = NOW()
          WHERE id = $2
        `, [diff, entry.account_id]);
      }
    }

    await dbClient.query('COMMIT');
    return res.status(201).json({ success: true, journal: newJournal });
  } catch (error) {
    console.error('Failed to create manual journal:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error creating journal.' });
  } finally {
    (await client).release();
  }
};

export const getJournalDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const journalRes = await query('SELECT * FROM manual_journals WHERE id = $1', [id]);
    if (journalRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Journal not found.' });
    }

    const entriesRes = await query(`
      SELECT je.*, coa.account_name, coa.account_code
      FROM journal_entries je
      JOIN chart_of_accounts coa ON je.account_id = coa.id
      WHERE je.journal_id = $1
    `, [id]);

    return res.status(200).json({
      success: true,
      journal: journalRes.rows[0],
      entries: entriesRes.rows
    });
  } catch (error) {
    console.error('Failed to get journal details:', error);
    return res.status(500).json({ success: false, message: 'Database error getting journal details.' });
  }
};

// Budgets
export const listBudgets = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM budgets ORDER BY fiscal_year DESC, name ASC');
    return res.status(200).json({ success: true, budgets: result.rows });
  } catch (error) {
    console.error('Failed to list budgets:', error);
    return res.status(500).json({ success: false, message: 'Database error listing budgets.' });
  }
};

export const createBudget = async (req: Request, res: Response) => {
  const { name, fiscal_year, category, allocated_amount, spent_amount } = req.body;

  if (!name || !fiscal_year || !category || !allocated_amount) {
    return res.status(400).json({ success: false, message: 'Name, Fiscal Year, Category, and Allocated Amount are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO budgets (name, fiscal_year, category, allocated_amount, spent_amount)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [
      name,
      fiscal_year,
      category,
      allocated_amount,
      spent_amount || 0.00
    ]);
    return res.status(201).json({ success: true, budget: result.rows[0] });
  } catch (error) {
    console.error('Failed to create budget:', error);
    return res.status(500).json({ success: false, message: 'Database error creating budget.' });
  }
};

// Transaction Locking
export const listLocks = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT tl.*, u.name as locked_by_name
      FROM transaction_locks tl
      LEFT JOIN users u ON tl.locked_by = u.id
      ORDER BY tl.lock_date DESC
    `);
    return res.status(200).json({ success: true, locks: result.rows });
  } catch (error) {
    console.error('Failed to list transaction locks:', error);
    return res.status(500).json({ success: false, message: 'Database error listing transaction locks.' });
  }
};

export const createLock = async (req: Request, res: Response) => {
  const { lock_date, reason, locked_by } = req.body;

  if (!lock_date) {
    return res.status(400).json({ success: false, message: 'Lock Date is required.' });
  }

  try {
    const result = await query(`
      INSERT INTO transaction_locks (lock_date, reason, locked_by)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [
      lock_date,
      reason || '',
      locked_by || null
    ]);
    return res.status(201).json({ success: true, lock: result.rows[0] });
  } catch (error) {
    console.error('Failed to create transaction lock:', error);
    return res.status(500).json({ success: false, message: 'Database error creating transaction lock.' });
  }
};

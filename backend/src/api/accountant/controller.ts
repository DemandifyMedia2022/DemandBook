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
    const result = await query(`
      SELECT mj.*, COALESCE(SUM(je.debit), 0) as total_amount
      FROM manual_journals mj
      LEFT JOIN journal_entries je ON mj.id = je.journal_id
      GROUP BY mj.id
      ORDER BY mj.date DESC, mj.created_at DESC
    `);
    return res.status(200).json({ success: true, journals: result.rows });
  } catch (error) {
    console.error('Failed to list journals:', error);
    return res.status(500).json({ success: false, message: 'Database error listing journals.' });
  }
};

export const createJournal = async (req: Request, res: Response) => {
  const { 
    journal_number, date, reference, notes, status, entries,
    reverse_date, publish_reverse, reporting_method, currency,
    attachments
  } = req.body;

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
      INSERT INTO manual_journals (journal_number, date, reference, notes, status, reverse_date, publish_reverse, reporting_method, currency)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const journalRes = await dbClient.query(journalQuery, [
      journal_number,
      date || new Date(),
      reference || '',
      notes || '',
      status || 'Draft',
      reverse_date || null,
      publish_reverse || false,
      reporting_method || 'Accrual and Cash',
      currency || 'INR'
    ]);
    const newJournal = journalRes.rows[0];

    const entryQuery = `
      INSERT INTO journal_entries (journal_id, account_id, debit, credit, description, contact_id)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;

    for (const entry of entries) {
      await dbClient.query(entryQuery, [
        newJournal.id,
        entry.account_id,
        entry.debit || 0.00,
        entry.credit || 0.00,
        entry.description || '',
        entry.contact_id || null
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

    // Insert attachments if any
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const attachmentQuery = `
        INSERT INTO manual_journal_attachments (journal_id, file_name, file_data)
        VALUES ($1, $2, $3)
      `;
      for (const att of attachments) {
        await dbClient.query(attachmentQuery, [
          newJournal.id,
          att.file_name,
          att.file_data
        ]);
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
      SELECT je.*, coa.account_name, coa.account_code, c.name as contact_name
      FROM journal_entries je
      JOIN chart_of_accounts coa ON je.account_id = coa.id
      LEFT JOIN clients c ON je.contact_id = c.id
      WHERE je.journal_id = $1
    `, [id]);

    const attachmentsRes = await query(`
      SELECT id, file_name, file_data FROM manual_journal_attachments WHERE journal_id = $1
    `, [id]);

    return res.status(200).json({
      success: true,
      journal: journalRes.rows[0],
      entries: entriesRes.rows,
      attachments: attachmentsRes.rows
    });
  } catch (error) {
    console.error('Failed to get journal details:', error);
    return res.status(500).json({ success: false, message: 'Database error getting journal details.' });
  }
};

export const deleteJournal = async (req: Request, res: Response) => {
  const { id } = req.params;
  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    // 1. Get journal entries and status
    const journalRes = await dbClient.query('SELECT status FROM manual_journals WHERE id = $1', [id]);
    if (journalRes.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Journal not found.' });
    }

    const { status } = journalRes.rows[0];

    // 2. If the journal is Posted, we should reverse the effect on account balance before deletion
    if (status === 'Posted') {
      const entriesRes = await dbClient.query('SELECT account_id, debit, credit FROM journal_entries WHERE journal_id = $1', [id]);
      for (const entry of entriesRes.rows) {
        const diff = parseFloat(entry.debit || 0) - parseFloat(entry.credit || 0);
        await dbClient.query(`
          UPDATE chart_of_accounts
          SET balance = balance - $1, updated_at = NOW()
          WHERE id = $2
        `, [diff, entry.account_id]);
      }
    }

    // 3. Delete the manual journal
    await dbClient.query('DELETE FROM manual_journals WHERE id = $1', [id]);

    await dbClient.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Manual journal deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete manual journal:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error deleting journal.' });
  } finally {
    (await client).release();
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

// Bulk Update Transactions
export const listBulkTransactions = async (req: Request, res: Response) => {
  const { account_id, contact_id, start_date, end_date, min_amount, max_amount } = req.query;

  try {
    let queryText = `
      SELECT je.*, mj.journal_number, mj.date as journal_date, mj.status as journal_status, mj.currency as journal_currency, coa.account_name, coa.account_code, c.name as contact_name
      FROM journal_entries je
      JOIN manual_journals mj ON je.journal_id = mj.id
      JOIN chart_of_accounts coa ON je.account_id = coa.id
      LEFT JOIN clients c ON je.contact_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (account_id) {
      params.push(parseInt(account_id as string));
      queryText += ` AND je.account_id = $${params.length}`;
    }

    if (contact_id) {
      if (contact_id === 'null') {
        queryText += ` AND je.contact_id IS NULL`;
      } else {
        params.push(parseInt(contact_id as string));
        queryText += ` AND je.contact_id = $${params.length}`;
      }
    }

    if (start_date) {
      params.push(start_date);
      queryText += ` AND mj.date >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      queryText += ` AND mj.date <= $${params.length}`;
    }

    if (min_amount) {
      params.push(parseFloat(min_amount as string));
      queryText += ` AND GREATEST(je.debit, je.credit) >= $${params.length}`;
    }

    if (max_amount) {
      params.push(parseFloat(max_amount as string));
      queryText += ` AND GREATEST(je.debit, je.credit) <= $${params.length}`;
    }

    queryText += ' ORDER BY mj.date DESC, mj.journal_number DESC, je.id ASC';

    const result = await query(queryText, params);
    return res.status(200).json({ success: true, transactions: result.rows });
  } catch (error) {
    console.error('Failed to list bulk transactions:', error);
    return res.status(500).json({ success: false, message: 'Database error listing transactions.' });
  }
};

export const executeBulkUpdate = async (req: Request, res: Response) => {
  const { entry_ids, new_account_id, new_contact_id } = req.body;

  if (!entry_ids || !Array.isArray(entry_ids) || entry_ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Select at least one transaction entry line.' });
  }

  if (new_account_id === undefined && new_contact_id === undefined) {
    return res.status(400).json({ success: false, message: 'Provide a new Account or new Contact to update.' });
  }

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    for (const entryId of entry_ids) {
      // 1. Fetch entry and status
      const entryRes = await dbClient.query(`
        SELECT je.*, mj.status as journal_status 
        FROM journal_entries je 
        JOIN manual_journals mj ON je.journal_id = mj.id 
        WHERE je.id = $1
      `, [entryId]);

      if (entryRes.rows.length === 0) continue;
      const entry = entryRes.rows[0];

      // 2. Update account and correct balance if Posted
      if (new_account_id !== undefined && new_account_id !== null && parseInt(new_account_id) !== entry.account_id) {
        const destAccountId = parseInt(new_account_id);
        if (entry.journal_status === 'Posted') {
          const diff = parseFloat(entry.debit || 0) - parseFloat(entry.credit || 0);
          // Revert old account balance
          await dbClient.query(`
            UPDATE chart_of_accounts
            SET balance = balance - $1, updated_at = NOW()
            WHERE id = $2
          `, [diff, entry.account_id]);
          // Add to new account balance
          await dbClient.query(`
            UPDATE chart_of_accounts
            SET balance = balance + $1, updated_at = NOW()
            WHERE id = $2
          `, [diff, destAccountId]);
        }
        await dbClient.query('UPDATE journal_entries SET account_id = $1 WHERE id = $2', [destAccountId, entryId]);
      }

      // 3. Update contact if specified
      if (new_contact_id !== undefined) {
        const contactVal = new_contact_id === null || new_contact_id === -1 ? null : parseInt(new_contact_id);
        await dbClient.query('UPDATE journal_entries SET contact_id = $1 WHERE id = $2', [contactVal, entryId]);
      }
    }

    await dbClient.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Transactions updated successfully.' });
  } catch (error) {
    console.error('Failed to execute bulk update:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error executing bulk update.' });
  } finally {
    (await client).release();
  }
};

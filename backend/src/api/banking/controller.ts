import { Request, Response } from 'express';
import { query, pool } from '../../db';

export const listAccounts = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM bank_accounts ORDER BY created_at DESC');
    return res.status(200).json({ success: true, accounts: result.rows });
  } catch (error) {
    console.error('Failed to list bank accounts:', error);
    return res.status(500).json({ success: false, message: 'Database error listing bank accounts.' });
  }
};

export const createAccount = async (req: Request, res: Response) => {
  const { account_name, account_type, account_number, bank_name, balance, status } = req.body;

  if (!account_name || !account_type) {
    return res.status(400).json({ success: false, message: 'Account Name and Account Type are required.' });
  }

  try {
    const result = await query(`
      INSERT INTO bank_accounts (account_name, account_type, account_number, bank_name, balance, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [
      account_name,
      account_type,
      account_number || '',
      bank_name || '',
      balance || 0.00,
      status || 'Active'
    ]);
    return res.status(201).json({ success: true, account: result.rows[0] });
  } catch (error) {
    console.error('Failed to create bank account:', error);
    return res.status(500).json({ success: false, message: 'Database error creating bank account.' });
  }
};

export const listTransactions = async (req: Request, res: Response) => {
  const { account_id } = req.query;
  try {
    let q = `
      SELECT bt.*, ba.account_name
      FROM bank_transactions bt
      JOIN bank_accounts ba ON bt.bank_account_id = ba.id
    `;
    const params: any[] = [];
    if (account_id) {
      params.push(account_id);
      q += ` WHERE bt.bank_account_id = $1`;
    }
    q += ` ORDER BY bt.date DESC, bt.created_at DESC`;

    const result = await query(q, params);
    return res.status(200).json({ success: true, transactions: result.rows });
  } catch (error) {
    console.error('Failed to list bank transactions:', error);
    return res.status(500).json({ success: false, message: 'Database error listing bank transactions.' });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  const { bank_account_id, date, transaction_type, amount, description, status } = req.body;

  if (!bank_account_id || !transaction_type || !amount) {
    return res.status(400).json({ success: false, message: 'Bank Account ID, Transaction Type, and Amount are required.' });
  }

  const client = pool.connect();
  try {
    const dbClient = await client;
    await dbClient.query('BEGIN');

    // Fetch current bank account details
    const accRes = await dbClient.query('SELECT balance FROM bank_accounts WHERE id = $1', [bank_account_id]);
    if (accRes.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Bank account not found.' });
    }

    const currentBalance = parseFloat(accRes.rows[0].balance);
    const txAmount = parseFloat(amount);
    let newBalance = currentBalance;

    if (transaction_type === 'Deposit') {
      newBalance += txAmount;
    } else if (transaction_type === 'Withdrawal') {
      newBalance -= txAmount;
    }

    // Insert transaction
    const insertTxQuery = `
      INSERT INTO bank_transactions (bank_account_id, date, transaction_type, amount, description, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const txRes = await dbClient.query(insertTxQuery, [
      bank_account_id,
      date || new Date(),
      transaction_type,
      txAmount,
      description || '',
      status || 'Uncleared'
    ]);

    // Update account balance
    await dbClient.query(`
      UPDATE bank_accounts
      SET balance = $1, updated_at = NOW()
      WHERE id = $2
    `, [newBalance, bank_account_id]);

    await dbClient.query('COMMIT');
    return res.status(201).json({ success: true, transaction: txRes.rows[0] });
  } catch (error) {
    console.error('Failed to create bank transaction:', error);
    try {
      await (await client).query('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ success: false, message: 'Database error creating transaction.' });
  } finally {
    (await client).release();
  }
};

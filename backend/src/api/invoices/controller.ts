import { Request, Response } from 'express';
import { invoiceService } from './service';
import { invoiceRepository } from './repository';
import { query } from '../../db';
import nodemailer from 'nodemailer';

export const list = async (req: Request, res: Response) => {
  try {
    const filters = {
        status: req.query.status !== 'All' ? req.query.status : undefined,
        search: req.query.q || undefined,
        customer_id: req.query.customer_id || undefined
    };
    
    const limit = parseInt((req.query.limit as string) || '10');
    const offset = parseInt((req.query.offset as string) || '0');

    const result = await invoiceService.getInvoices(filters, limit, offset);
    return res.status(200).json({ success: true, invoices: result.data, total: result.total });
  } catch (error) {
    console.error('Failed to list invoices:', error);
    return res.status(500).json({ success: false, message: 'Database error listing invoices.' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 1; // Assuming authMiddleware sets req.user
    const invoice = await invoiceService.createInvoice(req.body, userId);
    return res.status(201).json({ success: true, invoice });
  } catch (error: any) {
    console.error('Failed to create invoice:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'An invoice with this number already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Database error creating invoice.' });
  }
};

export const getDetails = async (req: Request, res: Response) => {
    try {
        const invoice = await invoiceService.getInvoiceDetails(parseInt(req.params.id));
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        return res.status(200).json({ success: true, invoice });
    } catch (error) {
        console.error('Failed to get invoice:', error);
        return res.status(500).json({ success: false, message: 'Error retrieving invoice details' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || 1;
        const invoice = await invoiceService.updateInvoice(parseInt(req.params.id), req.body, userId);
        return res.status(200).json({ success: true, invoice });
    } catch (error) {
        console.error('Failed to update invoice:', error);
        return res.status(500).json({ success: false, message: 'Error updating invoice' });
    }
};

export const deleteInvoice = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || 1;
        await invoiceService.deleteInvoice(parseInt(req.params.id), userId);
        return res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Failed to delete invoice:', error);
        return res.status(500).json({ success: false, message: 'Error deleting invoice' });
    }
};

export const recordPayment = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || 1;
        const payment = await invoiceService.recordPayment(parseInt(req.params.id), req.body, userId);
        return res.status(201).json({ success: true, payment });
    } catch (error: any) {
        console.error('Failed to record payment:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error recording payment' });
    }
};

export const sendEmail = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || 1;
        const invoiceId = parseInt(req.params.id);
        const invoice = await invoiceService.getInvoiceDetails(invoiceId);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        
        // Create reusable transporter object using SMTP credentials from environment
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || "587"),
            secure: process.env.MAIL_PORT === "465" || process.env.SMTP_PORT === "465" || process.env.SMTP_SECURE === "true", // true for 465
            auth: {
                user: process.env.MAIL_USERNAME || process.env.SMTP_USER, // Your SMTP user
                pass: process.env.MAIL_PASSWORD || process.env.SMTP_PASS, // Your SMTP password
            },
        });

        // Send mail with defined transport object
        const senderEmail = process.env.MAIL_USERNAME || process.env.SMTP_USER;
        const info = await transporter.sendMail({
            from: `"DemandERP Billing" <${senderEmail}>`, // sender address must match auth to avoid relay error
            to: invoice.customer_email || "customer@example.com", // list of receivers
            subject: `Invoice ${invoice.number} from DemandBooks`, // Subject line
            text: `Hello ${invoice.customer_name},\n\nPlease find the details for Invoice ${invoice.number}.\nTotal Amount: ${invoice.amount} ${invoice.currency}\nBalance Due: ${invoice.balance} ${invoice.currency}\nDue Date: ${new Date(invoice.due_date).toLocaleDateString()}\n\nThank you for your business!`, // plain text body
            html: `<div style="font-family: sans-serif; padding: 20px;">
                    <h2 style="color: #4338ca;">DemandBooks</h2>
                    <p>Hello <b>${invoice.customer_name}</b>,</p>
                    <p>This is a notification that <b>Invoice ${invoice.number}</b> has been generated for your account.</p>
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;">Total Amount: <b>${invoice.amount} ${invoice.currency}</b></p>
                        <p style="margin: 5px 0;">Balance Due: <b style="color: #ef4444;">${invoice.balance} ${invoice.currency}</b></p>
                        <p style="margin: 5px 0;">Due Date: <b>${new Date(invoice.due_date).toLocaleDateString()}</b></p>
                    </div>
                    <p>Thank you for your business!</p>
                   </div>`, // html body
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);

        // Record Activity
        await invoiceRepository.logActivity(invoiceId, userId, 'Email Sent', `Invoice emailed to ${invoice.customer_email}`);
        
        // Update status to 'Sent' if it was 'Draft'
        if (invoice.status === 'Draft') {
            await invoiceService.updateInvoice(invoiceId, { status: 'Sent' }, userId);
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Email sent successfully'
        });
    } catch (error) {
        console.error('Failed to send email:', error);
        return res.status(500).json({ success: false, message: 'Error sending email' });
    }
};

export const summary = async (req: Request, res: Response) => {
  try {
    const summaryQuery = `
      SELECT 
        SUM(amount) AS total_receivables,
        SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) AS draft_count,
        SUM(CASE WHEN status = 'Sent' THEN 1 ELSE 0 END) AS sent_count,
        SUM(CASE WHEN status = 'Overdue' THEN amount ELSE 0 END) AS overdue_total,
        SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END) AS paid_total,
        SUM(CASE WHEN status = 'Overdue' THEN 1 ELSE 0 END) AS overdue_count,
        SUM(CASE WHEN status = 'Paid' THEN 1 ELSE 0 END) AS paid_count,
        SUM(balance) as outstanding_amount,
        COUNT(*) as total_invoices
      FROM invoices WHERE deleted_at IS NULL;
    `;
    const result = await query(summaryQuery);
    const row = result.rows[0];

    return res.status(200).json({
      success: true,
      totalReceivables: parseFloat(row.total_receivables) || 0.00,
      outstandingAmount: parseFloat(row.outstanding_amount) || 0.00,
      overdueTotal: parseFloat(row.overdue_total) || 0.00,
      paidTotal: parseFloat(row.paid_total) || 0.00,
      totalInvoices: parseInt(row.total_invoices) || 0,
      draftCount: parseInt(row.draft_count) || 0,
      sentCount: parseInt(row.sent_count) || 0,
      overdueCount: parseInt(row.overdue_count) || 0,
      paidCount: parseInt(row.paid_count) || 0
    });
  } catch (error) {
    console.error('Failed to fetch invoices summary:', error);
    return res.status(500).json({ success: false, message: 'Database error fetching invoice summary.' });
  }
};

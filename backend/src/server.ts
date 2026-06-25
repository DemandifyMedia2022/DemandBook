import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { query } from './db';

// Import Middlewares
import { authMiddleware, AuthRequest } from './middlewares/auth';

// Import Routes
import authRoutes from './api/auth/routes';
import clientRoutes from './api/clients/routes';
import invoiceRoutes from './api/invoices/routes';
import billRoutes from './api/bills/routes';
import paymentRoutes from './api/payments/routes';
import productRoutes from './api/products/routes';
import adminRoutes from './api/admins/routes';
import organizationRoutes from './api/settings/organization/routes';

import quotesRoutes from './api/quotes/routes';
import salesOrdersRoutes from './api/sales-orders/routes';
import deliveryChallansRoutes from './api/delivery-challans/routes';
import creditNotesRoutes from './api/credit-notes/routes';
import ewayBillsRoutes from './api/eway-bills/routes';
import paymentsReceivedRoutes from './api/payments-received/routes';
import recurringInvoicesRoutes from './api/recurring-invoices/routes';
import recurringExpensesRoutes from './api/recurring-expenses/routes';
import purchaseOrdersRoutes from './api/purchase-orders/routes';
import recurringBillsRoutes from './api/recurring-bills/routes';
import paymentsMadeRoutes from './api/payments-made/routes';
import vendorCreditsRoutes from './api/vendor-credits/routes';
import projectsRoutes from './api/projects/routes';
import timesheetsRoutes from './api/timesheets/routes';
import bankingRoutes from './api/banking/routes';
import complianceRoutes from './api/compliance/routes';
import accountantRoutes from './api/accountant/routes';
import documentsRoutes from './api/documents/routes';

const app = express();
const PORT = process.env.PORT || 8888;

// Configure CORS policy to support Next.js frontend connections
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
  ],
  credentials: true
}));

app.use(express.json());

// Database connection sanity check
query('SELECT NOW(), current_database()')
  .then(res => {
    if (res && res.rows.length > 0) {
      console.log(`Database connected successfully. Database: ${res.rows[0].current_database}, Current timestamp: ${res.rows[0].now}`);
    }
  })
  .catch(err => {
    console.error('Critical Error: Failed to connect to PostgreSQL database.', err.message);
    console.warn('Make sure PostgreSQL is running on port 5432 and credentials are correct.');
  });

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Unprotected authentication routes (/api/login & /api/register)
app.use('/api', authRoutes);

// Protected profile user details route
app.get('/api/me', authMiddleware, (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

// Domain-driven routes
app.use('/api/client', clientRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/invoices', invoiceRoutes); // Support plural
app.use('/api/bill', billRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/product', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings/organization', organizationRoutes);

app.use('/api/quotes', quotesRoutes);
app.use('/api/sales-orders', salesOrdersRoutes);
app.use('/api/delivery-challans', deliveryChallansRoutes);
app.use('/api/credit-notes', creditNotesRoutes);
app.use('/api/eway-bills', ewayBillsRoutes);
app.use('/api/payments-received', paymentsReceivedRoutes);
app.use('/api/recurring-invoices', recurringInvoicesRoutes);
app.use('/api/recurring-expenses', recurringExpensesRoutes);
app.use('/api/purchase-orders', purchaseOrdersRoutes);
app.use('/api/recurring-bills', recurringBillsRoutes);
app.use('/api/payments-made', paymentsMadeRoutes);
app.use('/api/vendor-credits', vendorCreditsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/timesheets', timesheetsRoutes);
app.use('/api/banking', bankingRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/accountant', accountantRoutes);
app.use('/api/documents', documentsRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM MIDDLEWARES
// ─────────────────────────────────────────────────────────────────────────────

// Root check endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('DemandERP backend server is running successfully.');
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Express runtime exception occurred:', err);
  res.status(500).json({ success: false, message: 'Internal server error occurred on the backend.' });
});

app.listen(PORT, () => {
  console.log(`DemandERP backend server listening on: http://localhost:${PORT}`);
});

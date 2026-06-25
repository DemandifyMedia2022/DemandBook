# DemandERP Enterprise Suite

DemandERP is a modern, high-performance Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) suite designed for high-density SaaS environments. The project is split into a **Next.js Frontend** and an **Express.js Backend** connected to a **PostgreSQL** database.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | React Server Components, Client states, and metadata |
| | TypeScript | Strict type checking for ERP entities |
| | Tailwind CSS | Curated color system (Deep Indigo / Corporate Blue / Slate) |
| | Material Symbols Icons | Standard Google icons for clean interfaces |
| **Backend** | Node.js & Express.js | Dynamic REST controllers, middlewares, token authentication |
| **Database** | PostgreSQL | Relational schema with transactional mapping |
| **Auth & RBAC** | JWT Auth | Cookie-based or header-based tokens with Role-Based Access Control |

---

## 📁 Repository Structure & Directory Map

The codebase is split into two separate directories:

1. **Frontend (This folder)**: `c:\Users\Sanjog Adhav\Desktop\Demand-ERP\`
   - Implements 8 responsive pages converted from Stitch UI designs with custom interactivity, filters, and state models.
2. **Backend**: `c:\Users\Sanjog Adhav\Desktop\idurar-erp-crm\backend\`
   - Implements PostgreSQL queries, controllers, authentication middlewares, and dynamic API routing.

---

## 🚀 Setup & Installation Guide

To run the complete suite, follow these steps in order:

### 1. PostgreSQL Database Setup
Ensure PostgreSQL is running locally (default: `localhost:5432`). 

1. Create a database named `idurar_erp_crm` or let the backend script create it.
2. If using custom credentials, set the connection string in the backend environment.

---

### 2. Express Backend Setup
Go to the backend directory `c:\Users\Sanjog Adhav\Desktop\idurar-erp-crm\backend\`:

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configure Environment Variables**:
   Create a `.env` or `.env.local` file in the backend root:
   ```env
   # PostgreSQL Connection String (uses default if empty)
   DATABASE_URL="postgresql://postgres:sanjog123@localhost:5432"
   
   # JWT Secret Key
   JWT_SECRET="your_private_jwt_secret_key"
   
   # Node Environment
   NODE_ENV="development"
   PORT=8888
   ```
3. **Run DB Scaffolding**:
   This runs the schema inside `postgres_schema.sql` to initialize tables:
   ```bash
   npm run setup:pg
   ```
4. **Launch the Backend Dev Server**:
   ```bash
   npm run dev
   ```
   The backend will start on [http://localhost:8888](http://localhost:8888).

---

### 3. Next.js Frontend Setup
Go to the frontend directory `c:\Users\Sanjog Adhav\Desktop\Demand-ERP\`:

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Launch the Next.js Dev Server**:
   ```bash
   npm run dev
   ```
   The frontend will start on [http://localhost:3000](http://localhost:3000).

---

## 🔗 API Integration Mapping

All frontend pages in `src/app/` are currently built with mock static states. To connect them to the backend:

### 1. Unified API Fetch Wrapper
Create a utility client file `src/lib/api.ts` to handle auth tokens:
```typescript
const API_BASE = 'http://localhost:8888/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Read token from localStorage or cookie
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (res.status === 401) {
    // Handle unauthorized/logout redirection
  }
  return res.json();
}
```

### 2. Screen-to-Route Endpoint Mapping

| Screen / Page | Next.js Page File | Backend REST Endpoint | SQL Target Table |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `src/app/page.tsx` | `GET /api/client/summary`<br>`GET /api/invoice/summary` | `clients`, `invoices` |
| **HRMS Directory** | `src/app/hrms/page.tsx` | `GET /api/admin/list`<br>`POST /api/admin/create` | `admins`, `admin_passwords` |
| **CRM Pipeline** | `src/app/crm/page.tsx` | `GET /api/client/list`<br>`POST /api/client/create` | `clients` |
| **Projects (Kanban)** | `src/app/projects/page.tsx` | `GET /api/project/list` *(Custom)* | `projects` *(Add table)* |
| **General Ledger** | `src/app/general-ledger/page.tsx` | `GET /api/invoice/list` | `invoices` |
| **Accounts Payable** | `src/app/accounts-payable/page.tsx` | `GET /api/invoice/list?payment_status=unpaid` | `invoices` |
| **Expenses** | `src/app/expenses/page.tsx` | `GET /api/payment/list`<br>`POST /api/payment/create` | `payments` |

---

## 🔐 Authentication Flow

1. **User Sign In**:
   - Make a `POST` request to `/api/login` containing `email` and `password`.
   - The backend validates the credentials against `admin_passwords` using `bcrypt` and returns a JWT token signed via `JWT_SECRET`.
   - Store the token inside HTTPOnly Cookies or `localStorage` in the browser.
2. **Access Control**:
   - The backend verifies permissions by extracting the `role` (e.g., `owner`, `admin`, `staff`) from the user's token validation in `isValidAuthToken.js`.
   - On the frontend, write a middleware in `src/middleware.ts` to redirect users without tokens to `/login`.

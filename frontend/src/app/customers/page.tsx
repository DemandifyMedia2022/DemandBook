// "use clients";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";
// import {
//   PageHeader, StatCard, SectionCard, StatusBadge,
//   SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB
// } from "@/components/ui/page-shell";

// interface Customer {
//   id: string;
//   name: string;
//   avatarInitials: string;
//   status: "Active" | "Inactive";
//   balance: number;
//   email: string;
//   phone: string;
// }

// const initialCustomers: Customer[] = [
//   { id: "CUST-4092", name: "Acme Solutions", avatarInitials: "AS", status: "Active", balance: 12450.0, email: "john.doe@acme.com", phone: "+91 98765 43210" },
//   { id: "CUST-3912", name: "Blue Tier Tech", avatarInitials: "BT", status: "Active", balance: 4200.5, email: "sarah@bluetier.io", phone: "+91 91234 56789" },
//   { id: "CUST-2844", name: "Cloud Harbor", avatarInitials: "CH", status: "Inactive", balance: 0.0, email: "billing@charbor.com", phone: "+91 80001 11222" },
//   { id: "CUST-5512", name: "Digital Wave Inc", avatarInitials: "DW", status: "Active", balance: 1120.0, email: "mark@digitalwave.io", phone: "+91 77777 12345" },
//   { id: "CUST-8210", name: "Eco Stream Logistics", avatarInitials: "ES", status: "Active", balance: 52000.0, email: "admin@ecostream.log", phone: "+91 88884 56789" },
//   { id: "CUST-6390", name: "FlexTech Systems", avatarInitials: "FS", status: "Active", balance: 7800.0, email: "info@flextech.in", phone: "+91 99990 11100" },
//   { id: "CUST-7104", name: "GlobalMart Retail", avatarInitials: "GM", status: "Inactive", balance: 320.0, email: "pay@globalmart.in", phone: "+91 80080 08080" },
// ];

// export default function Customers() {
//   const router = useRouter();
//   const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("All");
//   const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");

//   const toggleSort = () => setSortOrder((s) => s === "none" ? "asc" : s === "asc" ? "desc" : "none");

//   let processed = customers.filter((c) => {
//     const q = searchQuery.toLowerCase();
//     return (
//       (c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) &&
//       (selectedStatus === "All" || c.status === selectedStatus)
//     );
//   });
//   if (sortOrder === "asc") processed = [...processed].sort((a, b) => a.name.localeCompare(b.name));
//   if (sortOrder === "desc") processed = [...processed].sort((a, b) => b.name.localeCompare(a.name));

//   const totalReceivables = customers.reduce((s, c) => s + c.balance, 0);
//   const activeCount = customers.filter((c) => c.status === "Active").length;

//   return (
//     <div className="p-6 max-w-[1440px] mx-auto space-y-6">
//       <PageHeader
//         title="Customers"
//         subtitle="Manage your customer relationships and outstanding receivables."
//         actions={
//           <button
//             onClick={() => router.push("/customers/new")}
//             className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
//           >
//             <span className="material-symbols-outlined text-[17px]">add</span>
//             New Customer
//           </button>
//         }
//       />

//       {/* KPI Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <StatCard label="Total Customers" value={String(customers.length + 1279)} icon="groups" trend={{ label: "+12% from last month", up: true }} />
//         <StatCard label="Total Receivables" value={`₹${totalReceivables.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="account_balance_wallet" trend={{ label: "15 Overdue payments", up: null }} iconColor="text-destructive" />
//         <StatCard label="Active Customers" value={String(activeCount + 847)} icon="autorenew" trend={{ label: "98% Retention rate", up: true }} />
//       </div>

//       {/* Table */}
//       <SectionCard
//         title="Customer Directory"
//         subtitle={`${processed.length} customers`}
//         noPadding
//         actions={
//           <div className="flex items-center gap-2">
//             <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search customers..." />
//             <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Active", "Inactive"]} />
//             <button
//               onClick={toggleSort}
//               className="flex items-center gap-1 px-2.5 py-1.5 text-muted-foreground hover:bg-card-container rounded-lg transition-colors text-xs font-semibold border border-border"
//             >
//               <span className="material-symbols-outlined text-[16px]">sort_by_alpha</span>
//               {sortOrder === "none" ? "Sort" : sortOrder === "asc" ? "A→Z" : "Z→A"}
//             </button>
//           </div>
//         }
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[720px]">
//             <thead>
//               <tr>
//                 <Th>Customer</Th>
//                 <Th>Status</Th>
//                 <Th right>Outstanding Balance</Th>
//                 <Th>Contact</Th>
//                 <Th>Actions</Th>
//               </tr>
//             </thead>
//             <tbody>
//               {processed.map((cust) => (
//                 <TableRow key={cust.id}>
//                   <Td>
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
//                         {cust.avatarInitials}
//                       </div>
//                       <div>
//                         <p className="font-bold text-foreground text-sm">{cust.name}</p>
//                         <p className="text-[11px] text-muted-foreground">{cust.id}</p>
//                       </div>
//                     </div>
//                   </Td>
//                   <Td><StatusBadge status={cust.status} /></Td>
//                   <Td className={cn("text-right font-bold font-mono", cust.balance > 0 && "text-destructive")}>
//                     ₹{cust.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//                   </Td>
//                   <Td>
//                     <p className="text-xs text-foreground">{cust.email}</p>
//                     <p className="text-[11px] text-muted-foreground">{cust.phone}</p>
//                   </Td>
//                   <Td>
//                     <div className="flex items-center gap-1">
//                       <a href={`tel:${cust.phone}`} title="Call" className="p-1.5 rounded hover:bg-card-container text-muted-foreground hover:text-primary transition-colors">
//                         <span className="material-symbols-outlined text-[17px]">call</span>
//                       </a>
//                       <a href={`mailto:${cust.email}`} title="Email" className="p-1.5 rounded hover:bg-card-container text-muted-foreground hover:text-primary transition-colors">
//                         <span className="material-symbols-outlined text-[17px]">mail</span>
//                       </a>
//                     </div>
//                   </Td>
//                 </TableRow>
//               ))}
//               {processed.length === 0 && <EmptyState icon="person_search" message="No customers match your filters." colSpan={5} />}
//             </tbody>
//           </table>
//         </div>
//       </SectionCard>

//       <FAB label="New Customer" onClick={() => router.push("/customers/new")} />
//     </div>
//   );
// }


"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  Search,
  Plus,
  Mail,
  Phone,
  MoreHorizontal,
  ChevronDown,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types — matches the `clients` table shape returned by your API
// ---------------------------------------------------------------------------
interface Client {
  id: number;
  custom_id: string;
  name: string;
  display_name: string | null;
  company_name: string | null;
  email: string;
  phone: string;
  work_phone: string | null;
  mobile_phone: string | null;
  type: "customer" | "vendor";
  status: "Active" | "Inactive";
  balance: number;
  gstin: string | null;
  customer_type: "Business" | "Individual" | null;
  currency: string;
}

interface SummaryData {
  totalCount: number;
  activeCount: number;
  totalReceivables: number;
}

const statusColors = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Inactive: { bg: "bg-zinc-100", text: "text-zinc-600", dot: "bg-zinc-400" },
};

// ---------------------------------------------------------------------------
// API helpers — adjust the base path if your app doesn't proxy through /api
// ---------------------------------------------------------------------------
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function fetchClients(params: { status?: string; q?: string }) {
  const search = new URLSearchParams({ type: "customer" });
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);

  const res = await fetch(`${API_BASE}/clients/list?${search.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load customers.");
  const data = await res.json();
  return data.clients as Client[];
}

async function fetchSummary() {
  const res = await fetch(`${API_BASE}/clients/summary`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load summary.");
  const data = await res.json();
  return data as SummaryData;
}

async function deactivateClient(id: number) {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to deactivate customer.");
  }
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
function StatCard({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
      <span className="text-[13px] font-medium text-zinc-500">{label}</span>
      {loading ? (
        <div className="h-[26px] w-20 bg-zinc-100 rounded animate-pulse" />
      ) : (
        <span className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">
          {value}
        </span>
      )}
    </div>
  );
}

function ActionsMenu({
  client,
  onEdit,
  onDeactivate,
}: {
  client: Client;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-zinc-200 rounded-lg shadow-lg z-20 py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit();
              }}
              className="w-full text-left px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50"
            >
              Edit
            </button>
            {client.status === "Active" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onDeactivate();
                }}
                className="w-full text-left px-3 py-2 text-[13px] text-red-600 hover:bg-red-50"
              >
                Deactivate
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Customers() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsData, summary] = await Promise.all([
        fetchClients({
          status: selectedStatus !== "All" ? selectedStatus : undefined,
          q: searchQuery || undefined,
        }),
        fetchSummary(),
      ]);
      setClients(clientsData);
      setSummaryData(summary);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadClients();
    }, 300);
    return () => clearTimeout(timeout);
  }, [loadClients]);

  const handleDeactivate = async (client: Client) => {
    if (!confirm(`Deactivate ${client.display_name || client.name}?`)) return;
    try {
      await deactivateClient(client.id);
      loadClients();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
              Customers
            </h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Manage relationships and track receivables
            </p>
          </div>

          <button
            onClick={() => router.push("/customers/new")}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Customer
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Customers"
            value={String(summaryData?.totalCount ?? 0)}
            loading={!summaryData}
          />
          <StatCard
            label="Active"
            value={String(summaryData?.activeCount ?? 0)}
            loading={!summaryData}
          />
          <StatCard
            label="Total Outstanding"
            value={`₹${(summaryData?.totalReceivables ?? 0).toLocaleString("en-IN", {
              minimumFractionDigits: 0,
            })}`}
            loading={!summaryData}
          />
        </div>

        {/* Table section */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">
                Customer Directory
              </h2>
              <p className="text-[12px] text-zinc-500">
                {loading ? "Loading…" : `${clients.length} customer${clients.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                />
              </div>

              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Customer</th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Status</th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Contact</th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">GSTIN</th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Outstanding</th>
                <th className="px-6 py-2.5 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-5 h-5 text-zinc-300 animate-spin mx-auto" />
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-[13px] text-red-600">{error}</p>
                    <button
                      onClick={loadClients}
                      className="mt-2 text-[12px] text-[#5B5FEF] hover:underline"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                clients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => router.push(`/customers/${client.id}`)}
                    className="hover:bg-zinc-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-zinc-900">
                          {client.display_name || client.company_name || client.name}
                        </p>
                        <p className="text-[12px] text-zinc-500">{client.custom_id}</p>
                      </div>
                    </td>

                    <td className="px-6 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
                          statusColors[client.status].bg,
                          statusColors[client.status].text
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", statusColors[client.status].dot)} />
                        {client.status}
                      </span>
                    </td>

                    <td className="px-6 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          <a
                            href={`mailto:${client.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[12px] text-[#5B5FEF] hover:underline"
                          >
                            {client.email}
                          </a>
                        </div>
                        {(client.work_phone || client.mobile_phone || client.phone) && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-zinc-400" />
                            <a
                              href={`tel:${client.mobile_phone || client.work_phone || client.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[12px] text-zinc-600 hover:text-zinc-900"
                            >
                              {client.mobile_phone || client.work_phone || client.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-3 text-[12px] text-zinc-600 font-mono">
                      {client.gstin || "—"}
                    </td>

                    <td className="px-6 py-3 font-mono text-[13px] font-medium text-zinc-900 tabular-nums">
                      {client.currency === "INR" ? "₹" : client.currency + " "}
                      {(client.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <ActionsMenu
                        client={client}
                        onEdit={() => router.push(`/customers/${client.id}/edit`)}
                        onDeactivate={() => handleDeactivate(client)}
                      />
                    </td>
                  </tr>
                ))}

              {!loading && !error && clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-[13px] text-zinc-400">No customers match your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
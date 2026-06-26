// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";
// import {
//   PageHeader, StatCard, SectionCard, StatusBadge,
//   SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB
// } from "@/components/ui/page-shell";

// interface Invoice {
//   id: number;
//   number: string;
//   customer_name: string;
//   customer_email: string;
//   amount: number;
//   balance: number;
//   due_date: string;
//   status: "Draft" | "Sent" | "Viewed" | "Partial" | "Paid" | "Overdue" | "Cancelled";
//   created_at: string;
// }

// export default function Invoices() {
//   const router = useRouter();
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("All");
//   const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Summary stats
//   const [summary, setSummary] = useState({
//       totalReceivables: 0,
//       overdueTotal: 0,
//       paidTotal: 0,
//       overdueCount: 0,
//       paidCount: 0
//   });

//   const fetchInvoices = async () => {
//     setLoading(true);
//     try {
//         const queryParams = new URLSearchParams();
//         if (selectedStatus !== "All") queryParams.append("status", selectedStatus);
//         if (searchQuery) queryParams.append("q", searchQuery);

//         const token = localStorage.getItem("token");
//         const res = await fetch(`http://localhost:8888/api/invoice?${queryParams.toString()}`, {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });
//         const data = await res.json();
//         if (data.success) {
//             setInvoices(data.invoices);
//         }
//     } catch (error) {
//         console.error("Failed to fetch invoices", error);
//     } finally {
//         setLoading(false);
//     }
//   };

//   const fetchSummary = async () => {
//       try {
//           const token = localStorage.getItem("token");
//           const res = await fetch(`http://localhost:8888/api/invoice/summary`, {
//               headers: { 'Authorization': `Bearer ${token}` }
//           });
//           const data = await res.json();
//           if (data.success) {
//               setSummary(data);
//           }
//       } catch (error) {
//           console.error("Failed to fetch summary", error);
//       }
//   };

//   useEffect(() => {
//       fetchSummary();
//   }, []);

//   useEffect(() => {
//       const delayDebounceFn = setTimeout(() => {
//           fetchInvoices();
//       }, 300);

//       return () => clearTimeout(delayDebounceFn);
//   }, [searchQuery, selectedStatus]);

//   const handleSelectAll = (checked: boolean) => setSelectedInvoices(checked ? invoices.map((i) => i.id) : []);
//   const handleSelectRow = (checked: boolean, id: number) =>
//     setSelectedInvoices(checked ? [...selectedInvoices, id] : selectedInvoices.filter((n) => n !== id));

//   const handleExportCSV = () => {
//       if (!invoices || invoices.length === 0) {
//           alert("No invoices to export");
//           return;
//       }

//       const headers = ["Invoice #", "Customer", "Date", "Due Date", "Amount", "Balance", "Status"];
//       const rows = invoices.map((i: any) => [
//           i.number,
//           `"${i.customer_name}"`,
//           new Date(i.invoice_date).toLocaleDateString(),
//           new Date(i.due_date).toLocaleDateString(),
//           i.amount,
//           i.balance,
//           i.status
//       ]);

//       const csvContent = [
//           headers.join(","),
//           ...rows.map(row => row.join(","))
//       ].join("\n");

//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.setAttribute("href", url);
//       link.setAttribute("download", `invoices_export_${new Date().toISOString().split("T")[0]}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//   };

//   return (
//     <div className="p-6 max-w-[1440px] mx-auto space-y-6">
//       <PageHeader
//         title="Invoices"
//         subtitle="Track receivables, manage invoice statuses and follow up on overdue amounts."
//         actions={
//           <div className="flex items-center gap-2">
//             <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:bg-card-container transition-colors">
//               <span className="material-symbols-outlined text-[16px]">file_download</span>
//               Export
//             </button>
//             <button
//               onClick={() => router.push("/invoices/create")}
//               className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
//             >
//               <span className="material-symbols-outlined text-[17px]">add</span>
//               New Invoice
//             </button>
//           </div>
//         }
//       />

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard label="Total Receivables" value={`₹${summary.totalReceivables.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="account_balance_wallet" trend={{ label: "+4.2% from last month", up: true }} />
//         <StatCard label="Overdue" value={`₹${summary.overdueTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="warning" iconColor="text-destructive" trend={{ label: `${summary.overdueCount} invoices past due`, up: false }} />
//         <StatCard label="Paid This Month" value={`₹${summary.paidTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="check_circle" trend={{ label: `${summary.paidCount} payments cleared`, up: true }} />
//         <StatCard label="Avg. Collection" value="18 Days" icon="schedule" trend={{ label: "−2 days from average", up: true }} />
//       </div>

//       <SectionCard
//         title="Invoice Register"
//         subtitle={loading ? "Loading invoices..." : `Showing ${invoices.length} invoices`}
//         noPadding
//         actions={
//           <div className="flex items-center gap-2">
//             <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search invoices..." />
//             <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Paid", "Overdue", "Partial", "Sent", "Draft"]} />
//             <button className="p-2 rounded-lg border border-border hover:bg-card-container text-muted-foreground transition-colors" title="Print">
//               <span className="material-symbols-outlined text-[18px]">print</span>
//             </button>
//           </div>
//         }
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[780px]">
//             <thead>
//               <tr>
//                 <Th>
//                   <input type="checkbox" className="rounded cursor-pointer" checked={selectedInvoices.length === invoices.length && invoices.length > 0} onChange={(e) => handleSelectAll(e.target.checked)} />
//                 </Th>
//                 <Th>Invoice #</Th>
//                 <Th>Customer</Th>
//                 <Th right>Amount</Th>
//                 <Th>Due Date</Th>
//                 <Th>Status</Th>
//                 <Th></Th>
//               </tr>
//             </thead>
//             <tbody>
//               {invoices.map((inv) => (
//                 <TableRow key={inv.id} onClick={() => router.push(`/invoices/${inv.id}`)}>
//                   <Td>
//                     <input type="checkbox" className="rounded cursor-pointer" checked={selectedInvoices.includes(inv.id)} onChange={(e) => handleSelectRow(e.target.checked, inv.id)} onClick={(e) => e.stopPropagation()} />
//                   </Td>
//                   <Td className="font-mono font-bold text-primary">{inv.number}</Td>
//                   <Td>
//                     <p className="font-bold text-foreground">{inv.customer_name}</p>
//                     <p className="text-[11px] text-muted-foreground">{inv.customer_email}</p>
//                   </Td>
//                   <Td className="text-right">
//                     <p className="font-bold text-foreground">₹{Number(inv.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
//                     {inv.balance !== undefined && <p className="text-[10px] text-muted-foreground">Bal: ₹{Number(inv.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
//                   </Td>
//                   <Td className={cn(inv.status === "Overdue" ? "text-destructive font-bold" : "text-muted-foreground")}>{new Date(inv.due_date).toLocaleDateString()}</Td>
//                   <Td><StatusBadge status={inv.status} /></Td>
//                   <Td>
//                     <button className="p-1 rounded hover:bg-card-container text-muted-foreground hover:text-primary transition-colors">
//                       <span className="material-symbols-outlined text-[18px]">more_horiz</span>
//                     </button>
//                   </Td>
//                 </TableRow>
//               ))}
//               {invoices.length === 0 && !loading && <EmptyState icon="description" message="No invoices match the filter." colSpan={7} />}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-card-container-low">
//           <span className="text-xs text-muted-foreground">1 – {invoices.length} of {invoices.length}</span>
//           <div className="flex items-center gap-1">
//             <button disabled className="p-1.5 rounded hover:bg-card-container text-muted-foreground disabled:opacity-30 transition-colors">
//               <span className="material-symbols-outlined text-[18px]">chevron_left</span>
//             </button>
//             <button disabled className="p-1.5 rounded hover:bg-card-container text-muted-foreground disabled:opacity-30 transition-colors">
//               <span className="material-symbols-outlined text-[18px]">chevron_right</span>
//             </button>
//           </div>
//         </div>
//       </SectionCard>

//       <FAB label="New Invoice" onClick={() => router.push("/invoices/create")} />
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Invoice {
  id: number;
  number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  balance: number;
  due_date: string;
  invoice_date: string;
  status: "Draft" | "Sent" | "Viewed" | "Partial" | "Paid" | "Overdue" | "Cancelled";
  created_at: string;
}

const STATUS_CONFIG: Record<
  Invoice["status"],
  { label: string; dot: string; text: string; bg: string }
> = {
  Draft: { label: "Draft", dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-100" },
  Sent: { label: "Sent", dot: "bg-blue-400", text: "text-blue-700", bg: "bg-blue-50" },
  Viewed: { label: "Viewed", dot: "bg-violet-400", text: "text-violet-700", bg: "bg-violet-50" },
  Partial: { label: "Partial", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  Paid: { label: "Paid", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  Overdue: { label: "Overdue", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  Cancelled: { label: "Cancelled", dot: "bg-zinc-300", text: "text-zinc-500", bg: "bg-zinc-100" },
};

function StatusPill({ status }: { status: Invoice["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md", cfg.bg, cfg.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function fmt(n: number) {
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUSES = ["All", "Paid", "Overdue", "Partial", "Sent", "Viewed", "Draft", "Cancelled"];

export default function Invoices() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalReceivables: 0,
    overdueTotal: 0,
    paidTotal: 0,
    overdueCount: 0,
    paidCount: 0,
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "All") params.append("status", selectedStatus);
      if (searchQuery) params.append("q", searchQuery);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8888/api/invoice?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setInvoices(data.invoices);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8888/api/invoice/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSummary(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchSummary(); }, []);
  useEffect(() => {
    const t = setTimeout(fetchInvoices, 300);
    return () => clearTimeout(t);
  }, [searchQuery, selectedStatus]);

  const allChecked = selectedIds.length === invoices.length && invoices.length > 0;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < invoices.length;
  const toggleAll = (c: boolean) => setSelectedIds(c ? invoices.map((i) => i.id) : []);
  const toggleRow = (c: boolean, id: number) =>
    setSelectedIds(c ? [...selectedIds, id] : selectedIds.filter((n) => n !== id));

  const handleExportCSV = () => {
    if (!invoices.length) return alert("No invoices to export");
    const headers = ["Invoice #", "Customer", "Date", "Due Date", "Amount", "Balance", "Status"];
    const rows = invoices.map((i) => [
      i.number,
      `"${i.customer_name}"`,
      new Date(i.invoice_date).toLocaleDateString(),
      new Date(i.due_date).toLocaleDateString(),
      i.amount, i.balance, i.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: `invoices_${new Date().toISOString().split("T")[0]}.csv`,
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const collectPct = Math.min(
    summary.totalReceivables > 0
      ? Math.round((summary.paidTotal / (summary.paidTotal + summary.totalReceivables)) * 100)
      : 0,
    100
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* Sub-nav */}
      <div className="bg-white border-b border-zinc-200 px-8">
        <div className="flex items-center gap-6 text-[13px] font-medium h-12">
          {["Invoices", "Estimates", "Recurring", "Credit Notes", "Payment Receipts"].map((item, i) => (
            <span
              key={item}
              className={cn(
                "py-[14px] border-b-2 cursor-pointer transition-colors",
                i === 0
                  ? "text-indigo-600 border-indigo-600"
                  : "text-zinc-500 hover:text-zinc-800 border-transparent"
              )}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-7 space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-zinc-900 tracking-tight">Invoices</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Track receivables, manage statuses and follow up on overdue amounts.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-600 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2v8m0 0-3-3m3 3 3-3M2 11v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => router.push("/invoices/create")}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-indigo-200"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v10M3 8h10" strokeLinecap="round" />
              </svg>
              New Invoice
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-4">
          {/* Total Receivables */}
          <div className="bg-white border border-zinc-200/70 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Receivables</p>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                +4.2%
              </span>
            </div>
            <p className="text-[26px] font-semibold text-zinc-900 tabular-nums leading-none">{fmt(summary.totalReceivables)}</p>
            <p className="text-[12px] text-zinc-400 mt-2">vs last month</p>
          </div>

          {/* Overdue */}
          <div className="bg-white border border-red-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Overdue</p>
              <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                {summary.overdueCount} invoices
              </span>
            </div>
            <p className="text-[26px] font-semibold text-red-600 tabular-nums leading-none">{fmt(summary.overdueTotal)}</p>
            <p className="text-[12px] text-red-500 mt-2 font-medium cursor-pointer hover:underline">Send reminders →</p>
          </div>

          {/* Paid This Month */}
          <div className="bg-white border border-zinc-200/70 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Paid This Month</p>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {summary.paidCount} payments
              </span>
            </div>
            <p className="text-[26px] font-semibold text-zinc-900 tabular-nums leading-none">{fmt(summary.paidTotal)}</p>
            <p className="text-[12px] text-zinc-400 mt-2">{summary.paidCount} payments cleared</p>
          </div>

          {/* Collection rate */}
          <div className="bg-white border border-zinc-200/70 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Avg. Collection</p>
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">−2 days</span>
            </div>
            <p className="text-[26px] font-semibold text-zinc-900 tabular-nums leading-none">18 Days</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${collectPct}%` }} />
              </div>
              <span className="text-[11px] text-zinc-400">{collectPct}%</span>
            </div>
          </div>
        </div>

        {/* Main table card */}
        <div className="bg-white border border-zinc-200/70 rounded-xl overflow-hidden">

          {/* Table toolbar */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Status tabs */}
              <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 gap-0.5 flex-wrap">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    className={cn(
                      "text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors whitespace-nowrap",
                      selectedStatus === s
                        ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                        : "text-zinc-500 hover:text-zinc-700"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-[12px] text-zinc-600 font-medium">{selectedIds.length} selected</span>
                  <button className="text-[12px] text-red-600 hover:underline">Delete</button>
                  <button className="text-[12px] text-indigo-600 hover:underline">Send</button>
                </div>
              )}
              {/* Search */}
              <div className="relative">
                <svg className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-colors"
                />
              </div>
              {/* Print */}
              <button
                title="Print"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="5" width="10" height="7" rx="1" /><path d="M5 5V3h6v2M5 9h2m-2 2h6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[820px]">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-100">
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-zinc-300 cursor-pointer accent-indigo-600"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = indeterminate; }}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </th>
                  {[
                    ["Invoice #", ""],
                    ["Customer", ""],
                    ["Invoice Date", ""],
                    ["Due Date", ""],
                    ["Amount", "text-right"],
                    ["Status", ""],
                    ["", ""],
                  ].map(([label, cls]) => (
                    <th
                      key={label}
                      className={cn("px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap", cls)}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-5 py-4">
                        <div className="h-4 bg-zinc-100 rounded animate-pulse w-full" />
                      </td>
                    </tr>
                  ))
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-zinc-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="12" y2="17" />
                        </svg>
                        <p className="text-[13px] text-zinc-400">No invoices match the current filter.</p>
                        <button
                          onClick={() => { setSearchQuery(""); setSelectedStatus("All"); }}
                          className="text-[12px] text-indigo-600 hover:underline mt-1"
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const isOverdue = inv.status === "Overdue";
                    const isSelected = selectedIds.includes(inv.id);
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => router.push(`/invoices/${inv.id}`)}
                        className={cn(
                          "cursor-pointer transition-colors group",
                          isSelected ? "bg-indigo-50/60" : "hover:bg-zinc-50/80"
                        )}
                      >
                        <td className="px-5 py-3.5 w-10">
                          <input
                            type="checkbox"
                            className="rounded border-zinc-300 cursor-pointer accent-indigo-600"
                            checked={isSelected}
                            onChange={(e) => toggleRow(e.target.checked, inv.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        {/* Invoice # */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-[13px] font-bold text-indigo-600">{inv.number}</span>
                        </td>
                        {/* Customer */}
                        <td className="px-4 py-3.5">
                          <p className="text-[13px] font-semibold text-zinc-900 leading-none">{inv.customer_name}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{inv.customer_email}</p>
                        </td>
                        {/* Invoice date */}
                        <td className="px-4 py-3.5 text-[13px] text-zinc-500 whitespace-nowrap">
                          {fmtDate(inv.invoice_date || inv.created_at)}
                        </td>
                        {/* Due date */}
                        <td className={cn("px-4 py-3.5 text-[13px] whitespace-nowrap font-medium", isOverdue ? "text-red-600" : "text-zinc-500")}>
                          {isOverdue && (
                            <svg className="w-3 h-3 inline mr-1 mb-0.5" viewBox="0 0 12 12" fill="currentColor">
                              <path d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zm0 2.5a.5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zM6 8a.75.75 0 1 1 0 1.5A.75.75 0 0 1 6 8z" />
                            </svg>
                          )}
                          {fmtDate(inv.due_date)}
                        </td>
                        {/* Amount */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <p className="text-[13px] font-semibold text-zinc-900 tabular-nums">{fmt(inv.amount)}</p>
                          {inv.balance > 0 && inv.balance !== inv.amount && (
                            <p className="text-[10px] text-zinc-400 tabular-nums">Bal: {fmt(inv.balance)}</p>
                          )}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusPill status={inv.status} />
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                              <circle cx="8" cy="3" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="8" cy="13" r="1.2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <p className="text-[12px] text-zinc-400">
              Showing <span className="font-medium text-zinc-600">{invoices.length}</span> of{" "}
              <span className="font-medium text-zinc-600">{invoices.length}</span> invoices
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 border border-zinc-200 disabled:opacity-40 hover:bg-zinc-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="m10 12-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-md text-[12px] font-semibold text-white bg-indigo-600">
                1
              </button>
              <button
                disabled
                className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 border border-zinc-200 disabled:opacity-40 hover:bg-zinc-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="m6 4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => router.push("/invoices/create")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center transition-all active:scale-95 lg:hidden"
      >
        <svg className="w-6 h-6" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
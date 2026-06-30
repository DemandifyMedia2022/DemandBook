// "use client";

// import { useState } from "react";
// import { cn } from "@/lib/utils";
// import {
//   PageHeader, StatCard, SectionCard, StatusBadge,
//   SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB, Modal, FormField, inputCls, selectCls,
// } from "@/components/ui/page-shell";

// interface Bill {
//   number: string;
//   vendor: string;
//   amount: number;
//   dueDate: string;
//   paymentMethod: string;
//   status: "Overdue" | "Open" | "Paid";
//   clearedDate?: string;
// }

// const initialBills: Bill[] = [
//   { number: "BILL-2024-001", vendor: "Stellar Logistics", amount: 12400.0, dueDate: "Oct 12, 2023", paymentMethod: "Bank Transfer", status: "Overdue" },
//   { number: "BILL-2024-002", vendor: "CloudNode Services", amount: 1250.5, dueDate: "Oct 28, 2023", paymentMethod: "Credit Card", status: "Open" },
//   { number: "BILL-2024-003", vendor: "OfficeHub Co.", amount: 482.0, dueDate: "Oct 20, 2023", paymentMethod: "ACH", status: "Paid", clearedDate: "Oct 20, 2023" },
//   { number: "BILL-2024-004", vendor: "Global Ads Agency", amount: 6872.4, dueDate: "Nov 05, 2023", paymentMethod: "Wire", status: "Open" },
//   { number: "BILL-2024-005", vendor: "Rapid Courier Ltd", amount: 3200.0, dueDate: "Nov 10, 2023", paymentMethod: "UPI", status: "Open" },
// ];

// export default function Bills() {
//   const [bills, setBills] = useState<Bill[]>(initialBills);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("All");
//   const [showCreateModal, setShowCreateModal] = useState(false);

//   const [newNumber, setNewNumber] = useState("BILL-2024-006");
//   const [newVendor, setNewVendor] = useState("");
//   const [newAmount, setNewAmount] = useState("");
//   const [newDueDate, setNewDueDate] = useState("");
//   const [newPaymentMethod, setNewPaymentMethod] = useState("Bank Transfer");
//   const [newStatus, setNewStatus] = useState<Bill["status"]>("Open");

//   const handleRecordPayment = (billNumber: string) => {
//     setBills(bills.map((b) =>
//       b.number === billNumber
//         ? { ...b, status: "Paid", clearedDate: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) }
//         : b
//     ));
//   };

//   const handleCreateBill = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newVendor || !newAmount) return;
//     setBills([{ number: newNumber, vendor: newVendor, amount: parseFloat(newAmount), dueDate: newDueDate || "—", paymentMethod: newPaymentMethod, status: newStatus }, ...bills]);
//     setShowCreateModal(false);
//     setNewNumber("BILL-2024-" + String(bills.length + 6).padStart(3, "0"));
//     setNewVendor(""); setNewAmount(""); setNewDueDate(""); setNewPaymentMethod("Bank Transfer"); setNewStatus("Open");
//   };

//   const filtered = bills.filter((b) => {
//     const q = searchQuery.toLowerCase();
//     return (
//       (b.vendor.toLowerCase().includes(q) || b.number.toLowerCase().includes(q)) &&
//       (selectedStatus === "All" || b.status === selectedStatus)
//     );
//   });

//   const totalPayable = bills.filter((b) => b.status !== "Paid").reduce((s, b) => s + b.amount, 0);
//   const overdueTotal = bills.filter((b) => b.status === "Overdue").reduce((s, b) => s + b.amount, 0);
//   const paidCount = bills.filter((b) => b.status === "Paid").length;

//   return (
//     <div className="p-6 max-w-[1440px] mx-auto space-y-6">
//       <PageHeader
//         title="Bills"
//         subtitle="Manage vendor bills, track payables, and record payments."
//         actions={
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
//           >
//             <span className="material-symbols-outlined text-[17px]">add</span>
//             New Bill
//           </button>
//         }
//       />

//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <StatCard label="Outstanding Payables" value={`₹${totalPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="receipt_long" trend={{ label: `${bills.filter(b => b.status !== "Paid").length} open bills`, up: null }} />
//         <StatCard label="Overdue Amount" value={`₹${overdueTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="warning" iconColor="text-destructive" trend={{ label: "Needs immediate action", up: false }} />
//         <StatCard label="Cleared Bills" value={String(paidCount)} icon="check_circle" trend={{ label: "Bills settled this month", up: true }} />
//       </div>

//       <SectionCard
//         title="Bills Register"
//         subtitle={`${filtered.length} bills`}
//         noPadding
//         actions={
//           <div className="flex items-center gap-2">
//             <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search bills..." />
//             <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Open", "Overdue", "Paid"]} />
//           </div>
//         }
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[720px]">
//             <thead>
//               <tr>
//                 <Th>Bill #</Th>
//                 <Th>Vendor</Th>
//                 <Th>Payment Method</Th>
//                 <Th right>Amount</Th>
//                 <Th>Due Date</Th>
//                 <Th>Status</Th>
//                 <Th>Action</Th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((bill) => (
//                 <TableRow key={bill.number}>
//                   <Td className="font-mono font-bold text-primary">{bill.number}</Td>
//                   <Td className="font-semibold text-foreground">{bill.vendor}</Td>
//                   <Td>
//                     <span className="flex items-center gap-1 text-muted-foreground">
//                       <span className="material-symbols-outlined text-[15px]">credit_card</span>
//                       {bill.paymentMethod}
//                     </span>
//                   </Td>
//                   <Td className="text-right font-bold font-mono text-foreground">
//                     ₹{bill.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//                   </Td>
//                   <Td className={cn(bill.status === "Overdue" ? "text-destructive font-bold" : "text-muted-foreground")}>
//                     {bill.clearedDate ? <span className="text-green-600">Cleared {bill.clearedDate}</span> : bill.dueDate}
//                   </Td>
//                   <Td><StatusBadge status={bill.status} /></Td>
//                   <Td>
//                     {bill.status !== "Paid" && (
//                       <button
//                         onClick={() => handleRecordPayment(bill.number)}
//                         className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
//                       >
//                         <span className="material-symbols-outlined text-[14px]">payments</span>
//                         Record Payment
//                       </button>
//                     )}
//                   </Td>
//                 </TableRow>
//               ))}
//               {filtered.length === 0 && <EmptyState icon="receipt_long" message="No bills match the filter." colSpan={7} />}
//             </tbody>
//           </table>
//         </div>
//       </SectionCard>

//       <FAB label="New Bill" onClick={() => setShowCreateModal(true)} />

//       {showCreateModal && (
//         <Modal title="Record New Bill" onClose={() => setShowCreateModal(false)}>
//           <form onSubmit={handleCreateBill} className="p-6 space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="Bill Number">
//                 <input className={inputCls} required value={newNumber} onChange={(e) => setNewNumber(e.target.value)} />
//               </FormField>
//               <FormField label="Status">
//                 <select className={selectCls} value={newStatus} onChange={(e) => setNewStatus(e.target.value as Bill["status"])}>
//                   <option value="Open">Open</option>
//                   <option value="Overdue">Overdue</option>
//                   <option value="Paid">Paid</option>
//                 </select>
//               </FormField>
//             </div>
//             <FormField label="Vendor Name">
//               <input className={inputCls} required placeholder="e.g. Acme Supplies" value={newVendor} onChange={(e) => setNewVendor(e.target.value)} />
//             </FormField>
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="Amount (₹)">
//                 <input type="number" step="0.01" required placeholder="0.00" className={inputCls} value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
//               </FormField>
//               <FormField label="Due Date">
//                 <input className={inputCls} placeholder="Nov 30, 2023" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
//               </FormField>
//             </div>
//             <FormField label="Payment Method">
//               <select className={selectCls} value={newPaymentMethod} onChange={(e) => setNewPaymentMethod(e.target.value)}>
//                 {["Bank Transfer", "Credit Card", "ACH", "Wire", "UPI", "Cash"].map((m) => <option key={m} value={m}>{m}</option>)}
//               </select>
//             </FormField>
//             <div className="pt-4 border-t border-border flex justify-end gap-3">
//               <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:bg-card-container transition-colors">Cancel</button>
//               <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Create Bill</button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// }




"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  CreditCard,
  ChevronDown,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Bill {
  id?: number;
  number: string;
  vendor: string;
  amount: number;
  dueDate: string;
  paymentMethod: string;
  status: "Overdue" | "Open" | "Paid";
  clearedDate?: string;
  client_id?: number;
  raw_due_date?: string;
  other_details?: any;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialBills: Bill[] = [
  { number: "BILL-2024-001", vendor: "Stellar Logistics", amount: 12400.0, dueDate: "Oct 12, 2023", paymentMethod: "Bank Transfer", status: "Overdue" },
  { number: "BILL-2024-002", vendor: "CloudNode Services", amount: 1250.5, dueDate: "Oct 28, 2023", paymentMethod: "Credit Card", status: "Open" },
  { number: "BILL-2024-003", vendor: "OfficeHub Co.", amount: 482.0, dueDate: "Oct 20, 2023", paymentMethod: "ACH", status: "Paid", clearedDate: "Oct 20, 2023" },
  { number: "BILL-2024-004", vendor: "Global Ads Agency", amount: 6872.4, dueDate: "Nov 05, 2023", paymentMethod: "Wire", status: "Open" },
  { number: "BILL-2024-005", vendor: "Rapid Courier Ltd", amount: 3200.0, dueDate: "Nov 10, 2023", paymentMethod: "UPI", status: "Open" },
];

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------
const statusConfig = {
  Paid: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  Open: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    icon: Clock,
  },
  Overdue: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    icon: AlertCircle,
  },
};

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number | null;
}) {
  const positive = delta !== undefined && delta !== null && delta >= 0;

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-zinc-500">{label}</span>
        {delta !== undefined && delta !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
              positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}
          >
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <span className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: Bill["status"] }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
        cfg.bg,
        cfg.text
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h3 className="text-[15px] font-semibold text-zinc-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Page
// ---------------------------------------------------------------------------
export default function Bills() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch("http://localhost:8888/api/bills/list", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.bills) {
        const mapped = data.bills.map((b: any) => ({
          id: b.id,
          number: b.number,
          vendor: b.vendor || "—",
          amount: parseFloat(b.amount) || 0,
          dueDate: b.due_date ? new Date(b.due_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—",
          paymentMethod: b.payment_method || "—",
          status: b.status || "Open",
          clearedDate: b.cleared_date || undefined,
          client_id: b.client_id,
          raw_due_date: b.due_date || "",
          other_details: b.other_details ? (typeof b.other_details === 'string' ? JSON.parse(b.other_details) : b.other_details) : null
        }));
        setBills(mapped);
      }

      // Fetch vendors list
      const vendorRes = await fetch("http://localhost:8888/api/client/list?type=vendor", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const vendorData = await vendorRes.json();
      if (vendorData.success && vendorData.clients) {
        setVendors(vendorData.clients.map((c: any) => ({
          id: c.id,
          name: c.name,
          customId: c.custom_id
        })));
      }
    } catch (err) {
      console.error("Failed to load bills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleRecordPayment = async (billNumber: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8888/api/bills/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ billNumber })
      });
      const data = await res.json();
      if (data.success) {
        fetchBills();
      } else {
        alert(data.message || "Failed to record payment");
      }
    } catch (err) {
      console.error("Failed to clear bill:", err);
      alert("Error recording bill payment");
    }
  };

  const filtered = bills.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.vendor.toLowerCase().includes(q) || b.number.toLowerCase().includes(q)) &&
      (selectedStatus === "All" || b.status === selectedStatus)
    );
  });

  const totalPayable = bills.filter((b) => b.status !== "Paid").reduce((s, b) => s + b.amount, 0);
  const overdueTotal = bills.filter((b) => b.status === "Overdue").reduce((s, b) => s + b.amount, 0);
  const paidCount = bills.filter((b) => b.status === "Paid").length;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Bills</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">Manage vendor bills, track payables, and record payments.</p>
          </div>
          <button
            onClick={() => router.push("/bills/new")}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Bill
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Outstanding Payables"
            value={`₹${totalPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            delta={null}
          />
          <StatCard
            label="Overdue Amount"
            value={`₹${overdueTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            delta={-4.2}
          />
          <StatCard
            label="Cleared Bills"
            value={String(paidCount)}
            delta={18.0}
          />
        </div>

        {/* Table section */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          {/* Table header */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">Bills Register</h2>
              <p className="text-[12px] text-zinc-500">{filtered.length} bill{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                />
              </div>
              {/* Status filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none bg-zinc-50 border border-zinc-200 text-zinc-700 text-[13px] pl-3 pr-8 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 cursor-pointer"
                >
                  {["All", "Open", "Overdue", "Paid"].map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  {["Bill #", "Vendor", "Payment Method", "Amount", "Due Date", "Status", ""].map((h, idx) => (
                    <th
                      key={h}
                      className={cn(
                        "px-6 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider",
                        idx === 3 && "text-right"
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((bill) => (
                  <tr 
                    key={bill.number} 
                    onClick={() => setSelectedBill(bill)}
                    className="hover:bg-zinc-50/40 transition-colors cursor-pointer group"
                  >
                    {/* Bill # */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-[13px] font-bold text-[#5B5FEF]">{bill.number}</span>
                    </td>

                    {/* Vendor */}
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-semibold text-zinc-800">{bill.vendor}</p>
                    </td>

                    {/* Payment Method */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <CreditCard className="w-4 h-4 text-zinc-400" />
                        <span className="text-[13px]">{bill.paymentMethod}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-[13px] font-bold text-zinc-800 tabular-nums">
                        ₹{bill.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Due date */}
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[13px]",
                        bill.status === "Overdue" ? "text-red-600 font-bold" : "text-zinc-500"
                      )}>
                        {bill.clearedDate ? (
                          <span className="text-emerald-600 font-medium">Cleared on {bill.clearedDate}</span>
                        ) : (
                          bill.dueDate
                        )}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={bill.status} />
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      {bill.status !== "Paid" && (
                        <button
                          onClick={() => handleRecordPayment(bill.number)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 border border-zinc-200 hover:border-zinc-300 bg-white rounded-lg transition-all shadow-sm active:scale-95"
                        >
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 italic">
                      No bills match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedBill && (
        <BillDetailsModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
          onEdit={() => {
            setEditingBill(selectedBill);
            setSelectedBill(null);
          }}
          onDeleteSuccess={() => {
            setSelectedBill(null);
            fetchBills();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingBill && (
        <EditBillModal
          bill={editingBill}
          vendors={vendors}
          onClose={() => setEditingBill(null)}
          onSuccess={() => {
            setEditingBill(null);
            fetchBills();
          }}
        />
      )}

      {/* Loading state rendering */}
      {loading && (
        <div className="fixed inset-0 bg-[#FAFAFA]/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
            <p className="text-[13px] text-zinc-500">Loading bills...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// View Details Modal
// ---------------------------------------------------------------------------
interface BillDetailsModalProps {
  bill: Bill;
  onClose: () => void;
  onEdit: () => void;
  onDeleteSuccess: () => void;
}

function BillDetailsModal({ bill, onClose, onEdit, onDeleteSuccess }: BillDetailsModalProps) {
  const [billDetails, setBillDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8888/api/bills/${bill.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setBillDetails(data.bill);
        }
      } catch (err) {
        console.error("Failed to load bill details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (bill.id) {
      fetchDetails();
    } else {
      setLoading(false);
    }
  }, [bill.id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8888/api/bills/${bill.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        onDeleteSuccess();
      } else {
        alert(data.message || "Failed to delete bill");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting bill");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin" />
          <p className="text-[13px] text-zinc-500">Fetching bill details...</p>
        </div>
      </div>
    );
  }

  const activeBill = billDetails || bill;
  const rawDetails = activeBill.other_details ? (typeof activeBill.other_details === 'string' ? JSON.parse(activeBill.other_details) : activeBill.other_details) : {};
  const items = rawDetails.items || [];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[800px] my-8 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-zinc-900">Vendor Bill Details</h3>
              <span className="font-mono text-xs text-zinc-500">#{bill.number}</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Clearing status: {bill.status}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{bill.vendor}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Order Number</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{rawDetails.order_number || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Bill Date</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{rawDetails.bill_date || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Due Date</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{bill.dueDate || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payment Terms</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{bill.paymentMethod || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">A/P Account</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{rawDetails.ap_account || "Accounts Payable"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reverse Charge</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{rawDetails.reverse_charge ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reporting Tags</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{rawDetails.reporting_tags || "—"}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Line Items Table</h4>
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500">Details</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-32">Account</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-16 text-right">Qty</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-24 text-right">Rate</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-24 text-center">Discount</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-20 text-center">Tax</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-28 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {items.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-zinc-50/20">
                      <td className="px-4 py-2 text-[13px] text-zinc-800 font-medium">{item.description}</td>
                      <td className="px-4 py-2 text-[13px] text-zinc-600">{item.account || "—"}</td>
                      <td className="px-4 py-2 text-[13px] text-zinc-600 font-mono text-right tabular-nums">{parseFloat(item.quantity).toFixed(2)}</td>
                      <td className="px-4 py-2 text-[13px] text-zinc-600 font-mono text-right tabular-nums">₹{parseFloat(item.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2 text-[13px] text-zinc-600 text-center">{item.discount_val}{item.discount_type}</td>
                      <td className="px-4 py-2 text-[13px] text-zinc-600 text-center">{item.tax_rate}%</td>
                      <td className="px-4 py-2 text-[13px] font-semibold text-zinc-800 font-mono text-right tabular-nums">₹{parseFloat(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-xs text-zinc-400 italic">No line items mapped.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 bg-zinc-50 p-4 border border-zinc-100 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Sub Total</span>
                <span className="font-mono">₹{parseFloat(bill.amount as any).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>TDS ({rawDetails.tds_rate || "0"}%)</span>
                <span className="font-mono">- ₹{((parseFloat(bill.amount as any) * (parseFloat(rawDetails.tds_rate) || 0)) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>TCS ({rawDetails.tcs_rate || "0"}%)</span>
                <span className="font-mono">+ ₹{((parseFloat(bill.amount as any) * (parseFloat(rawDetails.tcs_rate) || 0)) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Adjustment</span>
                <span className="font-mono">₹{parseFloat(rawDetails.adjustment || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-900 border-t border-zinc-200 pt-2 text-sm">
                <span>Total Amount</span>
                <span className="font-mono text-[#5B5FEF]">₹{parseFloat(bill.amount as any).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Notes</h4>
            <div className="p-3 bg-zinc-50 rounded-lg text-xs text-zinc-600 border border-zinc-100 min-h-[60px] whitespace-pre-wrap">
              {rawDetails.notes || "—"}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
          >
            {deleting ? "Deleting..." : "Delete Bill"}
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 text-xs font-bold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Edit Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit Bill Modal
// ---------------------------------------------------------------------------
interface EditBillModalProps {
  bill: Bill;
  vendors: any[];
  onClose: () => void;
  onSuccess: () => void;
}

function EditBillModal({ bill, vendors, onClose, onSuccess }: EditBillModalProps) {
  const [billNumber, setBillNumber] = useState(bill.number);
  const [vendorId, setVendorId] = useState("");
  
  const rawDetails = bill.other_details || {};
  const [orderNumber, setOrderNumber] = useState(rawDetails.order_number || "");
  const [billDate, setBillDate] = useState(rawDetails.bill_date || "");
  const [dueDate, setDueDate] = useState(bill.raw_due_date || "");
  const [paymentTerms, setPaymentTerms] = useState(bill.paymentMethod || "Due on Receipt");
  const [apAccount, setApAccount] = useState(rawDetails.ap_account || "Accounts Payable");
  const [reverseCharge, setReverseCharge] = useState(rawDetails.reverse_charge || false);
  const [notes, setNotes] = useState(rawDetails.notes || "");
  const [tdsRate, setTdsRate] = useState(rawDetails.tds_rate || "0");
  const [tcsRate, setTcsRate] = useState(rawDetails.tcs_rate || "0");
  const [adjustment, setAdjustment] = useState(rawDetails.adjustment || "0");
  const [status, setStatus] = useState<Bill["status"]>(bill.status);

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Set vendor ID based on matching vendor name
  useEffect(() => {
    if (vendors.length > 0 && bill.vendor) {
      const matched = vendors.find(v => v.name.toLowerCase() === bill.vendor.toLowerCase());
      if (matched) {
        setVendorId(String(matched.id));
      }
    }
  }, [vendors, bill.vendor]);

  // Load items
  useEffect(() => {
    if (rawDetails.items) {
      setRows(rawDetails.items.map((item: any, i: number) => ({
        id: i + 1,
        itemDetails: item.description || "",
        account: item.account || "Cost of Goods Sold",
        quantity: parseFloat(item.quantity) || 1,
        rate: parseFloat(item.rate) || 0,
        discountVal: item.discount_val || 0,
        discountType: item.discount_type || "%",
        tax: `GST ${item.tax_rate}%`,
        customerId: item.customer_id || "",
        amount: parseFloat(item.amount) || 0
      })));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [bill.id]);

  const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
  const SELECT = cn(FIELD, "appearance-none cursor-pointer");

  const updateRow = (id: number, field: string, val: any) => {
    setRows(prevRows =>
      prevRows.map(row => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: val };
        
        const qty = parseFloat(updated.quantity) || 0;
        const rate = parseFloat(updated.rate) || 0;
        const baseAmount = qty * rate;
        const discVal = parseFloat(updated.discountVal) || 0;
        const discountAmt = updated.discountType === "%" ? (baseAmount * discVal) / 100 : discVal;
        
        updated.amount = Math.max(0, baseAmount - discountAmt);
        return updated;
      })
    );
  };

  const addRow = () => {
    const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, {
      id: nextId,
      itemDetails: "",
      account: "Cost of Goods Sold",
      quantity: 1,
      rate: 0,
      discountVal: 0,
      discountType: "%",
      tax: "GST 18%",
      customerId: "",
      amount: 0
    }]);
  };

  const removeRow = (id: number) => {
    if (rows.length === 1) {
      setRows([{
        id: 1,
        itemDetails: "",
        account: "Cost of Goods Sold",
        quantity: 1,
        rate: 0,
        discountVal: 0,
        discountType: "%",
        tax: "GST 18%",
        customerId: "",
        amount: 0
      }]);
    } else {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const subTotal = rows.reduce((acc, r) => acc + r.amount, 0);
  const tdsAmount = (subTotal * (parseFloat(tdsRate) || 0)) / 100;
  const tcsAmount = (subTotal * (parseFloat(tcsRate) || 0)) / 100;
  const grandTotal = Math.max(0, subTotal - tdsAmount + tcsAmount + (parseFloat(adjustment) || 0));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const selectedVendor = vendors.find(v => String(v.id) === String(vendorId));

      const payload = {
        number: billNumber,
        vendorName: selectedVendor ? selectedVendor.name : bill.vendor,
        amount: grandTotal,
        due_date: dueDate,
        payment_method: paymentTerms,
        status: status,
        other_details: {
          ...rawDetails,
          order_number: orderNumber,
          bill_date: billDate,
          ap_account: apAccount,
          reverse_charge: reverseCharge,
          notes: notes,
          tds_rate: tdsRate,
          tcs_rate: tcsRate,
          adjustment: adjustment,
          items: rows.map(r => {
            let taxVal = 18;
            if (r.tax.includes("0%")) taxVal = 0;
            else if (r.tax.includes("5%")) taxVal = 5;
            else if (r.tax.includes("12%")) taxVal = 12;
            else if (r.tax.includes("18%")) taxVal = 18;
            else if (r.tax.includes("28%")) taxVal = 28;
            else if (r.tax.includes("Out of Scope")) taxVal = 0;

            return {
              description: r.itemDetails,
              account: r.account,
              quantity: parseFloat(r.quantity) || 1,
              rate: parseFloat(r.rate) || 0,
              discount_val: r.discountVal,
              discount_type: r.discountType,
              tax_rate: taxVal,
              customer_id: r.customerId || null,
              amount: r.amount
            };
          })
        }
      };

      const res = await fetch(`http://localhost:8888/api/bills/${bill.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        alert(data.message || "Failed to update bill");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving bill changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin" />
          <p className="text-[13px] text-zinc-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[850px] my-8 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h3 className="text-[16px] font-bold text-zinc-900">Edit Vendor Bill</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Modify properties and rows for Bill #{bill.number}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {/* Metadata Edit Form Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Bill Number</label>
              <input required className={FIELD} value={billNumber} onChange={(e) => setBillNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Vendor</label>
              <select required className={SELECT} value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.customId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Order Number</label>
              <input className={FIELD} value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Bill Date</label>
              <input type="date" required className={FIELD} value={billDate} onChange={(e) => setBillDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Due Date</label>
              <input type="date" required className={FIELD} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Status</label>
              <select className={SELECT} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="Open">Open</option>
                <option value="Overdue">Overdue</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Payment Terms</label>
              <select className={SELECT} value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Accounts Payable (AP)</label>
              <select className={SELECT} value={apAccount} onChange={(e) => setApAccount(e.target.value)}>
                <option value="Accounts Payable">Accounts Payable</option>
                <option value="Accrued Liabilities">Accrued Liabilities</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-500">
                <input type="checkbox" checked={reverseCharge} onChange={(e) => setReverseCharge(e.target.checked)} className="rounded border-zinc-300 text-[#5B5FEF] focus:ring-[#5B5FEF] w-4 h-4" />
                Reverse Charge Applicable
              </label>
            </div>
          </div>

          {/* Editable Item Table */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Item Details Grid</h4>
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500">Item Details</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-32">Account</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-16">Qty</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-20">Rate</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-24">Discount</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-24">Tax</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 text-right w-24">Amount</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="p-2">
                        <input required className={FIELD} value={row.itemDetails} onChange={(e) => updateRow(row.id, "itemDetails", e.target.value)} />
                      </td>
                      <td className="p-2">
                        <select className={SELECT} value={row.account} onChange={(e) => updateRow(row.id, "account", e.target.value)}>
                          <option value="Cost of Goods Sold">Cost of Goods Sold</option>
                          <option value="Materials Purchase">Materials Purchase</option>
                          <option value="Office Supplies">Office Supplies</option>
                          <option value="Software Subscriptions">Software Subscriptions</option>
                          <option value="Other Expenses">Other Expenses</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input type="number" min={0.01} step="0.01" className={FIELD} value={row.quantity} onChange={(e) => updateRow(row.id, "quantity", e.target.value)} />
                      </td>
                      <td className="p-2">
                        <input type="number" min={0} step="0.01" className={FIELD} value={row.rate} onChange={(e) => updateRow(row.id, "rate", e.target.value)} />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <input type="number" className="w-12 px-1 py-0.5 text-right font-mono text-xs border border-zinc-200 rounded" value={row.discountVal} onChange={(e) => updateRow(row.id, "discountVal", e.target.value)} />
                          <select className="px-0.5 py-0.5 text-xs border border-zinc-200 rounded" value={row.discountType} onChange={(e) => updateRow(row.id, "discountType", e.target.value)}>
                            <option value="%">%</option>
                            <option value="₹">₹</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-2">
                        <select className={SELECT} value={row.tax} onChange={(e) => updateRow(row.id, "tax", e.target.value)}>
                          <option value="Out of Scope">Out of Scope</option>
                          <option value="GST 0%">GST 0%</option>
                          <option value="GST 5%">GST 5%</option>
                          <option value="GST 12%">GST 12%</option>
                          <option value="GST 18%">GST 18%</option>
                          <option value="GST 28%">GST 28%</option>
                        </select>
                      </td>
                      <td className="p-2 text-right font-mono font-semibold tabular-nums text-zinc-700">
                        ₹{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => removeRow(row.id)} className="text-red-500 hover:bg-red-50 p-1 rounded-lg">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-2 bg-zinc-50 border-t border-zinc-200">
                <button type="button" onClick={addRow} className="text-xs font-bold text-[#5B5FEF] hover:underline flex items-center gap-1">
                  + Add Row
                </button>
              </div>
            </div>
          </div>

          {/* Notes & Summary calculations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Notes</label>
                <textarea className={FIELD} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <div className="bg-zinc-50 p-4 border border-zinc-100 rounded-xl space-y-2 text-[13px]">
              <div className="flex justify-between font-medium text-zinc-500">
                <span>Sub Total</span>
                <span className="font-mono">₹{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>TDS (%)</span>
                <select className="px-1.5 py-0.5 text-xs border border-zinc-200 rounded w-24" value={tdsRate} onChange={(e) => setTdsRate(e.target.value)}>
                  <option value="0">0%</option>
                  <option value="1">1%</option>
                  <option value="2">2%</option>
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                </select>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>TCS (%)</span>
                <select className="px-1.5 py-0.5 text-xs border border-zinc-200 rounded w-24" value={tcsRate} onChange={(e) => setTcsRate(e.target.value)}>
                  <option value="0">0%</option>
                  <option value="0.1">0.1%</option>
                  <option value="1">1%</option>
                  <option value="5">5%</option>
                </select>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>Adjustment</span>
                <input type="number" step="0.01" className="w-24 px-1.5 py-0.5 text-right font-mono text-xs border border-zinc-200 rounded" value={adjustment} onChange={(e) => setAdjustment(e.target.value)} />
              </div>
              <div className="flex justify-between font-bold text-zinc-900 border-t border-zinc-200 pt-2 text-sm">
                <span>Grand Total</span>
                <span className="font-mono text-[#5B5FEF]">₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-bold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1.5">
            {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
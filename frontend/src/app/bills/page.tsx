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

import { useState } from "react";
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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Bill {
  number: string;
  vendor: string;
  amount: number;
  dueDate: string;
  paymentMethod: string;
  status: "Overdue" | "Open" | "Paid";
  clearedDate?: string;
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Bills() {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newNumber, setNewNumber] = useState("BILL-2024-006");
  const [newVendor, setNewVendor] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("Bank Transfer");
  const [newStatus, setNewStatus] = useState<Bill["status"]>("Open");

  const handleRecordPayment = (billNumber: string) => {
    setBills(bills.map((b) =>
      b.number === billNumber
        ? { ...b, status: "Paid", clearedDate: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) }
        : b
    ));
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor || !newAmount) return;
    setBills([
      { number: newNumber, vendor: newVendor, amount: parseFloat(newAmount), dueDate: newDueDate || "—", paymentMethod: newPaymentMethod, status: newStatus },
      ...bills,
    ]);
    setShowCreateModal(false);
    setNewNumber("BILL-2024-" + String(bills.length + 6).padStart(3, "0"));
    setNewVendor(""); setNewAmount(""); setNewDueDate(""); setNewPaymentMethod("Bank Transfer"); setNewStatus("Open");
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

  const inputCls = "w-full px-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors text-zinc-900 placeholder:text-zinc-400";
  const selectCls = "w-full px-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors text-zinc-900 cursor-pointer";

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
            onClick={() => setShowCreateModal(true)}
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
                  className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Paid">Paid</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Bill</th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Status</th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Payment Method</th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Due Date</th>
                <th className="px-6 py-2.5 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Amount</th>
                <th className="px-6 py-2.5 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((bill) => (
                <tr key={bill.number} className="hover:bg-zinc-50/70 transition-colors cursor-pointer">
                  {/* Bill number + vendor */}
                  <td className="px-6 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-zinc-900">{bill.vendor}</p>
                      <p className="text-[12px] text-zinc-500 font-mono">{bill.number}</p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3">
                    <StatusBadge status={bill.status} />
                  </td>

                  {/* Payment method */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-[13px] text-zinc-600">{bill.paymentMethod}</span>
                    </div>
                  </td>

                  {/* Due date */}
                  <td className="px-6 py-3">
                    {bill.clearedDate ? (
                      <span className="text-[13px] text-emerald-600 font-medium">Cleared {bill.clearedDate}</span>
                    ) : (
                      <span className={cn("text-[13px]", bill.status === "Overdue" ? "text-red-600 font-semibold" : "text-zinc-500")}>
                        {bill.dueDate}
                      </span>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-3 text-right font-mono text-[13px] font-semibold text-zinc-900 tabular-nums">
                    ₹{bill.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {bill.status !== "Paid" && (
                        <button
                          onClick={() => handleRecordPayment(bill.number)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#5B5FEF] border border-[#5B5FEF]/20 bg-[#5B5FEF]/5 rounded-lg hover:bg-[#5B5FEF]/10 transition-colors"
                        >
                          Record Payment
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-[13px] text-zinc-400">No bills match your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <Modal title="Record New Bill" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateBill} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-600">Bill Number</label>
                <input className={inputCls} required value={newNumber} onChange={(e) => setNewNumber(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-600">Status</label>
                <select className={selectCls} value={newStatus} onChange={(e) => setNewStatus(e.target.value as Bill["status"])}>
                  <option value="Open">Open</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-zinc-600">Vendor Name</label>
              <input className={inputCls} required placeholder="e.g. Acme Supplies" value={newVendor} onChange={(e) => setNewVendor(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-600">Amount (₹)</label>
                <input type="number" step="0.01" required placeholder="0.00" className={inputCls} value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-zinc-600">Due Date</label>
                <input className={inputCls} placeholder="Nov 30, 2023" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-zinc-600">Payment Method</label>
              <select className={selectCls} value={newPaymentMethod} onChange={(e) => setNewPaymentMethod(e.target.value)}>
                {["Bank Transfer", "Credit Card", "ACH", "Wire", "UPI", "Cash"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-[13px] font-medium text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Create Bill
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
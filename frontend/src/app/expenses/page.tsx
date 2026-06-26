// "use client";

// import { useState } from "react";
// import { cn } from "@/lib/utils";
// import {
//   PageHeader, StatCard, SectionCard, StatusBadge,
//   SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB, Modal, FormField, inputCls, selectCls,
// } from "@/components/ui/page-shell";

// interface Expense {
//   id: string;
//   merchant: string;
//   category: "Travel" | "Meals" | "Supplies" | "Software" | "Shipping" | "Other";
//   date: string;
//   amount: number;
//   status: "Synced" | "Draft" | "Review";
// }

// const initialExpenses: Expense[] = [
//   { id: "EXP-001", merchant: "Delta Airlines", category: "Travel", date: "Sep 24", amount: 1240.0, status: "Synced" },
//   { id: "EXP-002", merchant: "AWS Cloud Services", category: "Software", date: "Sep 22", amount: 342.15, status: "Draft" },
//   { id: "EXP-003", merchant: "Starbucks Reserve", category: "Meals", date: "Sep 21", amount: 18.4, status: "Synced" },
//   { id: "EXP-004", merchant: "Office Depot", category: "Supplies", date: "Sep 20", amount: 125.0, status: "Review" },
//   { id: "EXP-005", merchant: "Uber Business", category: "Travel", date: "Sep 19", amount: 45.8, status: "Synced" },
//   { id: "EXP-006", merchant: "Figma", category: "Software", date: "Sep 18", amount: 15.0, status: "Synced" },
//   { id: "EXP-007", merchant: "Blue Dart Courier", category: "Shipping", date: "Sep 17", amount: 210.0, status: "Draft" },
// ];

// const categoryIcons: Record<Expense["category"], string> = {
//   Travel: "flight",
//   Meals: "restaurant",
//   Supplies: "inventory_2",
//   Software: "computer",
//   Shipping: "local_shipping",
//   Other: "category",
// };

// const categoryColors: Record<Expense["category"], string> = {
//   Travel: "bg-blue-100 text-blue-700",
//   Meals: "bg-orange-100 text-orange-700",
//   Supplies: "bg-amber-100 text-amber-700",
//   Software: "bg-purple-100 text-purple-700",
//   Shipping: "bg-cyan-100 text-cyan-700",
//   Other: "bg-slate-100 text-slate-600",
// };

// export default function Expenses() {
//   const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [selectedStatus, setSelectedStatus] = useState("All");
//   const [showCreateModal, setShowCreateModal] = useState(false);

//   const [newId, setNewId] = useState("EXP-008");
//   const [newMerchant, setNewMerchant] = useState("");
//   const [newCategory, setNewCategory] = useState<Expense["category"]>("Other");
//   const [newDate, setNewDate] = useState("");
//   const [newAmount, setNewAmount] = useState("");
//   const [newStatus, setNewStatus] = useState<Expense["status"]>("Draft");

//   const handleCreate = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newMerchant || !newAmount) return;
//     setExpenses([{ id: newId, merchant: newMerchant, category: newCategory, date: newDate || "Today", amount: parseFloat(newAmount), status: newStatus }, ...expenses]);
//     setShowCreateModal(false);
//     setNewId("EXP-" + String(expenses.length + 8).padStart(3, "0"));
//     setNewMerchant(""); setNewDate(""); setNewAmount(""); setNewCategory("Other"); setNewStatus("Draft");
//   };

//   const filtered = expenses.filter((e) => {
//     const q = searchQuery.toLowerCase();
//     return (
//       (e.merchant.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)) &&
//       (selectedCategory === "All" || e.category === selectedCategory) &&
//       (selectedStatus === "All" || e.status === selectedStatus)
//     );
//   });

//   const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
//   const draftTotal = expenses.filter((e) => e.status === "Draft").reduce((s, e) => s + e.amount, 0);
//   const travelTotal = expenses.filter((e) => e.category === "Travel").reduce((s, e) => s + e.amount, 0);

//   return (
//     <div className="p-6 max-w-[1440px] mx-auto space-y-6">
//       <PageHeader
//         title="Expenses"
//         subtitle="Record and categorize all business expenses for tax and reporting."
//         actions={
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
//           >
//             <span className="material-symbols-outlined text-[17px]">add</span>
//             Add Expense
//           </button>
//         }
//       />

//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <StatCard label="Total Spend (Month)" value={`₹${totalSpend.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="payments" trend={{ label: "+6.4% vs last month", up: false }} />
//         <StatCard label="Pending Sync" value={`₹${draftTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="sync" trend={{ label: `${expenses.filter(e => e.status === "Draft").length} drafts awaiting sync`, up: null }} />
//         <StatCard label="Travel Expenses" value={`₹${travelTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="flight" trend={{ label: "Largest category", up: null }} />
//       </div>

//       <SectionCard
//         title="Expense Log"
//         subtitle={`${filtered.length} entries`}
//         noPadding
//         actions={
//           <div className="flex items-center gap-2">
//             <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search expenses..." />
//             <FilterSelect value={selectedCategory} onChange={setSelectedCategory} options={["All", "Travel", "Meals", "Supplies", "Software", "Shipping", "Other"]} />
//             <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Synced", "Draft", "Review"]} />
//           </div>
//         }
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[680px]">
//             <thead>
//               <tr>
//                 <Th>Merchant</Th>
//                 <Th>Category</Th>
//                 <Th>Date</Th>
//                 <Th right>Amount</Th>
//                 <Th>Status</Th>
//                 <Th>Actions</Th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((exp) => (
//                 <TableRow key={exp.id}>
//                   <Td>
//                     <div className="flex items-center gap-3">
//                       <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", categoryColors[exp.category])}>
//                         <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
//                           {categoryIcons[exp.category]}
//                         </span>
//                       </div>
//                       <div>
//                         <p className="font-bold text-foreground text-sm">{exp.merchant}</p>
//                         <p className="text-[11px] text-muted-foreground">{exp.id}</p>
//                       </div>
//                     </div>
//                   </Td>
//                   <Td>
//                     <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide", categoryColors[exp.category])}>
//                       {exp.category}
//                     </span>
//                   </Td>
//                   <Td className="text-muted-foreground">{exp.date}</Td>
//                   <Td className="text-right font-bold font-mono text-foreground">
//                     ₹{exp.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//                   </Td>
//                   <Td><StatusBadge status={exp.status} /></Td>
//                   <Td>
//                     <div className="flex items-center gap-1">
//                       <button className="p-1.5 rounded hover:bg-card-container text-muted-foreground hover:text-primary transition-colors" title="Edit">
//                         <span className="material-symbols-outlined text-[16px]">edit</span>
//                       </button>
//                       <button className="p-1.5 rounded hover:bg-card-container text-muted-foreground hover:text-destructive transition-colors" title="Delete">
//                         <span className="material-symbols-outlined text-[16px]">delete</span>
//                       </button>
//                     </div>
//                   </Td>
//                 </TableRow>
//               ))}
//               {filtered.length === 0 && <EmptyState icon="payments" message="No expenses match the filter." colSpan={6} />}
//             </tbody>
//           </table>
//         </div>
//       </SectionCard>

//       <FAB label="Add Expense" onClick={() => setShowCreateModal(true)} />

//       {showCreateModal && (
//         <Modal title="Add Expense" onClose={() => setShowCreateModal(false)}>
//           <form onSubmit={handleCreate} className="p-6 space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="Expense ID">
//                 <input className={inputCls} value={newId} onChange={(e) => setNewId(e.target.value)} />
//               </FormField>
//               <FormField label="Status">
//                 <select className={selectCls} value={newStatus} onChange={(e) => setNewStatus(e.target.value as Expense["status"])}>
//                   <option value="Draft">Draft</option>
//                   <option value="Review">Review</option>
//                   <option value="Synced">Synced</option>
//                 </select>
//               </FormField>
//             </div>
//             <FormField label="Merchant">
//               <input className={inputCls} required placeholder="e.g. IndiGo Airlines" value={newMerchant} onChange={(e) => setNewMerchant(e.target.value)} />
//             </FormField>
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="Category">
//                 <select className={selectCls} value={newCategory} onChange={(e) => setNewCategory(e.target.value as Expense["category"])}>
//                   {(["Travel", "Meals", "Supplies", "Software", "Shipping", "Other"] as Expense["category"][]).map((c) => <option key={c} value={c}>{c}</option>)}
//                 </select>
//               </FormField>
//               <FormField label="Date">
//                 <input className={inputCls} placeholder="Sep 24" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
//               </FormField>
//             </div>
//             <FormField label="Amount (₹)">
//               <input type="number" step="0.01" required placeholder="0.00" className={inputCls} value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
//             </FormField>
//             <div className="pt-4 border-t border-border flex justify-end gap-3">
//               <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:bg-card-container transition-colors">Cancel</button>
//               <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Add Expense</button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronDown,
  Plane,
  UtensilsCrossed,
  Package,
  Monitor,
  Truck,
  Tag,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Expense {
  id: string;
  merchant: string;
  category: "Travel" | "Meals" | "Supplies" | "Software" | "Shipping" | "Other";
  date: string;
  amount: number;
  status: "Synced" | "Draft" | "Review";
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const CATEGORY_CONFIG: Record<
  Expense["category"],
  { icon: React.ReactNode; bg: string; text: string }
> = {
  Travel: { icon: <Plane className="w-3.5 h-3.5" />, bg: "bg-blue-50", text: "text-blue-700" },
  Meals: { icon: <UtensilsCrossed className="w-3.5 h-3.5" />, bg: "bg-orange-50", text: "text-orange-700" },
  Supplies: { icon: <Package className="w-3.5 h-3.5" />, bg: "bg-amber-50", text: "text-amber-700" },
  Software: { icon: <Monitor className="w-3.5 h-3.5" />, bg: "bg-violet-50", text: "text-violet-700" },
  Shipping: { icon: <Truck className="w-3.5 h-3.5" />, bg: "bg-cyan-50", text: "text-cyan-700" },
  Other: { icon: <Tag className="w-3.5 h-3.5" />, bg: "bg-zinc-100", text: "text-zinc-600" },
};

const STATUS_CONFIG: Record<
  Expense["status"],
  { dot: string; text: string; bg: string }
> = {
  Synced: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  Draft: { dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-100" },
  Review: { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialExpenses: Expense[] = [
  { id: "EXP-001", merchant: "Delta Airlines", category: "Travel", date: "Sep 24, 2024", amount: 1240.00, status: "Synced" },
  { id: "EXP-002", merchant: "AWS Cloud Services", category: "Software", date: "Sep 22, 2024", amount: 342.15, status: "Draft" },
  { id: "EXP-003", merchant: "Starbucks Reserve", category: "Meals", date: "Sep 21, 2024", amount: 18.40, status: "Synced" },
  { id: "EXP-004", merchant: "Office Depot", category: "Supplies", date: "Sep 20, 2024", amount: 125.00, status: "Review" },
  { id: "EXP-005", merchant: "Uber Business", category: "Travel", date: "Sep 19, 2024", amount: 45.80, status: "Synced" },
  { id: "EXP-006", merchant: "Figma", category: "Software", date: "Sep 18, 2024", amount: 15.00, status: "Synced" },
  { id: "EXP-007", merchant: "Blue Dart Courier", category: "Shipping", date: "Sep 17, 2024", amount: 210.00, status: "Draft" },
];

const CATEGORIES = ["All", "Travel", "Meals", "Supplies", "Software", "Shipping", "Other"] as const;
const STATUSES = ["All", "Synced", "Draft", "Review"] as const;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatCard({ label, value, delta }: { label: string; value: string; delta?: number }) {
  const positive = delta !== undefined && delta >= 0;
  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-zinc-500">{label}</span>
        {delta !== undefined && (
          <span className={cn(
            "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
            positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          )}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <span className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">{value}</span>
    </div>
  );
}

function CategoryBadge({ category }: { category: Expense["category"] }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full", cfg.bg, cfg.text)}>
      {cfg.icon}
      {category}
    </span>
  );
}

function StatusPill({ status }: { status: Expense["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full", cfg.bg, cfg.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {status}
    </span>
  );
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
function AddExpenseModal({
  expenses,
  onClose,
  onAdd,
}: {
  expenses: Expense[];
  onClose: () => void;
  onAdd: (e: Expense) => void;
}) {
  const [id] = useState(`EXP-${String(expenses.length + 8).padStart(3, "0")}`);
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("Other");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Expense["status"]>("Draft");

  const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
  const SELECT = cn(FIELD, "appearance-none cursor-pointer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !amount) return;
    onAdd({ id, merchant, category, date: date || "Today", amount: parseFloat(amount), status });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-[15px] font-semibold text-zinc-900">Add Expense</h3>
            <p className="text-[12px] text-zinc-500 mt-0.5">Record a new business expense</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Expense ID</label>
              <input className={FIELD} value={id} readOnly />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Status</label>
              <select className={SELECT} value={status} onChange={(e) => setStatus(e.target.value as Expense["status"])}>
                <option value="Draft">Draft</option>
                <option value="Review">Review</option>
                <option value="Synced">Synced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Merchant</label>
            <input required placeholder="e.g. IndiGo Airlines" className={FIELD} value={merchant} onChange={(e) => setMerchant(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Category</label>
              <select className={SELECT} value={category} onChange={(e) => setCategory(e.target.value as Expense["category"])}>
                {(["Travel", "Meals", "Supplies", "Software", "Shipping", "Other"] as Expense["category"][]).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Date</label>
              <input type="date" className={FIELD} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Amount (₹)</label>
            <input type="number" step="0.01" min="0" required placeholder="0.00" className={FIELD} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-[#5B5FEF] hover:bg-[#4a4ed8] rounded-lg transition-colors shadow-sm">
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const filtered = expenses.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      (e.merchant.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)) &&
      (selectedCategory === "All" || e.category === selectedCategory) &&
      (selectedStatus === "All" || e.status === selectedStatus)
    );
  });

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const draftTotal = expenses.filter((e) => e.status === "Draft").reduce((s, e) => s + e.amount, 0);
  const travelTotal = expenses.filter((e) => e.category === "Travel").reduce((s, e) => s + e.amount, 0);

  const handleAdd = (exp: Expense) => {
    setExpenses([exp, ...expenses]);
    setShowModal(false);
  };

  const handleDelete = (id: string) => setExpenses(expenses.filter((e) => e.id !== id));

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Expenses</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Record and categorize all business expenses for tax and reporting.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Spend (Month)" value={fmt(totalSpend)} delta={-6.4} />
          <StatCard label="Pending Sync" value={fmt(draftTotal)} />
          <StatCard label="Travel Expenses" value={fmt(travelTotal)} delta={12.1} />
        </div>

        {/* Table card */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">Expense Log</h2>
              <p className="text-[12px] text-zinc-500">{filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-52">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                />
              </div>

              {/* Category filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100">
                {["Merchant", "Category", "Date", "Amount", "Status", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={cn(
                      "px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide",
                      i === 3 ? "text-right" : ""
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((exp) => {
                const catCfg = CATEGORY_CONFIG[exp.category];
                return (
                  <tr key={exp.id} className="hover:bg-zinc-50/70 transition-colors cursor-pointer group">

                    {/* Merchant */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", catCfg.bg, catCfg.text)}>
                          {catCfg.icon}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-zinc-900">{exp.merchant}</p>
                          <p className="text-[12px] text-zinc-500">{exp.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-3">
                      <CategoryBadge category={exp.category} />
                    </td>

                    {/* Date */}
                    <td className="px-6 py-3 text-[13px] text-zinc-500">{exp.date}</td>

                    {/* Amount */}
                    <td className="px-6 py-3 text-right font-mono text-[13px] font-medium text-zinc-900 tabular-nums">
                      {fmt(exp.amount)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3">
                      <StatusPill status={exp.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-[13px] text-zinc-400">No expenses match your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer summary */}
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <span className="text-[12px] text-zinc-400">
                {filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}
              </span>
              <span className="text-[13px] font-semibold text-zinc-900 tabular-nums font-mono">
                Total: {fmt(filtered.reduce((s, e) => s + e.amount, 0))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddExpenseModal expenses={expenses} onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
// "use client";

// import { useState } from "react";
// import { cn } from "@/lib/utils";
// import {
//   PageHeader, StatCard, SectionCard, StatusBadge,
//   SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB, Modal, FormField, inputCls, selectCls,
// } from "@/components/ui/page-shell";

// interface PO {
//   number: string;
//   vendor: string;
//   items: number;
//   total: number;
//   deliveryDate: string;
//   status: "Approved" | "Pending" | "Draft" | "Rejected";
//   createdDate: string;
// }

// const initialPOs: PO[] = [
//   { number: "PO-2024-041", vendor: "Stellar Logistics", items: 12, total: 48200.0, deliveryDate: "Nov 10, 2023", status: "Approved", createdDate: "Oct 18, 2023" },
//   { number: "PO-2024-042", vendor: "TechSystems Inc.", items: 4, total: 12450.0, deliveryDate: "Nov 15, 2023", status: "Pending", createdDate: "Oct 20, 2023" },
//   { number: "PO-2024-043", vendor: "OfficeHub Co.", items: 7, total: 3600.0, deliveryDate: "Nov 02, 2023", status: "Draft", createdDate: "Oct 22, 2023" },
//   { number: "PO-2024-040", vendor: "Swift Delivery LLC", items: 3, total: 9800.0, deliveryDate: "Oct 28, 2023", status: "Approved", createdDate: "Oct 12, 2023" },
//   { number: "PO-2024-039", vendor: "Cloud Services Ltd.", items: 1, total: 1250.0, deliveryDate: "Oct 25, 2023", status: "Rejected", createdDate: "Oct 10, 2023" },
// ];

// export default function PurchaseOrders() {
//   const [pos, setPOs] = useState<PO[]>(initialPOs);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("All");
//   const [showCreateModal, setShowCreateModal] = useState(false);

//   const [newNumber, setNewNumber] = useState("PO-2024-044");
//   const [newVendor, setNewVendor] = useState("");
//   const [newItems, setNewItems] = useState("");
//   const [newTotal, setNewTotal] = useState("");
//   const [newDelivery, setNewDelivery] = useState("");
//   const [newStatus, setNewStatus] = useState<PO["status"]>("Draft");

//   const handleCreate = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newVendor || !newTotal) return;
//     setPOs([{ number: newNumber, vendor: newVendor, items: parseInt(newItems) || 1, total: parseFloat(newTotal), deliveryDate: newDelivery || "—", status: newStatus, createdDate: "Today" }, ...pos]);
//     setShowCreateModal(false);
//     setNewVendor(""); setNewItems(""); setNewTotal(""); setNewDelivery(""); setNewStatus("Draft");
//   };

//   const filtered = pos.filter((p) => {
//     const q = searchQuery.toLowerCase();
//     return (p.vendor.toLowerCase().includes(q) || p.number.toLowerCase().includes(q)) && (selectedStatus === "All" || p.status === selectedStatus);
//   });

//   const approvedTotal = pos.filter((p) => p.status === "Approved").reduce((s, p) => s + p.total, 0);
//   const pendingTotal = pos.filter((p) => p.status === "Pending").reduce((s, p) => s + p.total, 0);

//   return (
//     <div className="p-6 max-w-[1440px] mx-auto space-y-6">
//       <PageHeader
//         title="Purchase Orders"
//         subtitle="Create and track purchase orders with vendors across all your operations."
//         actions={
//           <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm">
//             <span className="material-symbols-outlined text-[17px]">add</span>
//             New PO
//           </button>
//         }
//       />

//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <StatCard label="Total POs" value={String(pos.length)} icon="shopping_cart" trend={{ label: "This financial year", up: null }} />
//         <StatCard label="Approved Value" value={`₹${approvedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="check_circle" trend={{ label: `${pos.filter(p => p.status === "Approved").length} orders approved`, up: true }} />
//         <StatCard label="Pending Approval" value={`₹${pendingTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="hourglass_top" trend={{ label: `${pos.filter(p => p.status === "Pending").length} awaiting review`, up: null }} />
//       </div>

//       <SectionCard title="Purchase Orders" subtitle={`${filtered.length} orders`} noPadding
//         actions={
//           <div className="flex items-center gap-2">
//             <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search POs..." />
//             <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Approved", "Pending", "Draft", "Rejected"]} />
//           </div>
//         }
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[700px]">
//             <thead>
//               <tr>
//                 <Th>PO Number</Th>
//                 <Th>Vendor</Th>
//                 <Th>Items</Th>
//                 <Th right>Total Value</Th>
//                 <Th>Delivery Date</Th>
//                 <Th>Status</Th>
//                 <Th>Created</Th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((po) => (
//                 <TableRow key={po.number}>
//                   <Td className="font-mono font-bold text-primary">{po.number}</Td>
//                   <Td className="font-semibold text-foreground">{po.vendor}</Td>
//                   <Td>
//                     <span className="flex items-center gap-1 text-muted-foreground">
//                       <span className="material-symbols-outlined text-[15px]">inventory_2</span>
//                       {po.items} items
//                     </span>
//                   </Td>
//                   <Td className="text-right font-bold font-mono text-foreground">₹{po.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Td>
//                   <Td className="text-muted-foreground">{po.deliveryDate}</Td>
//                   <Td><StatusBadge status={po.status} /></Td>
//                   <Td className="text-muted-foreground text-xs">{po.createdDate}</Td>
//                 </TableRow>
//               ))}
//               {filtered.length === 0 && <EmptyState icon="shopping_cart" message="No purchase orders found." colSpan={7} />}
//             </tbody>
//           </table>
//         </div>
//       </SectionCard>

//       <FAB label="New PO" onClick={() => setShowCreateModal(true)} />

//       {showCreateModal && (
//         <Modal title="Create Purchase Order" onClose={() => setShowCreateModal(false)}>
//           <form onSubmit={handleCreate} className="p-6 space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="PO Number"><input className={inputCls} value={newNumber} onChange={(e) => setNewNumber(e.target.value)} /></FormField>
//               <FormField label="Status">
//                 <select className={selectCls} value={newStatus} onChange={(e) => setNewStatus(e.target.value as PO["status"])}>
//                   <option value="Draft">Draft</option>
//                   <option value="Pending">Pending</option>
//                   <option value="Approved">Approved</option>
//                 </select>
//               </FormField>
//             </div>
//             <FormField label="Vendor Name"><input className={inputCls} required placeholder="e.g. Acme Corp" value={newVendor} onChange={(e) => setNewVendor(e.target.value)} /></FormField>
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="Number of Items"><input type="number" className={inputCls} placeholder="1" value={newItems} onChange={(e) => setNewItems(e.target.value)} /></FormField>
//               <FormField label="Total Value (₹)"><input type="number" step="0.01" required placeholder="0.00" className={inputCls} value={newTotal} onChange={(e) => setNewTotal(e.target.value)} /></FormField>
//             </div>
//             <FormField label="Expected Delivery Date"><input className={inputCls} placeholder="Nov 30, 2023" value={newDelivery} onChange={(e) => setNewDelivery(e.target.value)} /></FormField>
//             <div className="pt-4 border-t border-border flex justify-end gap-3">
//               <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:bg-card-container transition-colors">Cancel</button>
//               <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Create PO</button>
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
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronDown,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  X,
  ShoppingCart,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PO {
  number: string;
  vendor: string;
  items: number;
  total: number;
  deliveryDate: string;
  status: "Approved" | "Pending" | "Draft" | "Rejected";
  createdDate: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  PO["status"],
  { dot: string; text: string; bg: string; icon: React.ReactNode }
> = {
  Approved: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-3 h-3" /> },
  Pending: { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", icon: <Clock className="w-3 h-3" /> },
  Draft: { dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-100", icon: <FileText className="w-3 h-3" /> },
  Rejected: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", icon: <XCircle className="w-3 h-3" /> },
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialPOs: PO[] = [
  { number: "PO-2024-041", vendor: "Stellar Logistics", items: 12, total: 48200.0, deliveryDate: "Nov 10, 2023", status: "Approved", createdDate: "Oct 18, 2023" },
  { number: "PO-2024-042", vendor: "TechSystems Inc.", items: 4, total: 12450.0, deliveryDate: "Nov 15, 2023", status: "Pending", createdDate: "Oct 20, 2023" },
  { number: "PO-2024-043", vendor: "OfficeHub Co.", items: 7, total: 3600.0, deliveryDate: "Nov 02, 2023", status: "Draft", createdDate: "Oct 22, 2023" },
  { number: "PO-2024-040", vendor: "Swift Delivery LLC", items: 3, total: 9800.0, deliveryDate: "Oct 28, 2023", status: "Approved", createdDate: "Oct 12, 2023" },
  { number: "PO-2024-039", vendor: "Cloud Services Ltd.", items: 1, total: 1250.0, deliveryDate: "Oct 25, 2023", status: "Rejected", createdDate: "Oct 10, 2023" },
];

const STATUSES = ["All", "Approved", "Pending", "Draft", "Rejected"] as const;

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

function StatusPill({ status }: { status: PO["status"] }) {
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
function CreatePOModal({ pos, onClose, onAdd }: { pos: PO[]; onClose: () => void; onAdd: (po: PO) => void }) {
  const [number, setNumber] = useState(`PO-2024-0${44 + pos.length - initialPOs.length}`);
  const [vendor, setVendor] = useState("");
  const [items, setItems] = useState("");
  const [total, setTotal] = useState("");
  const [delivery, setDelivery] = useState("");
  const [status, setStatus] = useState<PO["status"]>("Draft");

  const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
  const SELECT = cn(FIELD, "appearance-none cursor-pointer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || !total) return;
    onAdd({
      number,
      vendor,
      items: parseInt(items) || 1,
      total: parseFloat(total),
      deliveryDate: delivery || "—",
      status,
      createdDate: "Today",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-[15px] font-semibold text-zinc-900">Create Purchase Order</h3>
            <p className="text-[12px] text-zinc-500 mt-0.5">Raise a new PO for a vendor</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">PO Number</label>
              <input className={FIELD} value={number} onChange={(e) => setNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Status</label>
              <select className={SELECT} value={status} onChange={(e) => setStatus(e.target.value as PO["status"])}>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Vendor Name</label>
            <input required placeholder="e.g. Acme Corp" className={FIELD} value={vendor} onChange={(e) => setVendor(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">No. of Items</label>
              <input type="number" min={1} placeholder="1" className={FIELD} value={items} onChange={(e) => setItems(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Total Value (₹)</label>
              <input type="number" step="0.01" min={0} required placeholder="0.00" className={FIELD} value={total} onChange={(e) => setTotal(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Expected Delivery</label>
            <input type="date" className={FIELD} value={delivery} onChange={(e) => setDelivery(e.target.value)} />
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm">
              Create PO
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
export default function PurchaseOrders() {
  const [pos, setPOs] = useState<PO[]>(initialPOs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const filtered = pos.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.vendor.toLowerCase().includes(q) || p.number.toLowerCase().includes(q)) &&
      (selectedStatus === "All" || p.status === selectedStatus)
    );
  });

  const approvedTotal = pos.filter((p) => p.status === "Approved").reduce((s, p) => s + p.total, 0);
  const pendingTotal = pos.filter((p) => p.status === "Pending").reduce((s, p) => s + p.total, 0);

  const handleAdd = (po: PO) => {
    setPOs([po, ...pos]);
    setShowModal(false);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Purchase Orders</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Create and track purchase orders with vendors across all your operations.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New PO
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total POs" value={String(pos.length)} delta={8.3} />
          <StatCard label="Approved Value" value={fmt(approvedTotal)} delta={14.2} />
          <StatCard label="Pending Approval" value={fmt(pendingTotal)} />
        </div>

        {/* Table card */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">Purchase Orders</h2>
              <p className="text-[12px] text-zinc-500">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-52">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search POs..."
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
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100">
                {[
                  ["PO Number", ""],
                  ["Vendor", ""],
                  ["Items", ""],
                  ["Total Value", "text-right"],
                  ["Delivery Date", ""],
                  ["Status", ""],
                  ["Created", ""],
                  ["", ""],
                ].map(([h, cls]) => (
                  <th key={h} className={cn("px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide", cls)}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((po) => (
                <tr key={po.number} className="hover:bg-zinc-50/70 transition-colors cursor-pointer group">

                  {/* PO Number */}
                  <td className="px-6 py-3">
                    <span className="font-mono text-[13px] font-bold text-[#5B5FEF]">{po.number}</span>
                  </td>

                  {/* Vendor */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                        <Truck className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                      <p className="text-[13px] font-medium text-zinc-900">{po.vendor}</p>
                    </div>
                  </td>

                  {/* Items */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1.5 text-[13px] text-zinc-500">
                      <Package className="w-3.5 h-3.5 text-zinc-400" />
                      {po.items} item{po.items !== 1 ? "s" : ""}
                    </div>
                  </td>

                  {/* Total */}
                  <td className="px-6 py-3 text-right font-mono text-[13px] font-semibold text-zinc-900 tabular-nums">
                    {fmt(po.total)}
                  </td>

                  {/* Delivery date */}
                  <td className="px-6 py-3 text-[13px] text-zinc-500">{po.deliveryDate}</td>

                  {/* Status */}
                  <td className="px-6 py-3">
                    <StatusPill status={po.status} />
                  </td>

                  {/* Created */}
                  <td className="px-6 py-3 text-[12px] text-zinc-400">{po.createdDate}</td>

                  {/* Actions */}
                  <td className="px-6 py-3">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart className="w-6 h-6 text-zinc-200" />
                      <p className="text-[13px] text-zinc-400">No purchase orders match your filters.</p>
                      <button
                        onClick={() => { setSearchQuery(""); setSelectedStatus("All"); }}
                        className="text-[12px] text-[#5B5FEF] hover:underline mt-1"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <span className="text-[12px] text-zinc-400">
                {filtered.length} order{filtered.length !== 1 ? "s" : ""}
              </span>
              <span className="text-[13px] font-semibold text-zinc-900 tabular-nums font-mono">
                Total: {fmt(filtered.reduce((s, p) => s + p.total, 0))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <CreatePOModal pos={pos} onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
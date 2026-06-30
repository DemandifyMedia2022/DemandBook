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

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  DollarSign,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PO {
  id?: number;
  number: string;
  vendor: string;
  items: number;
  total: number;
  deliveryDate: string;
  status: "Approved" | "Pending" | "Draft" | "Rejected";
  createdDate: string;
  client_id?: number;
  raw_delivery_date?: string;
  raw_date?: string;
  notes?: string;
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

// Dedicated creation page is now located at /purchase-orders/new

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PurchaseOrders() {
  const router = useRouter();
  const [pos, setPOs] = useState<PO[]>(initialPOs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [editingPO, setEditingPO] = useState<PO | null>(null);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch POs
      const poRes = await fetch("http://localhost:8888/api/purchase-orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const poData = await poRes.json();
      if (poData.success && poData.purchaseOrders) {
        if (poData.purchaseOrders.length > 0) {
          const mapped = poData.purchaseOrders.map((po: any) => ({
            id: po.id,
            number: po.po_number,
            vendor: po.client_name || po.company_name || "—",
            items: po.items_count || 1,
            total: parseFloat(po.amount) || 0,
            deliveryDate: po.delivery_date ? new Date(po.delivery_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—",
            status: po.status === "Sent" ? "Pending" : po.status === "Received" ? "Approved" : po.status === "Cancelled" ? "Rejected" : "Draft",
            createdDate: new Date(po.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
            client_id: po.client_id,
            raw_delivery_date: po.delivery_date ? po.delivery_date.split('T')[0] : "",
            raw_date: po.date ? po.date.split('T')[0] : "",
            notes: po.notes
          }));
          setPOs(mapped);
        } else {
          setPOs([]);
        }
      }

      // Fetch Vendors
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
      console.error("Failed to load purchase order data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = pos.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.vendor.toLowerCase().includes(q) || p.number.toLowerCase().includes(q)) &&
      (selectedStatus === "All" || p.status === selectedStatus)
    );
  });

  const approvedTotal = pos.filter((p) => p.status === "Approved").reduce((s, p) => s + p.total, 0);
  const pendingTotal = pos.filter((p) => p.status === "Pending").reduce((s, p) => s + p.total, 0);

  const handleAdd = async (po: PO, vendorId: number, rawDelivery: string | null) => {
    try {
      const token = localStorage.getItem("token");
      const dbStatus = po.status === "Pending" ? "Sent" : po.status === "Approved" ? "Received" : po.status === "Rejected" ? "Cancelled" : "Draft";

      const payload = {
        po_number: po.number,
        client_id: vendorId,
        date: new Date().toISOString().split('T')[0],
        delivery_date: rawDelivery,
        sub_total: po.total,
        tax_total: 0,
        amount: po.total,
        status: dbStatus,
        notes: "",
        items: [
          {
            product_id: null,
            description: "PO Items",
            quantity: po.items,
            unit: "pcs",
            rate: po.total / po.items,
            tax_rate: 0,
            amount: po.total
          }
        ]
      };

      const response = await fetch("http://localhost:8888/api/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const res = await response.json();
      if (res.success) {
        setPOs([po, ...pos]);
        setShowModal(false);
      } else {
        alert(res.message || "Failed to create purchase order");
      }
    } catch (err) {
      console.error("Failed to create purchase order:", err);
      alert("Error submitting purchase order");
    }
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
            onClick={() => router.push("/purchase-orders/new")}
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

        {/* Purchase Order Lifecycle Flow */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Purchase Order Lifecycle
            </h3>
            <span className="text-[11px] font-medium text-zinc-400 italic">
              Standard operational stages for vendor purchasing
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-2">
            
            {/* Step 1: Raise Purchase Order */}
            <div className="flex-1 w-full max-w-[220px] flex items-center justify-center p-4 border-2 border-blue-200 bg-blue-50/20 rounded-xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform duration-200">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Step 1</p>
                  <p className="text-[13px] font-extrabold text-blue-900 uppercase tracking-wide leading-tight">Raise PO</p>
                </div>
              </div>
            </div>

            {/* Connector 1 */}
            <div className="hidden lg:flex flex-col items-center justify-center px-2 relative flex-grow">
              <span className="text-[10px] font-bold text-[#5B5FEF] uppercase tracking-wider mb-1 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5">
                Convert to Open
              </span>
              <div className="w-full border-t-2 border-dashed border-zinc-300 relative mt-1">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-zinc-400 rotate-45" />
              </div>
            </div>
            
            {/* Mobile Connector 1 */}
            <div className="lg:hidden flex flex-col items-center my-1">
              <span className="text-[10px] font-bold text-[#5B5FEF] uppercase tracking-wider mb-1 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5">
                Convert to Open
              </span>
              <div className="h-6 border-l-2 border-dashed border-zinc-300" />
            </div>

            {/* Step 2: Receive Goods */}
            <div className="flex-1 w-full max-w-[220px] flex items-center justify-center p-4 border-2 border-emerald-200 bg-emerald-50/20 rounded-xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform duration-200">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Step 2</p>
                  <p className="text-[13px] font-extrabold text-emerald-900 uppercase tracking-wide leading-tight">Receive Goods</p>
                </div>
              </div>
            </div>

            {/* Connector 2 */}
            <div className="hidden lg:flex flex-col items-center justify-center px-2 relative flex-grow">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5">
                Convert to Bill
              </span>
              <div className="w-full border-t-2 border-dashed border-zinc-300 relative mt-1">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-zinc-400 rotate-45" />
              </div>
            </div>
            
            {/* Mobile Connector 2 */}
            <div className="lg:hidden flex flex-col items-center my-1">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5">
                Convert to Bill
              </span>
              <div className="h-6 border-l-2 border-dashed border-zinc-300" />
            </div>

            {/* Step 3: Convert to Bill */}
            <div className="flex-1 w-full max-w-[220px] flex items-center justify-center p-4 border-2 border-purple-200 bg-purple-50/20 rounded-xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform duration-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-purple-500 uppercase tracking-wider">Step 3</p>
                  <p className="text-[13px] font-extrabold text-purple-900 uppercase tracking-wide leading-tight">Create Bill</p>
                </div>
              </div>
            </div>

            {/* Connector 3 */}
            <div className="hidden lg:flex flex-col items-center justify-center px-2 relative flex-grow">
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-1 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5">
                Record Payment
              </span>
              <div className="w-full border-t-2 border-dashed border-zinc-300 relative mt-1">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-zinc-400 rotate-45" />
              </div>
            </div>
            
            {/* Mobile Connector 3 */}
            <div className="lg:hidden flex flex-col items-center my-1">
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-1 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5">
                Record Payment
              </span>
              <div className="h-6 border-l-2 border-dashed border-zinc-300" />
            </div>

            {/* Step 4: Record Payment */}
            <div className="flex-1 w-full max-w-[220px] flex items-center justify-center p-4 border-2 border-sky-200 bg-sky-50/20 rounded-xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform duration-200">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-sky-500 uppercase tracking-wider">Step 4</p>
                  <p className="text-[13px] font-extrabold text-sky-900 uppercase tracking-wide leading-tight">Pay Vendor</p>
                </div>
              </div>
            </div>

          </div>
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
                <tr 
                  key={po.number} 
                  onClick={() => setSelectedPO(po)}
                  className="hover:bg-zinc-50/70 transition-colors cursor-pointer group"
                >

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
                  <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setSelectedPO(po)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
                    >
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

      {/* Creation modal removed, routing directly to /new page */}

      {/* View Details Modal */}
      {selectedPO && (
        <PODetailsModal
          po={selectedPO}
          onClose={() => setSelectedPO(null)}
          onEdit={() => {
            setEditingPO(selectedPO);
            setSelectedPO(null);
          }}
          onDeleteSuccess={() => {
            setSelectedPO(null);
            loadData();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingPO && (
        <EditPOModal
          po={editingPO}
          vendors={vendors}
          onClose={() => setEditingPO(null)}
          onSuccess={() => {
            setEditingPO(null);
            loadData();
          }}
        />
      )}

      {/* Loading state rendering */}
      {loading && (
        <div className="fixed inset-0 bg-[#FAFAFA]/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
            <p className="text-[13px] text-zinc-500">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper / Subcomponents for View & Edit
// ---------------------------------------------------------------------------
function parseNotes(notesStr: string | undefined | null) {
  const defaults = {
    notes: "",
    terms_conditions: "",
    reference: "",
    payment_terms: "Due on Receipt",
    shipment_preference: "",
    reverse_charge: false,
    discount_val: "0",
    discount_type: "%",
    tds_rate: "0",
    tcs_rate: "0",
    adjustment: "0",
    delivery_type: "Organization",
    customer_id: "",
    pdf_template: "Standard Template"
  };

  if (!notesStr) return defaults;
  try {
    const parsed = JSON.parse(notesStr);
    return { ...defaults, ...parsed };
  } catch (e) {
    return { ...defaults, notes: notesStr };
  }
}

interface PODetailsModalProps {
  po: PO;
  onClose: () => void;
  onEdit: () => void;
  onDeleteSuccess: () => void;
}

function PODetailsModal({ po, onClose, onEdit, onDeleteSuccess }: PODetailsModalProps) {
  const [poDetails, setPoDetails] = useState<any>(null);
  const [poItems, setPoItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8888/api/purchase-orders/${po.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setPoDetails(data.purchaseOrder);
          setPoItems(data.items || []);
        }
      } catch (err) {
        console.error("Failed to load PO details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (po.id) {
      fetchDetails();
    } else {
      setLoading(false);
    }
  }, [po.id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this purchase order?")) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8888/api/purchase-orders/${po.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        onDeleteSuccess();
      } else {
        alert(data.message || "Failed to delete PO");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting PO");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin" />
          <p className="text-[13px] text-zinc-500">Fetching order details...</p>
        </div>
      </div>
    );
  }

  const meta = parseNotes(po.notes || (poDetails ? poDetails.notes : ""));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[800px] my-8 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-zinc-900">Purchase Order Details</h3>
              <span className="font-mono text-xs text-zinc-500">#{po.number}</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Raised on {po.createdDate}</p>
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
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{po.vendor}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reference#</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{meta.reference || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Delivery Date</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{po.deliveryDate || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payment Terms</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{meta.payment_terms || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Shipment Pref.</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{meta.shipment_preference || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reverse Charge</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{meta.reverse_charge ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Delivery Destination</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{meta.delivery_type}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">{po.status}</p>
            </div>
          </div>

          {/* Delivery Address Details */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Delivery Address Details</h4>
            <div className="p-4 border border-zinc-200/80 rounded-xl bg-zinc-50/20 text-sm">
              {meta.delivery_type === "Organization" ? (
                <div className="space-y-1">
                  <p className="font-extrabold text-[#5B5FEF]">Sunny</p>
                  <p className="text-zinc-500 text-xs leading-relaxed max-w-lg">
                    4th, Office No.15, Nyati Empress, Viman Nagar Road, Viman Nagar, Pune, Maharashtra, India, 411014
                  </p>
                  <p className="text-xs font-semibold text-zinc-700 mt-1">Phone: 91-9373619372</p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-zinc-800">Delivering to Customer ID: {meta.customer_id || "—"}</p>
                  <p className="text-zinc-500 text-xs italic mt-0.5">Please check Customer list for specific billing/shipping address details.</p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Line Items</h4>
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500">Description</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-24 text-right">Qty</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-28 text-right">Rate</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-20 text-center">Tax</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-28 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {poItems.map((item, i) => (
                    <tr key={i} className="hover:bg-zinc-50/20">
                      <td className="px-4 py-2 text-[13px] text-zinc-800 font-medium">{item.description}</td>
                      <td className="px-4 py-2 text-[13px] text-zinc-600 font-mono text-right tabular-nums">{parseFloat(item.quantity).toFixed(2)}</td>
                      <td className="px-4 py-2 text-[13px] text-zinc-600 font-mono text-right tabular-nums">₹{parseFloat(item.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2 text-[13px] text-zinc-600 text-center">{item.tax_rate}%</td>
                      <td className="px-4 py-2 text-[13px] font-semibold text-zinc-800 font-mono text-right tabular-nums">₹{parseFloat(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {poItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-xs text-zinc-400 italic">No line items saved.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Notes</h4>
              <div className="p-3 bg-zinc-50 rounded-lg text-xs text-zinc-600 border border-zinc-100 min-h-[60px] whitespace-pre-wrap">
                {meta.notes || "—"}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Terms & Conditions</h4>
              <div className="p-3 bg-zinc-50 rounded-lg text-xs text-zinc-600 border border-zinc-100 min-h-[60px] whitespace-pre-wrap">
                {meta.terms_conditions || "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
          >
            {deleting ? "Deleting..." : "Delete PO"}
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
              Edit PO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EditPOModalProps {
  po: PO;
  vendors: any[];
  onClose: () => void;
  onSuccess: () => void;
}

function EditPOModal({ po, vendors, onClose, onSuccess }: EditPOModalProps) {
  const [poNumber, setPoNumber] = useState(po.number);
  const [vendorId, setVendorId] = useState(String(po.client_id || ""));
  
  const meta = parseNotes(po.notes);
  const [reference, setReference] = useState(meta.reference);
  const [date, setDate] = useState(po.raw_date || "");
  const [deliveryDate, setDeliveryDate] = useState(po.raw_delivery_date || "");
  const [paymentTerms, setPaymentTerms] = useState(meta.payment_terms);
  const [shipmentPreference, setShipmentPreference] = useState(meta.shipment_preference);
  const [reverseCharge, setReverseCharge] = useState(meta.reverse_charge);
  const [status, setStatus] = useState<PO["status"]>(po.status);
  
  const [notes, setNotes] = useState(meta.notes);
  const [termsConditions, setTermsConditions] = useState(meta.terms_conditions);
  const [discountVal, setDiscountVal] = useState(meta.discount_val || "0");
  const [discountType, setDiscountType] = useState<"%" | "₹">(meta.discount_type || "%");
  const [tdsRate, setTdsRate] = useState(meta.tds_rate || "0");
  const [tcsRate, setTcsRate] = useState(meta.tcs_rate || "0");
  const [adjustment, setAdjustment] = useState(meta.adjustment || "0");

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadItems() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8888/api/purchase-orders/${po.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.items) {
          setRows(data.items.map((item: any, i: number) => ({
            id: i + 1,
            itemDetails: item.description ? item.description.replace(/\s*\(.*\)$/, "") : "",
            account: item.description && item.description.includes("(") ? item.description.substring(item.description.indexOf("(") + 1, item.description.indexOf(")")) : "Cost of Goods Sold",
            quantity: parseFloat(item.quantity) || 1,
            rate: parseFloat(item.rate) || 0,
            tax: `GST ${item.tax_rate}%`,
            amount: parseFloat(item.amount) || 0
          })));
        }
      } catch (err) {
        console.error("Failed to load PO items:", err);
      } finally {
        setLoading(false);
      }
    }
    if (po.id) {
      loadItems();
    }
  }, [po.id]);

  const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
  const SELECT = cn(FIELD, "appearance-none cursor-pointer");

  const updateRow = (id: number, field: string, val: any) => {
    setRows(prevRows =>
      prevRows.map(row => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: val };
        if (field === "quantity" || field === "rate") {
          updated.amount = (parseFloat(updated.quantity) || 0) * (parseFloat(updated.rate) || 0);
        }
        return updated;
      })
    );
  };

  const addRow = () => {
    const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, { id: nextId, itemDetails: "", account: "Cost of Goods Sold", quantity: 1, rate: 0, tax: "GST 18%", amount: 0 }]);
  };

  const removeRow = (id: number) => {
    if (rows.length === 1) {
      setRows([{ id: 1, itemDetails: "", account: "Cost of Goods Sold", quantity: 1, rate: 0, tax: "GST 18%", amount: 0 }]);
    } else {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const subTotal = rows.reduce((acc, r) => acc + r.amount, 0);
  const discountValNum = parseFloat(discountVal) || 0;
  const discountAmount = discountType === "%" ? (subTotal * discountValNum) / 100 : discountValNum;
  const tdsAmount = ((subTotal - discountAmount) * (parseFloat(tdsRate) || 0)) / 100;
  const tcsAmount = ((subTotal - discountAmount) * (parseFloat(tcsRate) || 0)) / 100;
  const grandTotal = Math.max(0, subTotal - discountAmount - tdsAmount + tcsAmount + (parseFloat(adjustment) || 0));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const dbStatus = status === "Pending" ? "Sent" : status === "Approved" ? "Received" : status === "Rejected" ? "Cancelled" : "Draft";

      const itemsPayload = rows.map(r => {
        let taxVal = 18;
        if (r.tax.includes("0%")) taxVal = 0;
        else if (r.tax.includes("5%")) taxVal = 5;
        else if (r.tax.includes("12%")) taxVal = 12;
        else if (r.tax.includes("18%")) taxVal = 18;
        else if (r.tax.includes("28%")) taxVal = 28;
        else if (r.tax.includes("Out of Scope")) taxVal = 0;

        return {
          product_id: null,
          description: `${r.itemDetails} (${r.account})`,
          quantity: parseFloat(r.quantity) || 1,
          unit: "pcs",
          rate: parseFloat(r.rate) || 0,
          tax_rate: taxVal,
          amount: r.amount
        };
      });

      const payload = {
        po_number: poNumber,
        client_id: Number(vendorId),
        date: date,
        delivery_date: deliveryDate || null,
        sub_total: subTotal,
        tax_total: tdsAmount + tcsAmount,
        amount: grandTotal,
        status: dbStatus,
        notes: JSON.stringify({
          ...meta,
          notes,
          terms_conditions: termsConditions,
          reference,
          payment_terms: paymentTerms,
          shipment_preference: shipmentPreference,
          reverse_charge: reverseCharge,
          discount_val: discountVal,
          discount_type: discountType,
          tds_rate: tdsRate,
          tcs_rate: tcsRate,
          adjustment: adjustment
        }),
        items: itemsPayload
      };

      const res = await fetch(`http://localhost:8888/api/purchase-orders/${po.id}`, {
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
        alert(data.message || "Failed to update PO");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving PO changes");
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
            <h3 className="text-[16px] font-bold text-zinc-900">Edit Purchase Order</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Modify properties and rows for PO #{po.number}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {/* Metadata Edit Form Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">PO Number</label>
              <input required className={FIELD} value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Reference#</label>
              <input className={FIELD} value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Date</label>
              <input type="date" required className={FIELD} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Delivery Date</label>
              <input type="date" className={FIELD} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Status</label>
              <select className={SELECT} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Shipment Preference</label>
              <input className={FIELD} value={shipmentPreference} onChange={(e) => setShipmentPreference(e.target.value)} />
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
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-36">Account</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-16">Qty</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-24">Rate</th>
                    <th className="px-4 py-2 font-bold uppercase text-[10px] tracking-wider text-zinc-500 w-28">Tax</th>
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
                          <option value="Office Equipment">Office Equipment</option>
                          <option value="Software Subscriptions">Software Subscriptions</option>
                          <option value="Courier Charges">Courier Charges</option>
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
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Terms & Conditions</label>
                <textarea className={FIELD} rows={2} value={termsConditions} onChange={(e) => setTermsConditions(e.target.value)} />
              </div>
            </div>

            <div className="bg-zinc-50 p-4 border border-zinc-100 rounded-xl space-y-2 text-[13px]">
              <div className="flex justify-between font-medium text-zinc-500">
                <span>Sub Total</span>
                <span className="font-mono">₹{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>Discount</span>
                <div className="flex items-center gap-1">
                  <input type="number" className="w-16 px-1.5 py-0.5 text-right font-mono text-xs border border-zinc-200 rounded" value={discountVal} onChange={(e) => setDiscountVal(e.target.value)} />
                  <select className="px-1 py-0.5 text-xs border border-zinc-200 rounded" value={discountType} onChange={(e) => setDiscountType(e.target.value as any)}>
                    <option value="%">%</option>
                    <option value="₹">₹</option>
                  </select>
                </div>
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
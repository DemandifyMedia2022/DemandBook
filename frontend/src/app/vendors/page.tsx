// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { cn } from "@/lib/utils";
// import {
//   PageHeader, StatCard, SectionCard, StatusBadge,
//   SearchBar, FilterSelect, FAB, Modal, FormField, inputCls, selectCls,
// } from "@/components/ui/page-shell";

// interface Vendor {
//   id: string;
//   name: string;
//   contactPerson: string;
//   type: "Primary" | "Billing" | "Support";
//   balance: number;
//   status: "Paid" | "Overdue" | "Draft";
//   imageUrl?: string;
//   iconName?: string;
// }

// const initialVendors: Vendor[] = [
//   { id: "VND-001", name: "Global Logistics Co.", contactPerson: "Sarah Jenkins", type: "Primary", balance: 12450.0, status: "Paid", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTQmFLuaum4bXhnKJYAFHOpfwFYh4PpdbQy-lEGIh-l4CYsP7DLih2POZP7l6aKyVtY4rDUG3FiCVBGTof_VobzSx8e6goWdnNVNTEci1nSr6LNvELBBANzImnb4rioOsLgQo2VT__GKb_ycSJ7Wvs0DuK-400Z3HA7atENn01Ma6cs5uO4QyfYgYrhQbXNyo9TZtz5RCpqy_irFwKcRtmMUcvm4qlnXTZJT4_CrZvYvlJydytEGfFnXEQeLhboVxxpWOwIOH1WNo" },
//   { id: "VND-002", name: "TechSystems Inc.", contactPerson: "Marcus Thorne", type: "Billing", balance: 4200.5, status: "Overdue", iconName: "apartment" },
//   { id: "VND-003", name: "Creative Solutions", contactPerson: "Elena Rossi", type: "Primary", balance: 0.0, status: "Draft", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYYLlYJEe7QtN14co-vFOOV8E-oE4R9s7r-oZR8suX31-6TBy6Krwa-LbgmiA8U6FqrE3oMxoN45Xtj2vG4-OZC5W0tfQ5u_VhcCGDxIB793Z8glWK8AqPfZwPh4rBFTVDwJqTVYiBKyt1dw9AWzhOmP2-VcTLJp__6LlrD_GDis_6bVqzOhiz9EMUtIFc1YVFSqc3yHX8_Qtn31nnjoiVSS2Sd-O0la8BJRCVRDOsgep4iIrTTBYjVzSNzi963pJkEIE7pyU9XNg" },
//   { id: "VND-004", name: "Swift Delivery LLC", contactPerson: "Jason Bourne", type: "Primary", balance: 8900.0, status: "Paid", iconName: "local_shipping" },
//   { id: "VND-005", name: "Cloud Services Ltd.", contactPerson: "Anita Desai", type: "Support", balance: 1250.0, status: "Draft", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCdItTQ2abMon1tzQSgEbt1YwIXVUTBSRKIdl1_PjXaHk_BrlJ7jV7ZNEITxWXJ5VfDTmiTeGdXAh-O7gs3K-iYouL1pUEPdlNA_BTV6xZdeAcoZWEVz6z9D3s5bEqriqsXEt7NvUat4J3IxFjF_93lBwmqfsLofNb26FHreuHHixNIFCLLjenfeRlUc2vbbmCeyLkWqxDldTT_1CH-g4DNjwkaCOeYoVbnkT0E8U5JKV_4J47TxKnAfVnd9NGC7iFVbvmwUsHlLY" },
// ];

// export default function Vendors() {
//   const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("All");
//   const [showCreateModal, setShowCreateModal] = useState(false);

//   const [newId, setNewId] = useState("VND-006");
//   const [newName, setNewName] = useState("");
//   const [newContact, setNewContact] = useState("");
//   const [newType, setNewType] = useState<Vendor["type"]>("Primary");
//   const [newBalance, setNewBalance] = useState("");
//   const [newStatus, setNewStatus] = useState<Vendor["status"]>("Paid");

//   const handleCreateVendor = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newName || !newContact) return;
//     const newVendor: Vendor = {
//       id: newId, name: newName, contactPerson: newContact,
//       type: newType, balance: newBalance ? parseFloat(newBalance) : 0,
//       status: newStatus, iconName: "storefront",
//     };
//     setVendors([newVendor, ...vendors]);
//     setShowCreateModal(false);
//     setNewId("VND-" + String(vendors.length + 6).padStart(3, "0"));
//     setNewName(""); setNewContact(""); setNewType("Primary"); setNewBalance(""); setNewStatus("Paid");
//   };

//   const filtered = vendors.filter((v) => {
//     const q = searchQuery.toLowerCase();
//     return (
//       (v.name.toLowerCase().includes(q) || v.contactPerson.toLowerCase().includes(q)) &&
//       (selectedStatus === "All" || v.status === selectedStatus)
//     );
//   });

//   const totalPayables = vendors.reduce((s, v) => s + v.balance, 0);
//   const overduePayables = vendors.filter((v) => v.status === "Overdue").reduce((s, v) => s + v.balance, 0);

//   const typeColors: Record<Vendor["type"], string> = {
//     Primary: "bg-primary/10 text-primary",
//     Billing: "bg-secondary/10 text-secondary",
//     Support: "bg-amber-100 text-amber-700",
//   };

//   return (
//     <div className="p-6 max-w-[1440px] mx-auto space-y-6">
//       <PageHeader
//         title="Vendors"
//         subtitle="Manage supplier relationships, track payables, and monitor overdue bills."
//         actions={
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
//           >
//             <span className="material-symbols-outlined text-[17px]">add</span>
//             New Vendor
//           </button>
//         }
//       />

//       {/* KPI Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <StatCard label="Total Vendors" value={String(vendors.length)} icon="storefront" trend={{ label: "Active relationships", up: true }} />
//         <StatCard label="Total Payables" value={`₹${totalPayables.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="payments" trend={{ label: "Across all vendors", up: null }} />
//         <StatCard label="Overdue Payables" value={`₹${overduePayables.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="warning" iconColor="text-destructive" trend={{ label: "Needs immediate attention", up: false }} />
//       </div>

//       {/* Vendor Grid */}
//       <SectionCard
//         title="Vendor Directory"
//         subtitle={`${filtered.length} vendors`}
//         actions={
//           <div className="flex items-center gap-2">
//             <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search vendors..." />
//             <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Paid", "Overdue", "Draft"]} />
//           </div>
//         }
//       >
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {filtered.map((vendor) => (
//             <div
//               key={vendor.id}
//               className="flex items-center justify-between p-4 rounded-xl border border-border bg-card-container-lowest hover:bg-card-container-low hover:shadow-sm transition-all cursor-pointer"
//             >
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full overflow-hidden bg-card-container-high flex items-center justify-center relative shrink-0">
//                   {vendor.imageUrl ? (
//                     <Image src={vendor.imageUrl} alt={vendor.name} fill sizes="40px" className="object-cover" />
//                   ) : (
//                     <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
//                       {vendor.iconName || "storefront"}
//                     </span>
//                   )}
//                 </div>
//                 <div>
//                   <p className="font-bold text-sm text-foreground">{vendor.name}</p>
//                   <p className="text-[11px] text-muted-foreground">
//                     {vendor.contactPerson} &bull;{" "}
//                     <span className={cn("font-semibold", typeColors[vendor.type].split(" ").find(c => c.startsWith("text-")))}>
//                       {vendor.type}
//                     </span>
//                   </p>
//                 </div>
//               </div>
//               <div className="text-right shrink-0">
//                 <p className="font-bold text-sm text-foreground font-mono">
//                   ₹{vendor.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//                 </p>
//                 <StatusBadge status={vendor.status} />
//               </div>
//             </div>
//           ))}
//           {filtered.length === 0 && (
//             <div className="col-span-2 py-16 text-center text-muted-foreground">
//               <span className="material-symbols-outlined text-[40px] block mb-2 opacity-30">storefront</span>
//               <p className="text-sm font-semibold">No vendors match your filter.</p>
//             </div>
//           )}
//         </div>
//       </SectionCard>

//       <FAB label="New Vendor" onClick={() => setShowCreateModal(true)} />

//       {showCreateModal && (
//         <Modal title="Create New Vendor" onClose={() => setShowCreateModal(false)}>
//           <form onSubmit={handleCreateVendor} className="p-6 space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="Vendor ID">
//                 <input className={inputCls} required value={newId} onChange={(e) => setNewId(e.target.value)} />
//               </FormField>
//               <FormField label="Type">
//                 <select className={selectCls} value={newType} onChange={(e) => setNewType(e.target.value as Vendor["type"])}>
//                   <option value="Primary">Primary</option>
//                   <option value="Billing">Billing</option>
//                   <option value="Support">Support</option>
//                 </select>
//               </FormField>
//             </div>
//             <FormField label="Vendor Name">
//               <input className={inputCls} required placeholder="e.g. Acme Corp" value={newName} onChange={(e) => setNewName(e.target.value)} />
//             </FormField>
//             <FormField label="Contact Person">
//               <input className={inputCls} required placeholder="e.g. John Doe" value={newContact} onChange={(e) => setNewContact(e.target.value)} />
//             </FormField>
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="Opening Balance (₹)">
//                 <input type="number" step="0.01" placeholder="0.00" className={inputCls} value={newBalance} onChange={(e) => setNewBalance(e.target.value)} />
//               </FormField>
//               <FormField label="Status">
//                 <select className={selectCls} value={newStatus} onChange={(e) => setNewStatus(e.target.value as Vendor["status"])}>
//                   <option value="Paid">Paid</option>
//                   <option value="Overdue">Overdue</option>
//                   <option value="Draft">Draft</option>
//                 </select>
//               </FormField>
//             </div>
//             <div className="pt-4 border-t border-border flex justify-end gap-3">
//               <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:bg-card-container transition-colors">Cancel</button>
//               <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Create Vendor</button>
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
  ChevronDown,
  X,
  Store,
  Truck,
  Building2,
  Headphones,
  MoreHorizontal,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  type: "Primary" | "Billing" | "Support";
  balance: number;
  status: "Paid" | "Overdue" | "Draft";
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  Vendor["status"],
  { dot: string; text: string; bg: string }
> = {
  Paid: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  Overdue: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  Draft: { dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-100" },
};

const TYPE_CONFIG: Record<
  Vendor["type"],
  { text: string; bg: string; icon: React.ReactNode; avatarBg: string; avatarText: string }
> = {
  Primary: { text: "text-indigo-700", bg: "bg-indigo-50", icon: <Store className="w-4 h-4" />, avatarBg: "bg-indigo-100", avatarText: "text-indigo-600" },
  Billing: { text: "text-violet-700", bg: "bg-violet-50", icon: <Building2 className="w-4 h-4" />, avatarBg: "bg-violet-100", avatarText: "text-violet-600" },
  Support: { text: "text-amber-700", bg: "bg-amber-50", icon: <Headphones className="w-4 h-4" />, avatarBg: "bg-amber-100", avatarText: "text-amber-600" },
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialVendors: Vendor[] = [
  { id: "VND-001", name: "Global Logistics Co.", contactPerson: "Sarah Jenkins", email: "sarah@globallog.com", type: "Primary", balance: 12450.0, status: "Paid" },
  { id: "VND-002", name: "TechSystems Inc.", contactPerson: "Marcus Thorne", email: "marcus@techsys.io", type: "Billing", balance: 4200.5, status: "Overdue" },
  { id: "VND-003", name: "Creative Solutions", contactPerson: "Elena Rossi", email: "elena@creativesol.co", type: "Primary", balance: 0.0, status: "Draft" },
  { id: "VND-004", name: "Swift Delivery LLC", contactPerson: "Jason Bourne", email: "jason@swiftdel.com", type: "Primary", balance: 8900.0, status: "Paid" },
  { id: "VND-005", name: "Cloud Services Ltd.", contactPerson: "Anita Desai", email: "anita@cloudserv.in", type: "Support", balance: 1250.0, status: "Draft" },
];

const STATUSES = ["All", "Paid", "Overdue", "Draft"] as const;

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

function StatusPill({ status }: { status: Vendor["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full", cfg.bg, cfg.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: Vendor["type"] }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded-full", cfg.bg, cfg.text)}>
      {type}
    </span>
  );
}

function VendorAvatar({ vendor }: { vendor: Vendor }) {
  const cfg = TYPE_CONFIG[vendor.type];
  const initials = vendor.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold", cfg.avatarBg, cfg.avatarText)}>
      {initials}
    </div>
  );
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
function CreateVendorModal({
  vendors,
  onClose,
  onAdd,
}: {
  vendors: Vendor[];
  onClose: () => void;
  onAdd: (v: Vendor) => void;
}) {
  const [id] = useState(`VND-${String(vendors.length + 6).padStart(3, "0")}`);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<Vendor["type"]>("Primary");
  const [balance, setBalance] = useState("");
  const [status, setStatus] = useState<Vendor["status"]>("Paid");

  const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
  const SELECT = cn(FIELD, "appearance-none cursor-pointer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    onAdd({ id, name, contactPerson: contact, email, type, balance: balance ? parseFloat(balance) : 0, status });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-[15px] font-semibold text-zinc-900">New Vendor</h3>
            <p className="text-[12px] text-zinc-500 mt-0.5">Add a supplier to your directory</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Vendor ID</label>
              <input className={FIELD} value={id} readOnly />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Type</label>
              <select className={SELECT} value={type} onChange={(e) => setType(e.target.value as Vendor["type"])}>
                <option value="Primary">Primary</option>
                <option value="Billing">Billing</option>
                <option value="Support">Support</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Vendor Name</label>
            <input required placeholder="e.g. Acme Corp" className={FIELD} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Contact Person</label>
            <input required placeholder="e.g. John Doe" className={FIELD} value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Email</label>
            <input type="email" placeholder="e.g. john@acme.com" className={FIELD} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Opening Balance (₹)</label>
              <input type="number" step="0.01" min={0} placeholder="0.00" className={FIELD} value={balance} onChange={(e) => setBalance(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Status</label>
              <select className={SELECT} value={status} onChange={(e) => setStatus(e.target.value as Vendor["status"])}>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm">
              Create Vendor
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
export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const filtered = vendors.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      (v.name.toLowerCase().includes(q) ||
        v.contactPerson.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q)) &&
      (selectedStatus === "All" || v.status === selectedStatus)
    );
  });

  const totalPayables = vendors.reduce((s, v) => s + v.balance, 0);
  const overduePayables = vendors.filter((v) => v.status === "Overdue").reduce((s, v) => s + v.balance, 0);

  const handleAdd = (v: Vendor) => {
    setVendors([v, ...vendors]);
    setShowModal(false);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Vendors</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Manage supplier relationships, track payables, and monitor overdue bills.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Vendor
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Vendors" value={String(vendors.length)} delta={8.3} />
          <StatCard label="Total Payables" value={fmt(totalPayables)} />
          <StatCard label="Overdue Payables" value={fmt(overduePayables)} delta={-4.1} />
        </div>

        {/* Table card */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">Vendor Directory</h2>
              <p className="text-[12px] text-zinc-500">{filtered.length} vendor{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search vendors..."
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
                  ["Vendor", ""],
                  ["Type", ""],
                  ["Contact", ""],
                  ["Balance", "text-right"],
                  ["Status", ""],
                  ["", ""],
                ].map(([h, cls]) => (
                  <th key={h} className={cn("px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide", cls)}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-zinc-50/70 transition-colors cursor-pointer group">

                  {/* Vendor name + id */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <VendorAvatar vendor={vendor} />
                      <div>
                        <p className="text-[13px] font-medium text-zinc-900">{vendor.name}</p>
                        <p className="text-[12px] text-zinc-500">{vendor.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-3">
                    <TypeBadge type={vendor.type} />
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-3">
                    <p className="text-[13px] text-zinc-700 font-medium">{vendor.contactPerson}</p>
                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[12px] text-[#5B5FEF] hover:underline"
                      >
                        {vendor.email}
                      </a>
                    )}
                  </td>

                  {/* Balance */}
                  <td className="px-6 py-3 text-right font-mono text-[13px] font-medium text-zinc-900 tabular-nums">
                    {fmt(vendor.balance)}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3">
                    <StatusPill status={vendor.status} />
                  </td>

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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Store className="w-6 h-6 text-zinc-200" />
                      <p className="text-[13px] text-zinc-400">No vendors match your filters.</p>
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
                {filtered.length} vendor{filtered.length !== 1 ? "s" : ""}
              </span>
              <span className="text-[13px] font-semibold text-zinc-900 tabular-nums font-mono">
                Total payables: {fmt(filtered.reduce((s, v) => s + v.balance, 0))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <CreateVendorModal vendors={vendors} onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
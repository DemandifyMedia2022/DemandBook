// "use client";

// import { useState, useEffect } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";
// import {
//   PageHeader, StatCard, SectionCard, StatusBadge,
//   SearchBar, FilterSelect, FAB, EmptyState
// } from "@/components/ui/page-shell";

// interface Vendor {
//   id: string;
//   name: string;
//   contactPerson: string;
//   type: string;
//   balance: number;
//   status: string;
//   imageUrl?: string;
//   iconName?: string;
//   email?: string;
//   phone?: string;
// }

// const initialVendors: Vendor[] = [
//   { id: "VND-001", name: "Global Logistics Co.", contactPerson: "Sarah Jenkins", type: "Business", balance: 12450.0, status: "Active", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTQmFLuaum4bXhnKJYAFHOpfwFYh4PpdbQy-lEGIh-l4CYsP7DLih2POZP7l6aKyVtY4rDUG3FiCVBGTof_VobzSx8e6goWdnNVNTEci1nSr6LNvELBBANzImnb4rioOsLgQo2VT__GKb_ycSJ7Wvs0DuK-400Z3HA7atENn01Ma6cs5uO4QyfYgYrhQbXNyo9TZtz5RCpqy_irFwKcRtmMUcvm4qlnXTZJT4_CrZvYvlJydytEGfFnXEQeLhboVxxpWOwIOH1WNo", email: "sarah@globallogistics.com", phone: "+91 98765 12345" },
//   { id: "VND-002", name: "TechSystems Inc.", contactPerson: "Marcus Thorne", type: "Business", balance: 4200.5, status: "Active", iconName: "apartment", email: "billing@techsystems.com", phone: "+91 98765 54321" },
//   { id: "VND-003", name: "Creative Solutions", contactPerson: "Elena Rossi", type: "Business", balance: 0.0, status: "Inactive", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYYLlYJEe7QtN14co-vFOOV8E-oE4R9s7r-oZR8suX31-6TBy6Krwa-LbgmiA8U6FqrE3oMxoN45Xtj2vG4-OZC5W0tfQ5u_VhcCGDxIB793Z8glWK8AqPfZwPh4rBFTVDwJqTVYiBKyt1dw9AWzhOmP2-VcTLJp__6LlrD_GDis_6bVqzOhiz9EMUtIFc1YVFSqc3yHX8_Qtn31nnjoiVSS2Sd-O0la8BJRCVRDOsgep4iIrTTBYjVzSNzi963pJkEIE7pyU9XNg", email: "elena@creative.it", phone: "+39 02 123456" },
//   { id: "VND-004", name: "Swift Delivery LLC", contactPerson: "Jason Bourne", type: "Business", balance: 8900.0, status: "Active", iconName: "local_shipping", email: "jason@swiftdelivery.com", phone: "+1 800 555 0199" },
//   { id: "VND-005", name: "Cloud Services Ltd.", contactPerson: "Anita Desai", type: "Business", balance: 1250.0, status: "Inactive", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCdItTQ2abMon1tzQSgEbt1YwIXVUTBSRKIdl1_PjXaHk_BrlJ7jV7ZNEITxWXJ5VfDTmiTeGdXAh-O7gs3K-iYouL1pUEPdlNA_BTV6xZdeAcoZWEVz6z9D3s5bEqriqsXEt7NvUat4J3IxFjF_93lBwmqfsLofNb26FHreuHHixNIFCLLjenfeRlUc2vbbmCeyLkWqxDldTT_1CH-g4DNjwkaCOeYoVbnkT0E8U5JKV_4J47TxKnAfVnd9NGC7iFVbvmwUsHlLY", email: "anita@cloudservices.in", phone: "+91 80 4321 8765" },
// ];

// export default function Vendors() {
//   const router = useRouter();
//   const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("All");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchVendors() {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setLoading(false);
//           return;
//         }

//         const response = await fetch("http://localhost:8888/api/client/list?type=vendor", {
//           headers: {
//             "Authorization": `Bearer ${token}`
//           }
//         });
//         const res = await response.json();
//         if (res.success && res.clients) {
//           if (res.clients.length > 0) {
//             const mapped: Vendor[] = res.clients.map((c: any) => ({
//               id: c.custom_id,
//               name: c.name,
//               contactPerson: c.primary_contact_first_name 
//                 ? `${c.primary_contact_salutation || ""} ${c.primary_contact_first_name} ${c.primary_contact_last_name || ""}`.trim()
//                 : c.name,
//               type: c.customer_type || "Business",
//               balance: parseFloat(c.balance) || 0,
//               status: c.status || "Active",
//               iconName: "storefront",
//               email: c.email.includes("no-email") ? "" : c.email,
//               phone: c.phone === "—" ? "" : c.phone
//             }));
//             setVendors(mapped);
//           }
//         }
//       } catch (err) {
//         console.error("Failed to fetch vendors from API:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchVendors();
//   }, []);

//   const filtered = vendors.filter((v) => {
//     const q = searchQuery.toLowerCase();
//     const matchesSearch = 
//       v.name.toLowerCase().includes(q) || 
//       v.contactPerson.toLowerCase().includes(q) ||
//       v.id.toLowerCase().includes(q) ||
//       (v.email && v.email.toLowerCase().includes(q));

//     const matchesStatus = 
//       selectedStatus === "All" || 
//       v.status.toLowerCase() === selectedStatus.toLowerCase();

//     return matchesSearch && matchesStatus;
//   });

//   const totalPayables = vendors.reduce((s, v) => s + v.balance, 0);
//   const activeCount = vendors.filter((v) => v.status === "Active" || v.status === "Paid").length;

//   return (
//     <div className="p-6 max-w-[1440px] mx-auto space-y-6">
//       <PageHeader
//         title="Vendors"
//         subtitle="Manage supplier relationships, track payables, and monitor vendor portal accounts."
//         actions={
//           <button
//             onClick={() => router.push("/vendors/new")}
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
//         <StatCard label="Active Vendors" value={String(activeCount)} icon="autorenew" iconColor="text-primary" trend={{ label: "Status Active", up: true }} />
//       </div>

//       {/* Vendor Grid */}
//       <SectionCard
//         title="Vendor Directory"
//         subtitle={loading ? "Loading vendors..." : `${filtered.length} vendors`}
//         actions={
//           <div className="flex items-center gap-2">
//             <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search vendors..." />
//             <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Active", "Inactive"]} />
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
//                     <span className="font-semibold text-primary">
//                       {vendor.type}
//                     </span>
//                   </p>
//                   {vendor.email && <p className="text-[10px] text-muted-foreground">{vendor.email}</p>}
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
//               <p className="text-sm font-semibold">No vendors match your filters.</p>
//             </div>
//           )}
//         </div>
//       </SectionCard>

//       <FAB label="New Vendor" onClick={() => router.push("/vendors/new")} />
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
  Mail,
  Phone,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  type: string;
  balance: number;
  status: "Active" | "Inactive";
  email?: string;
  phone?: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialVendors: Vendor[] = [
  {
    id: "VND-001",
    name: "Global Logistics Co.",
    contactPerson: "Sarah Jenkins",
    type: "Business",
    balance: 12450.0,
    status: "Active",
    email: "sarah@globallogistics.com",
    phone: "+91 98765 12345",
  },
  {
    id: "VND-002",
    name: "TechSystems Inc.",
    contactPerson: "Marcus Thorne",
    type: "Business",
    balance: 4200.5,
    status: "Active",
    email: "billing@techsystems.com",
    phone: "+91 98765 54321",
  },
  {
    id: "VND-003",
    name: "Creative Solutions",
    contactPerson: "Elena Rossi",
    type: "Business",
    balance: 0.0,
    status: "Inactive",
    email: "elena@creative.it",
    phone: "+39 02 123456",
  },
  {
    id: "VND-004",
    name: "Swift Delivery LLC",
    contactPerson: "Jason Bourne",
    type: "Business",
    balance: 8900.0,
    status: "Active",
    email: "jason@swiftdelivery.com",
    phone: "+1 800 555 0199",
  },
  {
    id: "VND-005",
    name: "Cloud Services Ltd.",
    contactPerson: "Anita Desai",
    type: "Business",
    balance: 1250.0,
    status: "Inactive",
    email: "anita@cloudservices.in",
    phone: "+91 80 4321 8765",
  },
];

const statusColors = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Inactive: { bg: "bg-zinc-100", text: "text-zinc-600", dot: "bg-zinc-400" },
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number;
}) {
  const positive = delta !== undefined && delta >= 0;

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-zinc-500">{label}</span>
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
              positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}
          >
            {positive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
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
// Page
// ---------------------------------------------------------------------------
export default function Vendors() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8888/api/client/list?type=vendor", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const res = await response.json();
        if (res.success && res.clients) {
          if (res.clients.length > 0) {
            const mapped: Vendor[] = res.clients.map((c: any) => ({
              id: c.custom_id,
              name: c.name,
              contactPerson: c.primary_contact_first_name
                ? `${c.primary_contact_salutation || ""} ${c.primary_contact_first_name} ${c.primary_contact_last_name || ""}`.trim()
                : c.name,
              type: c.customer_type || "Business",
              balance: parseFloat(c.balance) || 0,
              status: c.status || "Active",
              email: c.email.includes("no-email") ? "" : c.email,
              phone: c.phone === "—" ? "" : c.phone,
            }));
            setVendors(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch vendors from API:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  const filtered = vendors.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      v.name.toLowerCase().includes(q) ||
      v.contactPerson.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      (v.email && v.email.toLowerCase().includes(q));

    const matchesStatus =
      selectedStatus === "All" || v.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const activeCount = vendors.filter((v) => v.status === "Active").length;
  const totalPayables = vendors.reduce((sum, v) => sum + v.balance, 0);

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
              Vendors
            </h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Manage supplier relationships and track payables
            </p>
          </div>

          <button
            onClick={() => router.push("/vendors/new")}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Vendor
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Vendors"
            value={String(vendors.length)}
            delta={7.3}
          />
          <StatCard
            label="Active"
            value={String(activeCount)}
            delta={3.1}
          />
          <StatCard
            label="Total Payables"
            value={`₹${totalPayables.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`}
            delta={12.8}
          />
        </div>

        {/* Table section */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">
                Vendor Directory
              </h2>
              <p className="text-[12px] text-zinc-500">
                {loading ? "Loading..." : `${filtered.length} vendor${filtered.length !== 1 ? "s" : ""}`}
              </p>
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
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                  Vendor
                </th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                  Contact
                </th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                  Payable
                </th>
                <th className="px-6 py-2.5 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="hover:bg-zinc-50/70 transition-colors cursor-pointer"
                >
                  {/* Vendor */}
                  <td className="px-6 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-zinc-900">
                        {vendor.name}
                      </p>
                      <p className="text-[12px] text-zinc-500">
                        {vendor.contactPerson} &bull; {vendor.type}
                      </p>
                      <p className="text-[12px] text-zinc-500">{vendor.id}</p>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-3">
                    <div className="space-y-0.5">
                      {vendor.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          <a
                            href={`mailto:${vendor.email}`}
                            className="text-[12px] text-[#5B5FEF] hover:underline"
                          >
                            {vendor.email}
                          </a>
                        </div>
                      )}
                      {vendor.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          <a
                            href={`tel:${vendor.phone}`}
                            className="text-[12px] text-zinc-600 hover:text-zinc-900"
                          >
                            {vendor.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
                        statusColors[vendor.status].bg,
                        statusColors[vendor.status].text
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          statusColors[vendor.status].dot
                        )}
                      />
                      {vendor.status}
                    </span>
                  </td>

                  {/* Balance */}
                  <td className="px-6 py-3 font-mono text-[13px] font-medium text-zinc-900 tabular-nums">
                    ₹{vendor.balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-[13px] text-zinc-400">
                      No vendors match your filters.
                    </p>
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
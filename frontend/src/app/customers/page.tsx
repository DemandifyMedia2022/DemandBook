// "use client";

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

import { useState } from "react";
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
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  balance: number;
  trend: number[];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialCustomers: Customer[] = [
  {
    id: "CUST-4092",
    name: "Acme Solutions",
    email: "john.doe@acme.com",
    phone: "+91 98765 43210",
    status: "Active",
    balance: 12450.0,
    trend: [8000, 9000, 9500, 10200, 11000, 11800, 12100, 12450],
  },
  {
    id: "CUST-3912",
    name: "Blue Tier Tech",
    email: "sarah@bluetier.io",
    phone: "+91 91234 56789",
    status: "Active",
    balance: 4200.5,
    trend: [3000, 3200, 3400, 3600, 3800, 4000, 4100, 4200],
  },
  {
    id: "CUST-2844",
    name: "Cloud Harbor",
    email: "billing@charbor.com",
    phone: "+91 80001 11222",
    status: "Inactive",
    balance: 0.0,
    trend: [500, 400, 300, 200, 100, 50, 25, 0],
  },
  {
    id: "CUST-5512",
    name: "Digital Wave Inc",
    email: "mark@digitalwave.io",
    phone: "+91 77777 12345",
    status: "Active",
    balance: 1120.0,
    trend: [800, 850, 900, 950, 1000, 1050, 1080, 1120],
  },
  {
    id: "CUST-8210",
    name: "Eco Stream Logistics",
    email: "admin@ecostream.log",
    phone: "+91 88884 56789",
    status: "Active",
    balance: 52000.0,
    trend: [40000, 42000, 44000, 46000, 48000, 50000, 51000, 52000],
  },
  {
    id: "CUST-6390",
    name: "FlexTech Systems",
    email: "info@flextech.in",
    phone: "+91 99990 11100",
    status: "Active",
    balance: 7800.0,
    trend: [5000, 5500, 6000, 6300, 6600, 7000, 7400, 7800],
  },
];

const statusColors = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Inactive: { bg: "bg-zinc-100", text: "text-zinc-600", dot: "bg-zinc-400" },
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
function TrendBadge({ data }: { data: number[] }) {
  const start = data[0];
  const end = data[data.length - 1];
  const percentChange = ((end - start) / start) * 100;
  const isPositive = percentChange >= 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
        isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      )}
    >
      {isPositive ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      {Math.abs(percentChange).toFixed(1)}%
    </span>
  );
}

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
export default function Customers() {
  const router = useRouter();
  const [customers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchesStatus =
      selectedStatus === "All" || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = customers.filter((c) => c.status === "Active").length;
  const totalBalance = customers.reduce((sum, c) => sum + c.balance, 0);

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
            value={String(customers.length)}
            delta={12.4}
          />
          <StatCard
            label="Active"
            value={String(activeCount)}
            delta={5.2}
          />
          <StatCard
            label="Total Outstanding"
            value={`₹${totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`}
            delta={8.1}
          />
        </div>

        {/* Table section */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">
                Customer Directory
              </h2>
              <p className="text-[12px] text-zinc-500">
                {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
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
                  Customer
                </th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                  Contact
                </th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                  Outstanding
                </th>
                <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                  Trend
                </th>
                <th className="px-6 py-2.5 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-zinc-50/70 transition-colors cursor-pointer"
                >
                  {/* Name */}
                  <td className="px-6 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-zinc-900">
                        {customer.name}
                      </p>
                      <p className="text-[12px] text-zinc-500">{customer.id}</p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
                        statusColors[customer.status].bg,
                        statusColors[customer.status].text
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          statusColors[customer.status].dot
                        )}
                      />
                      {customer.status}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <a
                          href={`mailto:${customer.email}`}
                          className="text-[12px] text-[#5B5FEF] hover:underline"
                        >
                          {customer.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <a
                          href={`tel:${customer.phone}`}
                          className="text-[12px] text-zinc-600 hover:text-zinc-900"
                        >
                          {customer.phone}
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Balance */}
                  <td className="px-6 py-3 font-mono text-[13px] font-medium text-zinc-900 tabular-nums">
                    ₹{customer.balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>

                  {/* Trend */}
                  <td className="px-6 py-3">
                    <TrendBadge data={customer.trend} />
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-[13px] text-zinc-400">
                      No customers match your filters.
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
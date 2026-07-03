// "use client";

// import { useState } from "react";
// import { cn } from "@/lib/utils";
// import { useRouter } from "next/navigation";
// import {
//     Search,
//     Plus,
//     ChevronDown,
//     MoreHorizontal,
//     ArrowUpRight,
//     ArrowDownRight,
//     FileText,
//     CheckCircle2,
//     XCircle,
//     Clock,
//     Receipt,
// } from "lucide-react";

// // ---------------------------------------------------------------------------
// // Types
// // ---------------------------------------------------------------------------
// type OrderStatus = "Draft" | "Confirmed" | "Invoiced" | "Cancelled";

// interface SalesOrder {
//     id: string;
//     customer: string;
//     customerId: string;
//     date: string;
//     shipmentDate: string;
//     status: OrderStatus;
//     amount: number;
//     items: number;
//     trend: number[];
// }

// // ---------------------------------------------------------------------------
// // Mock data
// // ---------------------------------------------------------------------------
// const initialOrders: SalesOrder[] = [
//     {
//         id: "SO-1042",
//         customer: "Acme Solutions",
//         customerId: "CUST-4092",
//         date: "2025-06-18",
//         shipmentDate: "2025-06-25",
//         status: "Confirmed",
//         amount: 48500,
//         items: 6,
//         trend: [30000, 35000, 38000, 42000, 44000, 46000, 47000, 48500],
//     },
//     {
//         id: "SO-1041",
//         customer: "Eco Stream Logistics",
//         customerId: "CUST-8210",
//         date: "2025-06-17",
//         shipmentDate: "2025-06-24",
//         status: "Invoiced",
//         amount: 12200,
//         items: 3,
//         trend: [8000, 9000, 9500, 10000, 10800, 11200, 11800, 12200],
//     },
//     {
//         id: "SO-1040",
//         customer: "FlexTech Systems",
//         customerId: "CUST-6390",
//         date: "2025-06-16",
//         shipmentDate: "2025-06-23",
//         status: "Draft",
//         amount: 6750,
//         items: 4,
//         trend: [4000, 4500, 5000, 5500, 6000, 6200, 6500, 6750],
//     },
//     {
//         id: "SO-1039",
//         customer: "Blue Tier Tech",
//         customerId: "CUST-3912",
//         date: "2025-06-15",
//         shipmentDate: "2025-06-22",
//         status: "Cancelled",
//         amount: 3300,
//         items: 2,
//         trend: [3300, 3300, 3300, 3300, 3300, 3300, 3300, 3300],
//     },
//     {
//         id: "SO-1038",
//         customer: "Digital Wave Inc",
//         customerId: "CUST-5512",
//         date: "2025-06-14",
//         shipmentDate: "2025-06-21",
//         status: "Invoiced",
//         amount: 91000,
//         items: 11,
//         trend: [60000, 65000, 70000, 75000, 80000, 85000, 88000, 91000],
//     },
//     {
//         id: "SO-1037",
//         customer: "Acme Solutions",
//         customerId: "CUST-4092",
//         date: "2025-06-13",
//         shipmentDate: "2025-06-20",
//         status: "Confirmed",
//         amount: 22400,
//         items: 5,
//         trend: [15000, 16000, 17500, 19000, 20000, 21000, 21800, 22400],
//     },
//     {
//         id: "SO-1036",
//         customer: "Cloud Harbor",
//         customerId: "CUST-2844",
//         date: "2025-06-11",
//         shipmentDate: "2025-06-18",
//         status: "Draft",
//         amount: 5100,
//         items: 3,
//         trend: [3000, 3500, 4000, 4200, 4500, 4700, 4900, 5100],
//     },
// ];

// // ---------------------------------------------------------------------------
// // Config
// // ---------------------------------------------------------------------------
// const statusConfig: Record<
//     OrderStatus,
//     { bg: string; text: string; dot: string; icon: React.ReactNode }
// > = {
//     Draft: {
//         bg: "bg-zinc-100",
//         text: "text-zinc-600",
//         dot: "bg-zinc-400",
//         icon: <Clock className="w-3 h-3" />,
//     },
//     Confirmed: {
//         bg: "bg-blue-50",
//         text: "text-blue-700",
//         dot: "bg-blue-500",
//         icon: <CheckCircle2 className="w-3 h-3" />,
//     },
//     Invoiced: {
//         bg: "bg-emerald-50",
//         text: "text-emerald-700",
//         dot: "bg-emerald-500",
//         icon: <Receipt className="w-3 h-3" />,
//     },
//     Cancelled: {
//         bg: "bg-red-50",
//         text: "text-red-600",
//         dot: "bg-red-400",
//         icon: <XCircle className="w-3 h-3" />,
//     },
// };

// const statuses: OrderStatus[] = ["Draft", "Confirmed", "Invoiced", "Cancelled"];

// // ---------------------------------------------------------------------------
// // Components
// // ---------------------------------------------------------------------------
// function TrendBadge({ data }: { data: number[] }) {
//     const start = data[0];
//     const end = data[data.length - 1];
//     const pct = ((end - start) / start) * 100;
//     const positive = pct >= 0;

//     return (
//         <span
//             className={cn(
//                 "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
//                 positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
//             )}
//         >
//             {positive ? (
//                 <ArrowUpRight className="w-3 h-3" />
//             ) : (
//                 <ArrowDownRight className="w-3 h-3" />
//             )}
//             {Math.abs(pct).toFixed(1)}%
//         </span>
//     );
// }

// function StatCard({
//     label,
//     value,
//     delta,
//     icon,
// }: {
//     label: string;
//     value: string;
//     delta?: number;
//     icon?: React.ReactNode;
// }) {
//     const positive = delta !== undefined && delta >= 0;

//     return (
//         <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
//             <div className="flex items-center justify-between">
//                 <span className="text-[13px] font-medium text-zinc-500 flex items-center gap-1.5">
//                     {icon}
//                     {label}
//                 </span>
//                 {delta !== undefined && (
//                     <span
//                         className={cn(
//                             "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
//                             positive
//                                 ? "bg-emerald-50 text-emerald-700"
//                                 : "bg-red-50 text-red-700"
//                         )}
//                     >
//                         {positive ? (
//                             <ArrowUpRight className="w-3 h-3" />
//                         ) : (
//                             <ArrowDownRight className="w-3 h-3" />
//                         )}
//                         {Math.abs(delta)}%
//                     </span>
//                 )}
//             </div>
//             <span className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">
//                 {value}
//             </span>
//         </div>
//     );
// }

// function StatusBadge({ status }: { status: OrderStatus }) {
//     const cfg = statusConfig[status];
//     return (
//         <span
//             className={cn(
//                 "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
//                 cfg.bg,
//                 cfg.text
//             )}
//         >
//             {cfg.icon}
//             {status}
//         </span>
//     );
// }

// function formatDate(dateStr: string) {
//     return new Date(dateStr).toLocaleDateString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//     });
// }

// // ---------------------------------------------------------------------------
// // Page
// // ---------------------------------------------------------------------------
// export default function SalesOrders() {
//     const router = useRouter();
//     const [orders] = useState<SalesOrder[]>(initialOrders);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [selectedStatus, setSelectedStatus] = useState<"All" | OrderStatus>(
//         "All"
//     );
//     const [openMenuId, setOpenMenuId] = useState<string | null>(null);

//     const filtered = orders.filter((o) => {
//         const q = searchQuery.toLowerCase();
//         const matchesSearch =
//             o.id.toLowerCase().includes(q) ||
//             o.customer.toLowerCase().includes(q);
//         const matchesStatus =
//             selectedStatus === "All" || o.status === selectedStatus;
//         return matchesSearch && matchesStatus;
//     });

//     const totalAmount = orders.reduce((s, o) => s + o.amount, 0);
//     const draftCount = orders.filter((o) => o.status === "Draft").length;
//     const confirmedCount = orders.filter((o) => o.status === "Confirmed").length;
//     const invoicedCount = orders.filter((o) => o.status === "Invoiced").length;

//     return (
//         <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
//             <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

//                 {/* Page header */}
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
//                             Sales Orders
//                         </h1>
//                         <p className="text-[13px] text-zinc-500 mt-0.5">
//                             Track and manage customer orders end-to-end
//                         </p>
//                     </div>
//                     <button
//                         onClick={() => router.push("/sales-orders/new")}
//                         className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
//                     >
//                         <Plus className="w-4 h-4" />
//                         New Sales Order
//                     </button>
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                     <StatCard
//                         label="Total Orders"
//                         value={String(orders.length)}
//                         delta={9.3}
//                         icon={<FileText className="w-3.5 h-3.5 text-zinc-400" />}
//                     />
//                     <StatCard
//                         label="Draft"
//                         value={String(draftCount)}
//                         icon={<Clock className="w-3.5 h-3.5 text-zinc-400" />}
//                     />
//                     <StatCard
//                         label="Confirmed"
//                         value={String(confirmedCount)}
//                         delta={4.1}
//                         icon={<CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />}
//                     />
//                     <StatCard
//                         label="Total Value"
//                         value={`₹${totalAmount.toLocaleString("en-IN")}`}
//                         delta={11.6}
//                         icon={<Receipt className="w-3.5 h-3.5 text-zinc-400" />}
//                     />
//                 </div>

//                 {/* Table section */}
//                 <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

//                     {/* Table header controls */}
//                     <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
//                         <div>
//                             <h2 className="text-[14px] font-semibold text-zinc-900">
//                                 Order List
//                             </h2>
//                             <p className="text-[12px] text-zinc-500">
//                                 {filtered.length} order{filtered.length !== 1 ? "s" : ""}
//                             </p>
//                         </div>

//                         <div className="flex items-center gap-2">
//                             {/* Search */}
//                             <div className="relative w-56">
//                                 <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search orders..."
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
//                                 />
//                             </div>

//                             {/* Status filter */}
//                             <div className="relative">
//                                 <select
//                                     value={selectedStatus}
//                                     onChange={(e) =>
//                                         setSelectedStatus(e.target.value as "All" | OrderStatus)
//                                     }
//                                     className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
//                                 >
//                                     <option value="All">All Status</option>
//                                     {statuses.map((s) => (
//                                         <option key={s} value={s}>
//                                             {s}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Table */}
//                     <table className="w-full text-left">
//                         <thead>
//                             <tr className="border-b border-zinc-100">
//                                 {[
//                                     "Order",
//                                     "Customer",
//                                     "Date",
//                                     "Shipment Date",
//                                     "Status",
//                                     "Items",
//                                     "Amount",
//                                     "Trend",
//                                     "",
//                                 ].map((col) => (
//                                     <th
//                                         key={col}
//                                         className={cn(
//                                             "px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap",
//                                             col === "" && "text-right"
//                                         )}
//                                     >
//                                         {col}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-zinc-100">
//                             {filtered.map((order) => (
//                                 <tr
//                                     key={order.id}
//                                     className="hover:bg-zinc-50/70 transition-colors cursor-pointer relative"
//                                     onClick={() => setOpenMenuId(null)}
//                                 >
//                                     {/* Order ID */}
//                                     <td className="px-6 py-3">
//                                         <span className="text-[13px] font-semibold text-[#5B5FEF]">
//                                             {order.id}
//                                         </span>
//                                     </td>

//                                     {/* Customer */}
//                                     <td className="px-6 py-3">
//                                         <div>
//                                             <p className="text-[13px] font-medium text-zinc-900">
//                                                 {order.customer}
//                                             </p>
//                                             <p className="text-[12px] text-zinc-400">
//                                                 {order.customerId}
//                                             </p>
//                                         </div>
//                                     </td>

//                                     {/* Date */}
//                                     <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
//                                         {formatDate(order.date)}
//                                     </td>

//                                     {/* Shipment date */}
//                                     <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
//                                         {formatDate(order.shipmentDate)}
//                                     </td>

//                                     {/* Status */}
//                                     <td className="px-6 py-3">
//                                         <StatusBadge status={order.status} />
//                                     </td>

//                                     {/* Items */}
//                                     <td className="px-6 py-3 text-[13px] text-zinc-600 tabular-nums">
//                                         {order.items}
//                                     </td>

//                                     {/* Amount */}
//                                     <td className="px-6 py-3 font-mono text-[13px] font-medium text-zinc-900 tabular-nums whitespace-nowrap">
//                                         ₹{order.amount.toLocaleString("en-IN")}
//                                     </td>

//                                     {/* Trend */}
//                                     <td className="px-6 py-3">
//                                         <TrendBadge data={order.trend} />
//                                     </td>

//                                     {/* Actions */}
//                                     <td
//                                         className="px-6 py-3 text-right relative"
//                                         onClick={(e) => e.stopPropagation()}
//                                     >
//                                         <button
//                                             onClick={() =>
//                                                 setOpenMenuId(
//                                                     openMenuId === order.id ? null : order.id
//                                                 )
//                                             }
//                                             className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
//                                         >
//                                             <MoreHorizontal className="w-4 h-4" />
//                                         </button>

//                                         {openMenuId === order.id && (
//                                             <div className="absolute right-6 top-10 z-10 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 w-48">
//                                                 {order.status === "Draft" && (
//                                                     <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
//                                                         <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
//                                                         Mark as Confirmed
//                                                     </button>
//                                                 )}
//                                                 {order.status === "Confirmed" && (
//                                                     <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
//                                                         <Receipt className="w-3.5 h-3.5 text-emerald-500" />
//                                                         Convert to Invoice
//                                                     </button>
//                                                 )}
//                                                 <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
//                                                     <FileText className="w-3.5 h-3.5 text-zinc-400" />
//                                                     Edit Order
//                                                 </button>
//                                                 {order.status !== "Cancelled" &&
//                                                     order.status !== "Invoiced" && (
//                                                         <button className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2">
//                                                             <XCircle className="w-3.5 h-3.5" />
//                                                             Cancel Order
//                                                         </button>
//                                                     )}
//                                             </div>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ))}

//                             {filtered.length === 0 && (
//                                 <tr>
//                                     <td colSpan={9} className="px-6 py-12 text-center">
//                                         <p className="text-[13px] text-zinc-400">
//                                             No orders match your filters.
//                                         </p>
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// }



// "use client";

// import { useState, useMemo } from "react";
// import { cn } from "@/lib/utils";
// import { useRouter } from "next/navigation";
// import {
//     Search,
//     Plus,
//     ChevronDown,
//     ChevronUp,
//     MoreHorizontal,
//     ArrowUpRight,
//     ArrowDownRight,
//     FileText,
//     CheckCircle2,
//     XCircle,
//     Clock,
//     Receipt,
//     Filter,
//     Download,
//     ChevronLeft,
//     ChevronRight,
//     AlertCircle,
//     CheckSquare,
//     Square,
// } from "lucide-react";

// // ---------------------------------------------------------------------------
// // Types
// // ---------------------------------------------------------------------------
// type OrderStatus = "Draft" | "Confirmed" | "Invoiced" | "Cancelled";
// type PaymentStatus = "Unpaid" | "Partial" | "Paid" | "Overdue";
// type SortField = "id" | "customer" | "date" | "amount" | "status" | "paymentStatus";
// type SortOrder = "asc" | "desc";

// interface SalesOrder {
//     id: string;
//     customer: string;
//     customerId: string;
//     date: string;
//     shipmentDate: string;
//     status: OrderStatus;
//     paymentStatus: PaymentStatus;
//     amount: number;
//     amountPaid: number;
//     items: number;
//     trend: number[];
// }

// // ---------------------------------------------------------------------------
// // Mock data
// // ---------------------------------------------------------------------------
// const initialOrders: SalesOrder[] = [
//     {
//         id: "SO-1042",
//         customer: "Acme Solutions",
//         customerId: "CUST-4092",
//         date: "2025-06-18",
//         shipmentDate: "2025-06-25",
//         status: "Confirmed",
//         paymentStatus: "Partial",
//         amount: 48500,
//         amountPaid: 24250,
//         items: 6,
//         trend: [30000, 35000, 38000, 42000, 44000, 46000, 47000, 48500],
//     },
//     {
//         id: "SO-1041",
//         customer: "Eco Stream Logistics",
//         customerId: "CUST-8210",
//         date: "2025-06-17",
//         shipmentDate: "2025-06-24",
//         status: "Invoiced",
//         paymentStatus: "Paid",
//         amount: 12200,
//         amountPaid: 12200,
//         items: 3,
//         trend: [8000, 9000, 9500, 10000, 10800, 11200, 11800, 12200],
//     },
//     {
//         id: "SO-1040",
//         customer: "FlexTech Systems",
//         customerId: "CUST-6390",
//         date: "2025-06-16",
//         shipmentDate: "2025-06-23",
//         status: "Draft",
//         paymentStatus: "Unpaid",
//         amount: 6750,
//         amountPaid: 0,
//         items: 4,
//         trend: [4000, 4500, 5000, 5500, 6000, 6200, 6500, 6750],
//     },
//     {
//         id: "SO-1039",
//         customer: "Blue Tier Tech",
//         customerId: "CUST-3912",
//         date: "2025-06-15",
//         shipmentDate: "2025-06-22",
//         status: "Cancelled",
//         paymentStatus: "Unpaid",
//         amount: 3300,
//         amountPaid: 0,
//         items: 2,
//         trend: [3300, 3300, 3300, 3300, 3300, 3300, 3300, 3300],
//     },
//     {
//         id: "SO-1038",
//         customer: "Digital Wave Inc",
//         customerId: "CUST-5512",
//         date: "2025-06-14",
//         shipmentDate: "2025-06-21",
//         status: "Invoiced",
//         paymentStatus: "Overdue",
//         amount: 91000,
//         amountPaid: 0,
//         items: 11,
//         trend: [60000, 65000, 70000, 75000, 80000, 85000, 88000, 91000],
//     },
//     {
//         id: "SO-1037",
//         customer: "Acme Solutions",
//         customerId: "CUST-4092",
//         date: "2025-06-13",
//         shipmentDate: "2025-06-20",
//         status: "Confirmed",
//         paymentStatus: "Unpaid",
//         amount: 22400,
//         amountPaid: 0,
//         items: 5,
//         trend: [15000, 16000, 17500, 19000, 20000, 21000, 21800, 22400],
//     },
//     {
//         id: "SO-1036",
//         customer: "Cloud Harbor",
//         customerId: "CUST-2844",
//         date: "2025-06-11",
//         shipmentDate: "2025-06-18",
//         status: "Draft",
//         paymentStatus: "Unpaid",
//         amount: 5100,
//         amountPaid: 0,
//         items: 3,
//         trend: [3000, 3500, 4000, 4200, 4500, 4700, 4900, 5100],
//     },
// ];

// // ---------------------------------------------------------------------------
// // Config
// // ---------------------------------------------------------------------------
// const statusConfig: Record<
//     OrderStatus,
//     { bg: string; text: string; dot: string; icon: React.ReactNode }
// > = {
//     Draft: {
//         bg: "bg-zinc-100",
//         text: "text-zinc-600",
//         dot: "bg-zinc-400",
//         icon: <Clock className="w-3 h-3" />,
//     },
//     Confirmed: {
//         bg: "bg-blue-50",
//         text: "text-blue-700",
//         dot: "bg-blue-500",
//         icon: <CheckCircle2 className="w-3 h-3" />,
//     },
//     Invoiced: {
//         bg: "bg-emerald-50",
//         text: "text-emerald-700",
//         dot: "bg-emerald-500",
//         icon: <Receipt className="w-3 h-3" />,
//     },
//     Cancelled: {
//         bg: "bg-red-50",
//         text: "text-red-600",
//         dot: "bg-red-400",
//         icon: <XCircle className="w-3 h-3" />,
//     },
// };

// const paymentStatusConfig: Record<
//     PaymentStatus,
//     { bg: string; text: string; icon: React.ReactNode }
// > = {
//     Unpaid: {
//         bg: "bg-zinc-100",
//         text: "text-zinc-600",
//         icon: <Clock className="w-3 h-3" />,
//     },
//     Partial: {
//         bg: "bg-yellow-50",
//         text: "text-yellow-700",
//         icon: <AlertCircle className="w-3 h-3" />,
//     },
//     Paid: {
//         bg: "bg-emerald-50",
//         text: "text-emerald-700",
//         icon: <CheckCircle2 className="w-3 h-3" />,
//     },
//     Overdue: {
//         bg: "bg-red-50",
//         text: "text-red-600",
//         icon: <AlertCircle className="w-3 h-3" />,
//     },
// };

// const statuses: OrderStatus[] = ["Draft", "Confirmed", "Invoiced", "Cancelled"];
// const paymentStatuses: PaymentStatus[] = ["Unpaid", "Partial", "Paid", "Overdue"];

// // ---------------------------------------------------------------------------
// // Components
// // ---------------------------------------------------------------------------
// function TrendBadge({ data }: { data: number[] }) {
//     const start = data[0];
//     const end = data[data.length - 1];
//     const pct = ((end - start) / start) * 100;
//     const positive = pct >= 0;

//     return (
//         <span
//             className={cn(
//                 "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
//                 positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
//             )}
//         >
//             {positive ? (
//                 <ArrowUpRight className="w-3 h-3" />
//             ) : (
//                 <ArrowDownRight className="w-3 h-3" />
//             )}
//             {Math.abs(pct).toFixed(1)}%
//         </span>
//     );
// }

// function StatCard({
//     label,
//     value,
//     delta,
//     icon,
// }: {
//     label: string;
//     value: string;
//     delta?: number;
//     icon?: React.ReactNode;
// }) {
//     const positive = delta !== undefined && delta >= 0;

//     return (
//         <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
//             <div className="flex items-center justify-between">
//                 <span className="text-[13px] font-medium text-zinc-500 flex items-center gap-1.5">
//                     {icon}
//                     {label}
//                 </span>
//                 {delta !== undefined && (
//                     <span
//                         className={cn(
//                             "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
//                             positive
//                                 ? "bg-emerald-50 text-emerald-700"
//                                 : "bg-red-50 text-red-700"
//                         )}
//                     >
//                         {positive ? (
//                             <ArrowUpRight className="w-3 h-3" />
//                         ) : (
//                             <ArrowDownRight className="w-3 h-3" />
//                         )}
//                         {Math.abs(delta)}%
//                     </span>
//                 )}
//             </div>
//             <span className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">
//                 {value}
//             </span>
//         </div>
//     );
// }

// function StatusBadge({ status }: { status: OrderStatus }) {
//     const cfg = statusConfig[status];
//     return (
//         <span
//             className={cn(
//                 "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
//                 cfg.bg,
//                 cfg.text
//             )}
//         >
//             {cfg.icon}
//             {status}
//         </span>
//     );
// }

// function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
//     const cfg = paymentStatusConfig[status];
//     return (
//         <span
//             className={cn(
//                 "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
//                 cfg.bg,
//                 cfg.text
//             )}
//         >
//             {cfg.icon}
//             {status}
//         </span>
//     );
// }

// function SortableHeader({
//     label,
//     field,
//     currentSort,
//     onSort,
// }: {
//     label: string;
//     field: SortField;
//     currentSort: { field: SortField; order: SortOrder } | null;
//     onSort: (field: SortField) => void;
// }) {
//     const isActive = currentSort?.field === field;
//     const isAsc = currentSort?.order === "asc";

//     return (
//         <button
//             onClick={() => onSort(field)}
//             className="flex items-center gap-1 hover:text-zinc-600 transition-colors"
//         >
//             {label}
//             {isActive && (
//                 <span className="text-[#5B5FEF]">
//                     {isAsc ? (
//                         <ChevronUp className="w-3.5 h-3.5" />
//                     ) : (
//                         <ChevronDown className="w-3.5 h-3.5" />
//                     )}
//                 </span>
//             )}
//         </button>
//     );
// }

// function formatDate(dateStr: string) {
//     return new Date(dateStr).toLocaleDateString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//     });
// }

// function formatCurrency(amount: number) {
//     return `₹${amount.toLocaleString("en-IN")}`;
// }

// // ---------------------------------------------------------------------------
// // Export function
// // ---------------------------------------------------------------------------
// function exportToCSV(data: SalesOrder[]) {
//     const headers = [
//         "Order ID",
//         "Customer",
//         "Date",
//         "Shipment Date",
//         "Status",
//         "Payment Status",
//         "Amount",
//         "Amount Paid",
//         "Items",
//     ];

//     const rows = data.map((order) => [
//         order.id,
//         order.customer,
//         formatDate(order.date),
//         formatDate(order.shipmentDate),
//         order.status,
//         order.paymentStatus,
//         order.amount,
//         order.amountPaid,
//         order.items,
//     ]);

//     const csv = [
//         headers.join(","),
//         ...rows.map((row) => row.join(",")),
//     ].join("\n");

//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `sales-orders-${new Date().toISOString().split("T")[0]}.csv`;
//     a.click();
// }

// // ---------------------------------------------------------------------------
// // Page
// // ---------------------------------------------------------------------------
// export default function SalesOrders() {
//     const router = useRouter();
//     const [orders] = useState<SalesOrder[]>(initialOrders);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [selectedStatus, setSelectedStatus] = useState<"All" | OrderStatus>(
//         "All"
//     );
//     const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<
//         "All" | PaymentStatus
//     >("All");
//     const [dateRangeStart, setDateRangeStart] = useState("");
//     const [dateRangeEnd, setDateRangeEnd] = useState("");
//     const [amountRangeMin, setAmountRangeMin] = useState("");
//     const [amountRangeMax, setAmountRangeMax] = useState("");
//     const [openMenuId, setOpenMenuId] = useState<string | null>(null);
//     const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
//     const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
//     const [sortConfig, setSortConfig] = useState<{
//         field: SortField;
//         order: SortOrder;
//     } | null>(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 5;

//     // Filter
//     const filtered = useMemo(() => {
//         return orders.filter((o) => {
//             const q = searchQuery.toLowerCase();
//             const matchesSearch =
//                 o.id.toLowerCase().includes(q) ||
//                 o.customer.toLowerCase().includes(q);
//             const matchesStatus =
//                 selectedStatus === "All" || o.status === selectedStatus;
//             const matchesPaymentStatus =
//                 selectedPaymentStatus === "All" ||
//                 o.paymentStatus === selectedPaymentStatus;

//             const orderDate = new Date(o.date);
//             let matchesDateRange = true;
//             if (dateRangeStart) {
//                 matchesDateRange =
//                     matchesDateRange &&
//                     orderDate >= new Date(dateRangeStart);
//             }
//             if (dateRangeEnd) {
//                 matchesDateRange =
//                     matchesDateRange &&
//                     orderDate <= new Date(dateRangeEnd);
//             }

//             let matchesAmountRange = true;
//             if (amountRangeMin) {
//                 matchesAmountRange =
//                     matchesAmountRange && o.amount >= parseInt(amountRangeMin);
//             }
//             if (amountRangeMax) {
//                 matchesAmountRange =
//                     matchesAmountRange && o.amount <= parseInt(amountRangeMax);
//             }

//             return (
//                 matchesSearch &&
//                 matchesStatus &&
//                 matchesPaymentStatus &&
//                 matchesDateRange &&
//                 matchesAmountRange
//             );
//         });
//     }, [
//         searchQuery,
//         selectedStatus,
//         selectedPaymentStatus,
//         dateRangeStart,
//         dateRangeEnd,
//         amountRangeMin,
//         amountRangeMax,
//     ]);

//     // Sort
//     const sorted = useMemo(() => {
//         if (!sortConfig) return filtered;

//         return [...filtered].sort((a, b) => {
//             let aVal: any = a[sortConfig.field];
//             let bVal: any = b[sortConfig.field];

//             if (sortConfig.field === "amount") {
//                 aVal = a.amount;
//                 bVal = b.amount;
//             } else if (sortConfig.field === "date") {
//                 aVal = new Date(a.date).getTime();
//                 bVal = new Date(b.date).getTime();
//             }

//             if (aVal < bVal) return sortConfig.order === "asc" ? -1 : 1;
//             if (aVal > bVal) return sortConfig.order === "asc" ? 1 : -1;
//             return 0;
//         });
//     }, [filtered, sortConfig]);

//     // Pagination
//     const totalPages = Math.ceil(sorted.length / itemsPerPage);
//     const startIdx = (currentPage - 1) * itemsPerPage;
//     const paginatedData = sorted.slice(
//         startIdx,
//         startIdx + itemsPerPage
//     );

//     // Reset pagination when filters change
//     const handleFilterChange = () => {
//         setCurrentPage(1);
//     };

//     const handleSort = (field: SortField) => {
//         if (sortConfig?.field === field) {
//             setSortConfig({
//                 field,
//                 order: sortConfig.order === "asc" ? "desc" : "asc",
//             });
//         } else {
//             setSortConfig({ field, order: "asc" });
//         }
//     };

//     const handleSelectAll = () => {
//         if (selectedOrders.size === paginatedData.length) {
//             setSelectedOrders(new Set());
//         } else {
//             setSelectedOrders(new Set(paginatedData.map((o) => o.id)));
//         }
//     };

//     const handleSelectOrder = (orderId: string) => {
//         const newSelected = new Set(selectedOrders);
//         if (newSelected.has(orderId)) {
//             newSelected.delete(orderId);
//         } else {
//             newSelected.add(orderId);
//         }
//         setSelectedOrders(newSelected);
//     };

//     const handleBulkStatusChange = (newStatus: OrderStatus) => {
//         // Mock implementation - in real app would update backend
//         console.log(`Changing ${selectedOrders.size} orders to ${newStatus}`);
//         setSelectedOrders(new Set());
//     };

//     const totalAmount = orders.reduce((s, o) => s + o.amount, 0);
//     const draftCount = orders.filter((o) => o.status === "Draft").length;
//     const confirmedCount = orders.filter(
//         (o) => o.status === "Confirmed"
//     ).length;
//     const unpaidCount = orders.filter((o) => o.paymentStatus === "Unpaid").length;
//     const overdueCount = orders.filter(
//         (o) => o.paymentStatus === "Overdue"
//     ).length;

//     const hasActiveFilters =
//         searchQuery ||
//         selectedStatus !== "All" ||
//         selectedPaymentStatus !== "All" ||
//         dateRangeStart ||
//         dateRangeEnd ||
//         amountRangeMin ||
//         amountRangeMax;

//     return (
//         <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
//             <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">

//                 {/* Page header */}
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
//                             Sales Orders
//                         </h1>
//                         <p className="text-[13px] text-zinc-500 mt-0.5">
//                             Track and manage customer orders end-to-end
//                         </p>
//                     </div>
//                     <button
//                         onClick={() => router.push("/sales-orders/new")}
//                         className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
//                     >
//                         <Plus className="w-4 h-4" />
//                         New Sales Order
//                     </button>
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                     <StatCard
//                         label="Total Orders"
//                         value={String(orders.length)}
//                         delta={9.3}
//                         icon={<FileText className="w-3.5 h-3.5 text-zinc-400" />}
//                     />
//                     <StatCard
//                         label="Unpaid Invoices"
//                         value={String(unpaidCount)}
//                         delta={-2.1}
//                         icon={<AlertCircle className="w-3.5 h-3.5 text-zinc-400" />}
//                     />
//                     <StatCard
//                         label="Overdue"
//                         value={String(overdueCount)}
//                         delta={1}
//                         icon={<Clock className="w-3.5 h-3.5 text-zinc-400" />}
//                     />
//                     <StatCard
//                         label="Total Value"
//                         value={`₹${totalAmount.toLocaleString("en-IN")}`}
//                         delta={11.6}
//                         icon={<Receipt className="w-3.5 h-3.5 text-zinc-400" />}
//                     />
//                 </div>

//                 {/* Bulk action toolbar */}
//                 {selectedOrders.size > 0 && (
//                     <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                             <span className="text-[13px] font-medium text-blue-700">
//                                 {selectedOrders.size} order{selectedOrders.size !== 1 ? "s" : ""} selected
//                             </span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <button
//                                 onClick={() =>
//                                     handleBulkStatusChange("Confirmed")
//                                 }
//                                 className="px-3 py-1.5 text-[13px] font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
//                             >
//                                 Mark Confirmed
//                             </button>
//                             <button
//                                 onClick={() =>
//                                     setSelectedOrders(new Set())
//                                 }
//                                 className="px-3 py-1.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors"
//                             >
//                                 Clear
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* Table section */}
//                 <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

//                     {/* Table header controls */}
//                     <div className="px-6 py-4 border-b border-zinc-100 space-y-4">
//                         <div className="flex items-center justify-between gap-4">
//                             <div>
//                                 <h2 className="text-[14px] font-semibold text-zinc-900">
//                                     Order List
//                                 </h2>
//                                 <p className="text-[12px] text-zinc-500">
//                                     {sorted.length} order{sorted.length !== 1 ? "s" : ""} {hasActiveFilters && "(filtered)"}
//                                 </p>
//                             </div>

//                             <div className="flex items-center gap-2">
//                                 {/* Search */}
//                                 <div className="relative w-56">
//                                     <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
//                                     <input
//                                         type="text"
//                                         placeholder="Search orders..."
//                                         value={searchQuery}
//                                         onChange={(e) => {
//                                             setSearchQuery(e.target.value);
//                                             handleFilterChange();
//                                         }}
//                                         className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
//                                     />
//                                 </div>

//                                 {/* Status filter */}
//                                 <div className="relative">
//                                     <select
//                                         value={selectedStatus}
//                                         onChange={(e) => {
//                                             setSelectedStatus(e.target.value as "All" | OrderStatus);
//                                             handleFilterChange();
//                                         }}
//                                         className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
//                                     >
//                                         <option value="All">All Status</option>
//                                         {statuses.map((s) => (
//                                             <option key={s} value={s}>
//                                                 {s}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
//                                 </div>

//                                 {/* Advanced filters toggle */}
//                                 <button
//                                     onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
//                                     className={cn(
//                                         "p-1.5 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors",
//                                         showAdvancedFilter
//                                             ? "bg-[#5B5FEF] text-white"
//                                             : "text-zinc-600 hover:bg-zinc-100"
//                                     )}
//                                 >
//                                     <Filter className="w-4 h-4" />
//                                     Filters
//                                 </button>

//                                 {/* Export */}
//                                 <button
//                                     onClick={() => exportToCSV(sorted)}
//                                     className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
//                                     title="Export to CSV"
//                                 >
//                                     <Download className="w-4 h-4" />
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Advanced filters panel */}
//                         {showAdvancedFilter && (
//                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-100">
//                                 <div>
//                                     <label className="text-[12px] font-medium text-zinc-600 block mb-1">
//                                         Date From
//                                     </label>
//                                     <input
//                                         type="date"
//                                         value={dateRangeStart}
//                                         onChange={(e) => {
//                                             setDateRangeStart(e.target.value);
//                                             handleFilterChange();
//                                         }}
//                                         className="w-full px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="text-[12px] font-medium text-zinc-600 block mb-1">
//                                         Date To
//                                     </label>
//                                     <input
//                                         type="date"
//                                         value={dateRangeEnd}
//                                         onChange={(e) => {
//                                             setDateRangeEnd(e.target.value);
//                                             handleFilterChange();
//                                         }}
//                                         className="w-full px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="text-[12px] font-medium text-zinc-600 block mb-1">
//                                         Amount Min
//                                     </label>
//                                     <input
//                                         type="number"
//                                         placeholder="0"
//                                         value={amountRangeMin}
//                                         onChange={(e) => {
//                                             setAmountRangeMin(e.target.value);
//                                             handleFilterChange();
//                                         }}
//                                         className="w-full px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="text-[12px] font-medium text-zinc-600 block mb-1">
//                                         Amount Max
//                                     </label>
//                                     <input
//                                         type="number"
//                                         placeholder="999999"
//                                         value={amountRangeMax}
//                                         onChange={(e) => {
//                                             setAmountRangeMax(e.target.value);
//                                             handleFilterChange();
//                                         }}
//                                         className="w-full px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
//                                     />
//                                 </div>
//                                 <div className="sm:col-span-2">
//                                     <label className="text-[12px] font-medium text-zinc-600 block mb-1">
//                                         Payment Status
//                                     </label>
//                                     <select
//                                         value={selectedPaymentStatus}
//                                         onChange={(e) => {
//                                             setSelectedPaymentStatus(
//                                                 e.target.value as "All" | PaymentStatus
//                                             );
//                                             handleFilterChange();
//                                         }}
//                                         className="w-full appearance-none px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
//                                     >
//                                         <option value="All">All Payment Status</option>
//                                         {paymentStatuses.map((s) => (
//                                             <option key={s} value={s}>
//                                                 {s}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 {hasActiveFilters && (
//                                     <div className="sm:col-span-2 flex gap-2">
//                                         <button
//                                             onClick={() => {
//                                                 setSearchQuery("");
//                                                 setSelectedStatus("All");
//                                                 setSelectedPaymentStatus("All");
//                                                 setDateRangeStart("");
//                                                 setDateRangeEnd("");
//                                                 setAmountRangeMin("");
//                                                 setAmountRangeMax("");
//                                                 setCurrentPage(1);
//                                             }}
//                                             className="flex-1 px-2.5 py-1.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
//                                         >
//                                             Clear Filters
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     {/* Table */}
//                     <table className="w-full text-left">
//                         <thead>
//                             <tr className="border-b border-zinc-100 bg-zinc-50/50">
//                                 <th className="px-4 py-2.5">
//                                     <button
//                                         onClick={handleSelectAll}
//                                         className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 transition-colors"
//                                     >
//                                         {selectedOrders.size === paginatedData.length &&
//                                             paginatedData.length > 0 ? (
//                                             <CheckSquare className="w-3.5 h-3.5 text-[#5B5FEF]" />
//                                         ) : (
//                                             <Square className="w-3.5 h-3.5" />
//                                         )}
//                                     </button>
//                                 </th>
//                                 {[
//                                     { label: "", field: null as any },
//                                     { label: "Order", field: "id" as const },
//                                     { label: "Customer", field: "customer" as const },
//                                     { label: "Date", field: "date" as const },
//                                     { label: "Shipment Date", field: null as any },
//                                     { label: "Status", field: "status" as const },
//                                     { label: "Payment", field: "paymentStatus" as const },
//                                     { label: "Items", field: null as any },
//                                     { label: "Amount", field: "amount" as const },
//                                     { label: "Trend", field: null as any },
//                                     { label: "", field: null as any },
//                                 ].map((col) => (
//                                     <th
//                                         key={col.label || "checkbox"}
//                                         className={cn(
//                                             "px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap",
//                                             (col.label === "" || !col.field) && "text-center"
//                                         )}
//                                     >
//                                         {col.field ? (
//                                             <SortableHeader
//                                                 label={col.label}
//                                                 field={col.field}
//                                                 currentSort={sortConfig}
//                                                 onSort={handleSort}
//                                             />
//                                         ) : (
//                                             col.label
//                                         )}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-zinc-100">
//                             {paginatedData.map((order) => (
//                                 <tr
//                                     key={order.id}
//                                     className={cn(
//                                         "cursor-pointer transition-colors relative group",
//                                         selectedOrders.has(order.id)
//                                             ? "bg-blue-50"
//                                             : "hover:bg-zinc-50/70"
//                                     )}
//                                     onClick={() => setOpenMenuId(null)}
//                                 >
//                                     {/* Checkbox */}
//                                     <td className="px-4 py-3">
//                                         <button
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 handleSelectOrder(order.id);
//                                             }}
//                                             className={cn(
//                                                 "p-0.5 rounded transition-colors",
//                                                 selectedOrders.has(order.id)
//                                                     ? "text-[#5B5FEF]"
//                                                     : "text-zinc-300 group-hover:text-zinc-400"
//                                             )}
//                                         >
//                                             {selectedOrders.has(order.id) ? (
//                                                 <CheckSquare className="w-3.5 h-3.5" />
//                                             ) : (
//                                                 <Square className="w-3.5 h-3.5" />
//                                             )}
//                                         </button>
//                                     </td>

//                                     {/* Order ID */}
//                                     <td className="px-6 py-3">
//                                         <span className="text-[13px] font-semibold text-[#5B5FEF]">
//                                             {order.id}
//                                         </span>
//                                     </td>

//                                     {/* Customer */}
//                                     <td className="px-6 py-3">
//                                         <div>
//                                             <p className="text-[13px] font-medium text-zinc-900">
//                                                 {order.customer}
//                                             </p>
//                                             <p className="text-[12px] text-zinc-400">
//                                                 {order.customerId}
//                                             </p>
//                                         </div>
//                                     </td>

//                                     {/* Date */}
//                                     <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
//                                         {formatDate(order.date)}
//                                     </td>

//                                     {/* Shipment date */}
//                                     <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
//                                         {formatDate(order.shipmentDate)}
//                                     </td>

//                                     {/* Status */}
//                                     <td className="px-6 py-3">
//                                         <StatusBadge status={order.status} />
//                                     </td>

//                                     {/* Payment Status */}
//                                     <td className="px-6 py-3">
//                                         <div className="flex flex-col gap-0.5">
//                                             <PaymentStatusBadge
//                                                 status={order.paymentStatus}
//                                             />
//                                             <span className="text-[12px] text-zinc-500">
//                                                 {formatCurrency(order.amountPaid)} / {formatCurrency(order.amount)}
//                                             </span>
//                                         </div>
//                                     </td>

//                                     {/* Items */}
//                                     <td className="px-6 py-3 text-[13px] text-zinc-600 tabular-nums">
//                                         {order.items}
//                                     </td>

//                                     {/* Amount */}
//                                     <td className="px-6 py-3 font-mono text-[13px] font-medium text-zinc-900 tabular-nums whitespace-nowrap">
//                                         {formatCurrency(order.amount)}
//                                     </td>

//                                     {/* Trend */}
//                                     <td className="px-6 py-3">
//                                         <TrendBadge data={order.trend} />
//                                     </td>

//                                     {/* Actions */}
//                                     <td
//                                         className="px-6 py-3 text-right relative"
//                                         onClick={(e) => e.stopPropagation()}
//                                     >
//                                         <button
//                                             onClick={() =>
//                                                 setOpenMenuId(
//                                                     openMenuId === order.id ? null : order.id
//                                                 )
//                                             }
//                                             className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
//                                         >
//                                             <MoreHorizontal className="w-4 h-4" />
//                                         </button>

//                                         {openMenuId === order.id && (
//                                             <div className="absolute right-6 top-10 z-10 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 w-48">
//                                                 {order.status === "Draft" && (
//                                                     <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
//                                                         <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
//                                                         Mark as Confirmed
//                                                     </button>
//                                                 )}
//                                                 {order.status === "Confirmed" && (
//                                                     <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
//                                                         <Receipt className="w-3.5 h-3.5 text-emerald-500" />
//                                                         Convert to Invoice
//                                                     </button>
//                                                 )}
//                                                 <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
//                                                     <FileText className="w-3.5 h-3.5 text-zinc-400" />
//                                                     Edit Order
//                                                 </button>
//                                                 {order.status !== "Cancelled" &&
//                                                     order.status !== "Invoiced" && (
//                                                         <button className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2">
//                                                             <XCircle className="w-3.5 h-3.5" />
//                                                             Cancel Order
//                                                         </button>
//                                                     )}
//                                             </div>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ))}

//                             {sorted.length === 0 && (
//                                 <tr>
//                                     <td
//                                         colSpan={11}
//                                         className="px-6 py-12 text-center"
//                                     >
//                                         <p className="text-[13px] text-zinc-400">
//                                             No orders match your filters.
//                                         </p>
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>

//                     {/* Pagination */}
//                     {totalPages > 1 && (
//                         <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
//                             <span className="text-[12px] text-zinc-500">
//                                 Showing {startIdx + 1}-
//                                 {Math.min(startIdx + itemsPerPage, sorted.length)} of{" "}
//                                 {sorted.length}
//                             </span>
//                             <div className="flex items-center gap-2">
//                                 <button
//                                     onClick={() =>
//                                         setCurrentPage(Math.max(1, currentPage - 1))
//                                     }
//                                     disabled={currentPage === 1}
//                                     className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                                 >
//                                     <ChevronLeft className="w-4 h-4" />
//                                 </button>
//                                 <span className="text-[12px] text-zinc-600">
//                                     Page {currentPage} of {totalPages}
//                                 </span>
//                                 <button
//                                     onClick={() =>
//                                         setCurrentPage(
//                                             Math.min(totalPages, currentPage + 1)
//                                         )
//                                     }
//                                     disabled={currentPage === totalPages}
//                                     className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                                 >
//                                     <ChevronRight className="w-4 h-4" />
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// "use client";

// import { useState, useMemo } from "react";
// import { cn } from "@/lib/utils";
// import { useRouter } from "next/navigation";
// import {
//     Search,
//     Plus,
//     ChevronDown,
//     ChevronUp,
//     MoreHorizontal,
//     ArrowUpRight,
//     ArrowDownRight,
//     FileText,
//     CheckCircle2,
//     XCircle,
//     Clock,
//     Truck,
//     Receipt,
//     Filter,
//     Download,
//     ChevronLeft,
//     ChevronRight,
//     CheckSquare,
//     Square,
// } from "lucide-react";

// // ---------------------------------------------------------------------------
// // Types
// // ---------------------------------------------------------------------------
// type OrderStatus = "Draft" | "Confirmed" | "Shipped" | "Invoiced" | "Cancelled";
// type SortField = "id" | "customer" | "date" | "amount" | "status";
// type SortOrder = "asc" | "desc";

// interface SalesOrder {
//     id: string;
//     customer: string;
//     customerId: string;
//     date: string;
//     shipmentDate: string;
//     status: OrderStatus;
//     amount: number;
//     items: number;
//     trend: number[];
// }

// // ---------------------------------------------------------------------------
// // Mock data
// // ---------------------------------------------------------------------------
// const initialOrders: SalesOrder[] = [
//     {
//         id: "SO-1042",
//         customer: "Acme Solutions",
//         customerId: "CUST-4092",
//         date: "2025-06-18",
//         shipmentDate: "2025-06-25",
//         status: "Confirmed",
//         amount: 48500,
//         items: 6,
//         trend: [30000, 35000, 38000, 42000, 44000, 46000, 47000, 48500],
//     },
//     {
//         id: "SO-1041",
//         customer: "Eco Stream Logistics",
//         customerId: "CUST-8210",
//         date: "2025-06-17",
//         shipmentDate: "2025-06-24",
//         status: "Invoiced",
//         amount: 12200,
//         items: 3,
//         trend: [8000, 9000, 9500, 10000, 10800, 11200, 11800, 12200],
//     },
//     {
//         id: "SO-1040",
//         customer: "FlexTech Systems",
//         customerId: "CUST-6390",
//         date: "2025-06-16",
//         shipmentDate: "2025-06-23",
//         status: "Draft",
//         amount: 6750,
//         items: 4,
//         trend: [4000, 4500, 5000, 5500, 6000, 6200, 6500, 6750],
//     },
//     {
//         id: "SO-1039",
//         customer: "Blue Tier Tech",
//         customerId: "CUST-3912",
//         date: "2025-06-15",
//         shipmentDate: "2025-06-22",
//         status: "Cancelled",
//         amount: 3300,
//         items: 2,
//         trend: [3300, 3300, 3300, 3300, 3300, 3300, 3300, 3300],
//     },
//     {
//         id: "SO-1038",
//         customer: "Digital Wave Inc",
//         customerId: "CUST-5512",
//         date: "2025-06-14",
//         shipmentDate: "2025-06-21",
//         status: "Invoiced",
//         amount: 91000,
//         items: 11,
//         trend: [60000, 65000, 70000, 75000, 80000, 85000, 88000, 91000],
//     },
//     {
//         id: "SO-1037",
//         customer: "Acme Solutions",
//         customerId: "CUST-4092",
//         date: "2025-06-13",
//         shipmentDate: "2025-06-20",
//         status: "Confirmed",
//         amount: 22400,
//         items: 5,
//         trend: [15000, 16000, 17500, 19000, 20000, 21000, 21800, 22400],
//     },
//     {
//         id: "SO-1036",
//         customer: "Cloud Harbor",
//         customerId: "CUST-2844",
//         date: "2025-06-11",
//         shipmentDate: "2025-06-18",
//         status: "Draft",
//         amount: 5100,
//         items: 3,
//         trend: [3000, 3500, 4000, 4200, 4500, 4700, 4900, 5100],
//     },
// ];

// // ---------------------------------------------------------------------------
// // Config
// // ---------------------------------------------------------------------------
// const statusConfig: Record<
//     OrderStatus,
//     { bg: string; text: string; dot: string; icon: React.ReactNode }
// > = {
//     Draft: {
//         bg: "bg-zinc-100",
//         text: "text-zinc-600",
//         dot: "bg-zinc-400",
//         icon: <Clock className="w-3 h-3" />,
//     },
//     Confirmed: {
//         bg: "bg-blue-50",
//         text: "text-blue-700",
//         dot: "bg-blue-500",
//         icon: <CheckCircle2 className="w-3 h-3" />,
//     },
//     Shipped: {
//         bg: "bg-purple-50",
//         text: "text-purple-700",
//         dot: "bg-purple-500",
//         icon: <Truck className="w-3 h-3" />,
//     },
//     Invoiced: {
//         bg: "bg-emerald-50",
//         text: "text-emerald-700",
//         dot: "bg-emerald-500",
//         icon: <Receipt className="w-3 h-3" />,
//     },
//     Cancelled: {
//         bg: "bg-red-50",
//         text: "text-red-600",
//         dot: "bg-red-400",
//         icon: <XCircle className="w-3 h-3" />,
//     },
// };

// const statuses: OrderStatus[] = ["Draft", "Confirmed", "Shipped", "Invoiced", "Cancelled"];

// // ---------------------------------------------------------------------------
// // Components
// // ---------------------------------------------------------------------------
// function TrendBadge({ data }: { data: number[] }) {
//     const start = data[0];
//     const end = data[data.length - 1];
//     const pct = ((end - start) / start) * 100;
//     const positive = pct >= 0;

//     return (
//         <span
//             className={cn(
//                 "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
//                 positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
//             )}
//         >
//             {positive ? (
//                 <ArrowUpRight className="w-3 h-3" />
//             ) : (
//                 <ArrowDownRight className="w-3 h-3" />
//             )}
//             {Math.abs(pct).toFixed(1)}%
//         </span>
//     );
// }

// function StatCard({
//     label,
//     value,
//     delta,
//     icon,
// }: {
//     label: string;
//     value: string;
//     delta?: number;
//     icon?: React.ReactNode;
// }) {
//     const positive = delta !== undefined && delta >= 0;

//     return (
//         <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
//             <div className="flex items-center justify-between">
//                 <span className="text-[13px] font-medium text-zinc-500 flex items-center gap-1.5">
//                     {icon}
//                     {label}
//                 </span>
//                 {delta !== undefined && (
//                     <span
//                         className={cn(
//                             "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
//                             positive
//                                 ? "bg-emerald-50 text-emerald-700"
//                                 : "bg-red-50 text-red-700"
//                         )}
//                     >
//                         {positive ? (
//                             <ArrowUpRight className="w-3 h-3" />
//                         ) : (
//                             <ArrowDownRight className="w-3 h-3" />
//                         )}
//                         {Math.abs(delta)}%
//                     </span>
//                 )}
//             </div>
//             <span className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">
//                 {value}
//             </span>
//         </div>
//     );
// }

// function StatusBadge({ status }: { status: OrderStatus }) {
//     const cfg = statusConfig[status];
//     return (
//         <span
//             className={cn(
//                 "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
//                 cfg.bg,
//                 cfg.text
//             )}
//         >
//             {cfg.icon}
//             {status}
//         </span>
//     );
// }

// function SortableHeader({
//     label,
//     field,
//     currentSort,
//     onSort,
// }: {
//     label: string;
//     field: SortField;
//     currentSort: { field: SortField; order: SortOrder } | null;
//     onSort: (field: SortField) => void;
// }) {
//     const isActive = currentSort?.field === field;
//     const isAsc = currentSort?.order === "asc";

//     return (
//         <button
//             onClick={() => onSort(field)}
//             className="flex items-center gap-1 hover:text-zinc-600 transition-colors"
//         >
//             {label}
//             {isActive && (
//                 <span className="text-[#5B5FEF]">
//                     {isAsc ? (
//                         <ChevronUp className="w-3.5 h-3.5" />
//                     ) : (
//                         <ChevronDown className="w-3.5 h-3.5" />
//                     )}
//                 </span>
//             )}
//         </button>
//     );
// }

// function formatDate(dateStr: string) {
//     return new Date(dateStr).toLocaleDateString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//     });
// }

// function formatCurrency(amount: number) {
//     return `₹${amount.toLocaleString("en-IN")}`;
// }

// // ---------------------------------------------------------------------------
// // Export function
// // ---------------------------------------------------------------------------
// function exportToCSV(data: SalesOrder[]) {
//     const headers = [
//         "Order ID",
//         "Customer",
//         "Date",
//         "Shipment Date",
//         "Status",
//         "Amount",
//         "Items",
//     ];

//     const rows = data.map((order) => [
//         order.id,
//         order.customer,
//         formatDate(order.date),
//         formatDate(order.shipmentDate),
//         order.status,
//         order.amount,
//         order.items,
//     ]);

//     const csv = [
//         headers.join(","),
//         ...rows.map((row) => row.join(",")),
//     ].join("\n");

//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `sales-orders-${new Date().toISOString().split("T")[0]}.csv`;
//     a.click();
// }

// // ---------------------------------------------------------------------------
// // Page
// // ---------------------------------------------------------------------------
// export default function SalesOrders() {
//     const router = useRouter();
//     const [orders] = useState<SalesOrder[]>(initialOrders);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [selectedStatus, setSelectedStatus] = useState<"All" | OrderStatus>(
//         "All"
//     );
//     const [dateRangeStart, setDateRangeStart] = useState("");
//     const [dateRangeEnd, setDateRangeEnd] = useState("");
//     const [amountRangeMin, setAmountRangeMin] = useState("");
//     const [amountRangeMax, setAmountRangeMax] = useState("");
//     const [openMenuId, setOpenMenuId] = useState<string | null>(null);
//     const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
//     const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
//     const [sortConfig, setSortConfig] = useState<{
//         field: SortField;
//         order: SortOrder;
//     } | null>(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 5;

//     // Filter
//     const filtered = useMemo(() => {
//         return orders.filter((o) => {
//             const q = searchQuery.toLowerCase();
//             const matchesSearch =
//                 o.id.toLowerCase().includes(q) ||
//                 o.customer.toLowerCase().includes(q);
//             const matchesStatus =
//                 selectedStatus === "All" || o.status === selectedStatus;

//             const orderDate = new Date(o.date);
//             let matchesDateRange = true;
//             if (dateRangeStart) {
//                 matchesDateRange =
//                     matchesDateRange &&
//                     orderDate >= new Date(dateRangeStart);
//             }
//             if (dateRangeEnd) {
//                 matchesDateRange =
//                     matchesDateRange &&
//                     orderDate <= new Date(dateRangeEnd);
//             }

//             let matchesAmountRange = true;
//             if (amountRangeMin) {
//                 matchesAmountRange =
//                     matchesAmountRange && o.amount >= parseInt(amountRangeMin);
//             }
//             if (amountRangeMax) {
//                 matchesAmountRange =
//                     matchesAmountRange && o.amount <= parseInt(amountRangeMax);
//             }

//             return (
//                 matchesSearch &&
//                 matchesStatus &&
//                 matchesDateRange &&
//                 matchesAmountRange
//             );
//         });
//     }, [
//         searchQuery,
//         selectedStatus,
//         dateRangeStart,
//         dateRangeEnd,
//         amountRangeMin,
//         amountRangeMax,
//     ]);

//     // Sort
//     const sorted = useMemo(() => {
//         if (!sortConfig) return filtered;

//         return [...filtered].sort((a, b) => {
//             let aVal: any = a[sortConfig.field];
//             let bVal: any = b[sortConfig.field];

//             if (sortConfig.field === "amount") {
//                 aVal = a.amount;
//                 bVal = b.amount;
//             } else if (sortConfig.field === "date") {
//                 aVal = new Date(a.date).getTime();
//                 bVal = new Date(b.date).getTime();
//             }

//             if (aVal < bVal) return sortConfig.order === "asc" ? -1 : 1;
//             if (aVal > bVal) return sortConfig.order === "asc" ? 1 : -1;
//             return 0;
//         });
//     }, [filtered, sortConfig]);

//     // Pagination
//     const totalPages = Math.ceil(sorted.length / itemsPerPage);
//     const startIdx = (currentPage - 1) * itemsPerPage;
//     const paginatedData = sorted.slice(
//         startIdx,
//         startIdx + itemsPerPage
//     );

//     const handleFilterChange = () => {
//         setCurrentPage(1);
//     };

//     const handleSort = (field: SortField) => {
//         if (sortConfig?.field === field) {
//             setSortConfig({
//                 field,
//                 order: sortConfig.order === "asc" ? "desc" : "asc",
//             });
//         } else {
//             setSortConfig({ field, order: "asc" });
//         }
//     };

//     const handleSelectAll = () => {
//         if (selectedOrders.size === paginatedData.length) {
//             setSelectedOrders(new Set());
//         } else {
//             setSelectedOrders(new Set(paginatedData.map((o) => o.id)));
//         }
//     };

//     const handleSelectOrder = (orderId: string) => {
//         const newSelected = new Set(selectedOrders);
//         if (newSelected.has(orderId)) {
//             newSelected.delete(orderId);
//         } else {
//             newSelected.add(orderId);
//         }
//         setSelectedOrders(newSelected);
//     };

//     const handleBulkStatusChange = (newStatus: OrderStatus) => {
//         // Mock implementation - in real app would update backend
//         console.log(`Changing ${selectedOrders.size} orders to ${newStatus}`);
//         setSelectedOrders(new Set());
//     };

//     const totalAmount = orders.reduce((s, o) => s + o.amount, 0);
//     const draftCount = orders.filter((o) => o.status === "Draft").length;
//     const confirmedCount = orders.filter((o) => o.status === "Confirmed").length;
//     const shippedCount = orders.filter((o) => o.status === "Shipped").length;

//     const hasActiveFilters =
//         searchQuery ||
//         selectedStatus !== "All" ||
//         dateRangeStart ||
//         dateRangeEnd ||
//         amountRangeMin ||
//         amountRangeMax;

//     return (
//         <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
//             <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">

//                 {/* Page header */}
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
//                             Sales Orders
//                         </h1>
//                         <p className="text-[13px] text-zinc-500 mt-0.5">
//                             Track orders from confirmation to invoicing
//                         </p>
//                     </div>
//                     <button
//                         onClick={() => router.push("/sales-orders/new")}
//                         className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
//                     >
//                         <Plus className="w-4 h-4" />
//                         New Sales Order
//                     </button>
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                     <StatCard
//                         label="Total Orders"
//                         value={String(orders.length)}
//                         delta={9.3}
//                         icon={<FileText className="w-3.5 h-3.5 text-zinc-400" />}
//                     />
//                     <StatCard
//                         label="Confirmed"
//                         value={String(confirmedCount)}
//                         delta={4.1}
//                         icon={<CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />}
//                     />
//                     <StatCard
//                         label="Shipped"
//                         value={String(shippedCount)}
//                         delta={2.8}
//                         icon={<Truck className="w-3.5 h-3.5 text-zinc-400" />}
//                     />
//                     <StatCard
//                         label="Total Value"
//                         value={`₹${totalAmount.toLocaleString("en-IN")}`}
//                         delta={11.6}
//                         icon={<Receipt className="w-3.5 h-3.5 text-zinc-400" />}
//                     />
//                 </div>

//                 {/* Bulk action toolbar */}
//                 {selectedOrders.size > 0 && (
//                     <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                             <span className="text-[13px] font-medium text-blue-700">
//                                 {selectedOrders.size} order{selectedOrders.size !== 1 ? "s" : ""} selected
//                             </span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <button
//                                 onClick={() =>
//                                     handleBulkStatusChange("Confirmed")
//                                 }
//                                 className="px-3 py-1.5 text-[13px] font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
//                             >
//                                 Mark Confirmed
//                             </button>
//                             <button
//                                 onClick={() =>
//                                     handleBulkStatusChange("Shipped")
//                                 }
//                                 className="px-3 py-1.5 text-[13px] font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
//                             >
//                                 Mark Shipped
//                             </button>
//                             <button
//                                 onClick={() =>
//                                     setSelectedOrders(new Set())
//                                 }
//                                 className="px-3 py-1.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors"
//                             >
//                                 Clear
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* Table section */}
//                 <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

//                     {/* Table header controls */}
//                     <div className="px-6 py-4 border-b border-zinc-100 space-y-4">
//                         <div className="flex items-center justify-between gap-4">
//                             <div>
//                                 <h2 className="text-[14px] font-semibold text-zinc-900">
//                                     Order List
//                                 </h2>
//                                 <p className="text-[12px] text-zinc-500">
//                                     {sorted.length} order{sorted.length !== 1 ? "s" : ""} {hasActiveFilters && "(filtered)"}
//                                 </p>
//                             </div>

//                             <div className="flex items-center gap-2">
//                                 {/* Search */}
//                                 <div className="relative w-56">
//                                     <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
//                                     <input
//                                         type="text"
//                                         placeholder="Search orders..."
//                                         value={searchQuery}
//                                         onChange={(e) => {
//                                             setSearchQuery(e.target.value);
//                                             handleFilterChange();
//                                         }}
//                                         className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
//                                     />
//                                 </div>

//                                 {/* Status filter */}
//                                 <div className="relative">
//                                     <select
//                                         value={selectedStatus}
//                                         onChange={(e) => {
//                                             setSelectedStatus(e.target.value as "All" | OrderStatus);
//                                             handleFilterChange();
//                                         }}
//                                         className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
//                                     >
//                                         <option value="All">All Status</option>
//                                         {statuses.map((s) => (
//                                             <option key={s} value={s}>
//                                                 {s}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
//                                 </div>

//                                 {/* Advanced filters toggle */}
//                                 <button
//                                     onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
//                                     className={cn(
//                                         "p-1.5 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors",
//                                         showAdvancedFilter
//                                             ? "bg-[#5B5FEF] text-white"
//                                             : "text-zinc-600 hover:bg-zinc-100"
//                                     )}
//                                 >
//                                     <Filter className="w-4 h-4" />
//                                     Filters
//                                 </button>

//                                 {/* Export */}
//                                 <button
//                                     onClick={() => exportToCSV(sorted)}
//                                     className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
//                                     title="Export to CSV"
//                                 >
//                                     <Download className="w-4 h-4" />
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Advanced filters panel */}
//                         {showAdvancedFilter && (
//                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-100">
//                                 <div>
//                                     <label className="text-[12px] font-medium text-zinc-600 block mb-1">
//                                         Date From
//                                     </label>
//                                     <input
//                                         type="date"
//                                         value={dateRangeStart}
//                                         onChange={(e) => {
//                                             setDateRangeStart(e.target.value);
//                                             handleFilterChange();
//                                         }}
//                                         className="w-full px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="text-[12px] font-medium text-zinc-600 block mb-1">
//                                         Date To
//                                     </label>
//                                     <input
//                                         type="date"
//                                         value={dateRangeEnd}
//                                         onChange={(e) => {
//                                             setDateRangeEnd(e.target.value);
//                                             handleFilterChange();
//                                         }}
//                                         className="w-full px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="text-[12px] font-medium text-zinc-600 block mb-1">
//                                         Amount Min
//                                     </label>
//                                     <input
//                                         type="number"
//                                         placeholder="0"
//                                         value={amountRangeMin}
//                                         onChange={(e) => {
//                                             setAmountRangeMin(e.target.value);
//                                             handleFilterChange();
//                                         }}
//                                         className="w-full px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="text-[12px] font-medium text-zinc-600 block mb-1">
//                                         Amount Max
//                                     </label>
//                                     <input
//                                         type="number"
//                                         placeholder="999999"
//                                         value={amountRangeMax}
//                                         onChange={(e) => {
//                                             setAmountRangeMax(e.target.value);
//                                             handleFilterChange();
//                                         }}
//                                         className="w-full px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
//                                     />
//                                 </div>
//                                 {hasActiveFilters && (
//                                     <div className="sm:col-span-4 flex gap-2">
//                                         <button
//                                             onClick={() => {
//                                                 setSearchQuery("");
//                                                 setSelectedStatus("All");
//                                                 setDateRangeStart("");
//                                                 setDateRangeEnd("");
//                                                 setAmountRangeMin("");
//                                                 setAmountRangeMax("");
//                                                 setCurrentPage(1);
//                                             }}
//                                             className="px-2.5 py-1.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
//                                         >
//                                             Clear Filters
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     {/* Table */}
//                     <table className="w-full text-left">
//                         <thead>
//                             <tr className="border-b border-zinc-100 bg-zinc-50/50">
//                                 <th className="px-4 py-2.5">
//                                     <button
//                                         onClick={handleSelectAll}
//                                         className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 transition-colors"
//                                     >
//                                         {selectedOrders.size === paginatedData.length &&
//                                             paginatedData.length > 0 ? (
//                                             <CheckSquare className="w-3.5 h-3.5 text-[#5B5FEF]" />
//                                         ) : (
//                                             <Square className="w-3.5 h-3.5" />
//                                         )}
//                                     </button>
//                                 </th>
//                                 {[
//                                     { label: "Order", field: "id" as const },
//                                     { label: "Customer", field: "customer" as const },
//                                     { label: "Date", field: "date" as const },
//                                     { label: "Shipment Date", field: null as any },
//                                     { label: "Status", field: "status" as const },
//                                     { label: "Items", field: null as any },
//                                     { label: "Amount", field: "amount" as const },
//                                     { label: "Trend", field: null as any },
//                                     { label: "", field: null as any },
//                                 ].map((col) => (
//                                     <th
//                                         key={col.label || "actions"}
//                                         className={cn(
//                                             "px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap",
//                                             col.label === "" && "text-right"
//                                         )}
//                                     >
//                                         {col.field ? (
//                                             <SortableHeader
//                                                 label={col.label}
//                                                 field={col.field}
//                                                 currentSort={sortConfig}
//                                                 onSort={handleSort}
//                                             />
//                                         ) : (
//                                             col.label
//                                         )}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-zinc-100">
//                             {paginatedData.map((order) => (
//                                 <tr
//                                     key={order.id}
//                                     className={cn(
//                                         "cursor-pointer transition-colors relative group",
//                                         selectedOrders.has(order.id)
//                                             ? "bg-blue-50"
//                                             : "hover:bg-zinc-50/70"
//                                     )}
//                                     onClick={() => setOpenMenuId(null)}
//                                 >
//                                     {/* Checkbox */}
//                                     <td className="px-4 py-3">
//                                         <button
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 handleSelectOrder(order.id);
//                                             }}
//                                             className={cn(
//                                                 "p-0.5 rounded transition-colors",
//                                                 selectedOrders.has(order.id)
//                                                     ? "text-[#5B5FEF]"
//                                                     : "text-zinc-300 group-hover:text-zinc-400"
//                                             )}
//                                         >
//                                             {selectedOrders.has(order.id) ? (
//                                                 <CheckSquare className="w-3.5 h-3.5" />
//                                             ) : (
//                                                 <Square className="w-3.5 h-3.5" />
//                                             )}
//                                         </button>
//                                     </td>

//                                     {/* Order ID */}
//                                     <td className="px-6 py-3">
//                                         <span className="text-[13px] font-semibold text-[#5B5FEF]">
//                                             {order.id}
//                                         </span>
//                                     </td>

//                                     {/* Customer */}
//                                     <td className="px-6 py-3">
//                                         <div>
//                                             <p className="text-[13px] font-medium text-zinc-900">
//                                                 {order.customer}
//                                             </p>
//                                             <p className="text-[12px] text-zinc-400">
//                                                 {order.customerId}
//                                             </p>
//                                         </div>
//                                     </td>

//                                     {/* Date */}
//                                     <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
//                                         {formatDate(order.date)}
//                                     </td>

//                                     {/* Shipment date */}
//                                     <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
//                                         {formatDate(order.shipmentDate)}
//                                     </td>

//                                     {/* Status */}
//                                     <td className="px-6 py-3">
//                                         <StatusBadge status={order.status} />
//                                     </td>

//                                     {/* Items */}
//                                     <td className="px-6 py-3 text-[13px] text-zinc-600 tabular-nums">
//                                         {order.items}
//                                     </td>

//                                     {/* Amount */}
//                                     <td className="px-6 py-3 font-mono text-[13px] font-medium text-zinc-900 tabular-nums whitespace-nowrap">
//                                         {formatCurrency(order.amount)}
//                                     </td>

//                                     {/* Trend */}
//                                     <td className="px-6 py-3">
//                                         <TrendBadge data={order.trend} />
//                                     </td>

//                                     {/* Actions */}
//                                     <td
//                                         className="px-6 py-3 text-right relative"
//                                         onClick={(e) => e.stopPropagation()}
//                                     >
//                                         <button
//                                             onClick={() =>
//                                                 setOpenMenuId(
//                                                     openMenuId === order.id ? null : order.id
//                                                 )
//                                             }
//                                             className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
//                                         >
//                                             <MoreHorizontal className="w-4 h-4" />
//                                         </button>

//                                         {openMenuId === order.id && (
//                                             <div className="absolute right-6 top-10 z-10 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 w-48">
//                                                 {order.status === "Draft" && (
//                                                     <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
//                                                         <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
//                                                         Mark as Confirmed
//                                                     </button>
//                                                 )}
//                                                 {order.status === "Confirmed" && (
//                                                     <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
//                                                         <Truck className="w-3.5 h-3.5 text-purple-500" />
//                                                         Mark as Shipped
//                                                     </button>
//                                                 )}
//                                                 {order.status === "Shipped" && (
//                                                     <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
//                                                         <Receipt className="w-3.5 h-3.5 text-emerald-500" />
//                                                         Convert to Invoice
//                                                     </button>
//                                                 )}
//                                                 <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
//                                                     <FileText className="w-3.5 h-3.5 text-zinc-400" />
//                                                     Edit Order
//                                                 </button>
//                                                 {order.status !== "Cancelled" &&
//                                                     order.status !== "Invoiced" && (
//                                                         <button className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2">
//                                                             <XCircle className="w-3.5 h-3.5" />
//                                                             Cancel Order
//                                                         </button>
//                                                     )}
//                                             </div>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ))}

//                             {sorted.length === 0 && (
//                                 <tr>
//                                     <td
//                                         colSpan={9}
//                                         className="px-6 py-12 text-center"
//                                     >
//                                         <p className="text-[13px] text-zinc-400">
//                                             No orders match your filters.
//                                         </p>
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>

//                     {/* Pagination */}
//                     {totalPages > 1 && (
//                         <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
//                             <span className="text-[12px] text-zinc-500">
//                                 Showing {startIdx + 1}-
//                                 {Math.min(startIdx + itemsPerPage, sorted.length)} of{" "}
//                                 {sorted.length}
//                             </span>
//                             <div className="flex items-center gap-2">
//                                 <button
//                                     onClick={() =>
//                                         setCurrentPage(Math.max(1, currentPage - 1))
//                                     }
//                                     disabled={currentPage === 1}
//                                     className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                                 >
//                                     <ChevronLeft className="w-4 h-4" />
//                                 </button>
//                                 <span className="text-[12px] text-zinc-600">
//                                     Page {currentPage} of {totalPages}
//                                 </span>
//                                 <button
//                                     onClick={() =>
//                                         setCurrentPage(
//                                             Math.min(totalPages, currentPage + 1)
//                                         )
//                                     }
//                                     disabled={currentPage === totalPages}
//                                     className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                                 >
//                                     <ChevronRight className="w-4 h-4" />
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }


"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
    Search,
    Plus,
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Truck,
    Receipt,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    CheckSquare,
    Square,
    AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type OrderStatus = "Draft" | "Confirmed" | "Shipped" | "Invoiced" | "Cancelled";
type SortField = "id" | "customer" | "date" | "amount" | "status";
type SortOrder = "asc" | "desc";

interface SalesOrder {
    id: number;
    orderNumber: string;
    customer: string;
    clientId: number;
    date: string;
    shipmentDate: string | null;
    status: OrderStatus;
    amount: number;
    items: number;
}

const API_BASE = "http://localhost:8888/api/sales-orders";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const statusConfig: Record<
    OrderStatus,
    { bg: string; text: string; dot: string; icon: React.ReactNode }
> = {
    Draft: { bg: "bg-zinc-100", text: "text-zinc-600", dot: "bg-zinc-400", icon: <Clock className="w-3 h-3" /> },
    Confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", icon: <CheckCircle2 className="w-3 h-3" /> },
    Shipped: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", icon: <Truck className="w-3 h-3" /> },
    Invoiced: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", icon: <Receipt className="w-3 h-3" /> },
    Cancelled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400", icon: <XCircle className="w-3 h-3" /> },
};

const statuses: OrderStatus[] = ["Draft", "Confirmed", "Shipped", "Invoiced", "Cancelled"];

const sortFieldToBackend: Record<SortField, string> = {
    id: "id",
    customer: "customer",
    date: "date",
    amount: "amount",
    status: "status",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return { Authorization: `Bearer ${token}` };
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatCurrency(amount: number) {
    return `₹${amount.toLocaleString("en-IN")}`;
}

function useDebouncedValue<T>(value: T, delayMs: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const handle = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(handle);
    }, [value, delayMs]);
    return debounced;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-zinc-500 flex items-center gap-1.5">
                    {icon}
                    {label}
                </span>
            </div>
            <span className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">
                {value}
            </span>
        </div>
    );
}

function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = statusConfig[status];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
                cfg.bg,
                cfg.text
            )}
        >
            {cfg.icon}
            {status}
        </span>
    );
}

function SortableHeader({
    label,
    field,
    currentSort,
    onSort,
}: {
    label: string;
    field: SortField;
    currentSort: { field: SortField; order: SortOrder } | null;
    onSort: (field: SortField) => void;
}) {
    const isActive = currentSort?.field === field;
    const isAsc = currentSort?.order === "asc";

    return (
        <button
            onClick={() => onSort(field)}
            className="flex items-center gap-1 hover:text-zinc-600 transition-colors"
        >
            {label}
            {isActive && (
                <span className="text-[#5B5FEF]">
                    {isAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
            )}
        </button>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SalesOrders() {
    const router = useRouter();

    const [orders, setOrders] = useState<SalesOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [searchInput, setSearchInput] = useState("");
    const debouncedSearch = useDebouncedValue(searchInput, 400);

    const [selectedStatus, setSelectedStatus] = useState<"All" | OrderStatus>("All");
    const [dateRangeStart, setDateRangeStart] = useState("");
    const [dateRangeEnd, setDateRangeEnd] = useState("");
    const [amountRangeMin, setAmountRangeMin] = useState("");
    const [amountRangeMax, setAmountRangeMax] = useState("");

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

    const [sortConfig, setSortConfig] = useState<{ field: SortField; order: SortOrder } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 10;

    const [statTotals, setStatTotals] = useState({
        total: 0,
        confirmed: 0,
        shipped: 0,
        totalValue: 0,
    });

    const exportingRef = useRef(false);

    const buildParams = useCallback(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("limit", String(itemsPerPage));
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (selectedStatus !== "All") params.set("status", selectedStatus);
        if (dateRangeStart) params.set("dateFrom", dateRangeStart);
        if (dateRangeEnd) params.set("dateTo", dateRangeEnd);
        if (amountRangeMin) params.set("amountMin", amountRangeMin);
        if (amountRangeMax) params.set("amountMax", amountRangeMax);
        if (sortConfig) {
            params.set("sortBy", sortFieldToBackend[sortConfig.field]);
            params.set("sortOrder", sortConfig.order.toUpperCase());
        }
        return params;
    }, [currentPage, debouncedSearch, selectedStatus, dateRangeStart, dateRangeEnd, amountRangeMin, amountRangeMax, sortConfig]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const params = buildParams();
            const res = await fetch(`${API_BASE}?${params.toString()}`, {
                headers: authHeaders(),
            });
            const data = await res.json();

            if (data.success) {
                const mapped: SalesOrder[] = data.data.map((row: any) => ({
                    id: row.id,
                    orderNumber: row.order_number,
                    customer: row.customer || row.client_name || "—",
                    clientId: row.client_id,
                    date: row.date,
                    shipmentDate: row.shipment_date,
                    status: row.status,
                    amount: parseFloat(row.amount || "0"),
                    items: parseInt(row.items_count || "0", 10),
                }));
                setOrders(mapped);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotalCount(data.pagination?.total || mapped.length);
            } else {
                setLoadError(data.message || "Failed to load sales orders.");
            }
        } catch (err) {
            console.error("Failed to fetch sales orders:", err);
            setLoadError("Could not reach the server. Check the backend is running.");
        } finally {
            setLoading(false);
        }
    }, [buildParams]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedStatus, dateRangeStart, dateRangeEnd, amountRangeMin, amountRangeMax, sortConfig]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_BASE}?limit=100&page=1`, {
                    headers: authHeaders(),
                });
                const data = await res.json();
                if (data.success) {
                    const rows = data.data as any[];
                    setStatTotals({
                        total: data.pagination?.total ?? rows.length,
                        confirmed: rows.filter((r) => r.status === "Confirmed").length,
                        shipped: rows.filter((r) => r.status === "Shipped").length,
                        totalValue: rows.reduce((s, r) => s + parseFloat(r.amount || "0"), 0),
                    });
                }
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            }
        };
        fetchStats();
    }, [orders]);

    const handleSort = (field: SortField) => {
        if (sortConfig?.field === field) {
            setSortConfig({ field, order: sortConfig.order === "asc" ? "desc" : "asc" });
        } else {
            setSortConfig({ field, order: "asc" });
        }
    };

    const handleSelectAll = () => {
        if (selectedOrders.size === orders.length && orders.length > 0) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(orders.map((o) => o.id)));
        }
    };

    const handleSelectOrder = (id: number) => {
        const next = new Set(selectedOrders);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedOrders(next);
    };

    const updateStatus = async (ids: number[], status: OrderStatus) => {
        try {
            const res = await fetch(`${API_BASE}/bulk-status`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ ids, status }),
            });
            const data = await res.json();
            if (data.success) {
                setSelectedOrders(new Set());
                setOpenMenuId(null);
                fetchOrders();
            } else {
                alert("Failed to update status: " + data.message);
            }
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Error updating status. Check the backend is running.");
        }
    };

    const handleExportCSV = async () => {
        if (exportingRef.current) return;
        exportingRef.current = true;
        try {
            const params = buildParams();
            params.delete("page");
            params.delete("limit");
            const res = await fetch(`${API_BASE}/export?${params.toString()}`, {
                headers: authHeaders(),
            });
            if (!res.ok) {
                alert("Failed to export CSV.");
                return;
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `sales-orders-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to export CSV:", err);
            alert("Error exporting CSV. Check the backend is running.");
        } finally {
            exportingRef.current = false;
        }
    };

    const hasActiveFilters =
        searchInput || selectedStatus !== "All" || dateRangeStart || dateRangeEnd || amountRangeMin || amountRangeMax;

    const clearFilters = () => {
        setSearchInput("");
        setSelectedStatus("All");
        setDateRangeStart("");
        setDateRangeEnd("");
        setAmountRangeMin("");
        setAmountRangeMax("");
        setCurrentPage(1);
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
                            Sales Orders
                        </h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            Track orders from confirmation to invoicing
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/sales-orders/new")}
                        className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Sales Order
                    </button>
                </div>

                {loadError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg px-4 py-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {loadError}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Orders"
                        value={String(statTotals.total)}
                        icon={<FileText className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                    <StatCard
                        label="Confirmed"
                        value={String(statTotals.confirmed)}
                        icon={<CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                    <StatCard
                        label="Shipped"
                        value={String(statTotals.shipped)}
                        icon={<Truck className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                    <StatCard
                        label="Total Value"
                        value={formatCurrency(Math.round(statTotals.totalValue))}
                        icon={<Receipt className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                </div>

                {/* Bulk action toolbar */}
                {selectedOrders.size > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-[13px] font-medium text-blue-700">
                                {selectedOrders.size} order{selectedOrders.size !== 1 ? "s" : ""} selected
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateStatus(Array.from(selectedOrders), "Confirmed")}
                                className="px-3 py-1.5 text-[13px] font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                Mark Confirmed
                            </button>
                            <button
                                onClick={() => updateStatus(Array.from(selectedOrders), "Shipped")}
                                className="px-3 py-1.5 text-[13px] font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                Mark Shipped
                            </button>
                            <button
                                onClick={() => setSelectedOrders(new Set())}
                                className="px-3 py-1.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Table section */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Table header controls */}
                    <div className="px-6 py-4 border-b border-zinc-100 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-[14px] font-semibold text-zinc-900">Order List</h2>
                                <p className="text-[12px] text-zinc-500">
                                    {totalCount} order{totalCount !== 1 ? "s" : ""} {hasActiveFilters && "(filtered)"}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Search */}
                                <div className="relative w-56">
                                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                    />
                                </div>

                                {/* Status filter */}
                                <div className="relative">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value as "All" | OrderStatus)}
                                        className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                    >
                                        <option value="All">All Status</option>
                                        {statuses.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                {/* Advanced filters toggle */}
                                <button
                                    onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                                    className={cn(
                                        "p-1.5 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors",
                                        showAdvancedFilter ? "bg-[#5B5FEF] text-white" : "text-zinc-600 hover:bg-zinc-100"
                                    )}
                                >
                                    <Filter className="w-4 h-4" />
                                    Filters
                                </button>

                                {/* Export */}
                                <button
                                    onClick={handleExportCSV}
                                    className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
                                    title="Export to CSV"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Advanced filters panel */}
                        {showAdvancedFilter && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-100">
                                <div>
                                    <label className="text-[12px] font-medium text-zinc-600 block mb-1">Date From</label>
                                    <input
                                        type="date"
                                        value={dateRangeStart}
                                        onChange={(e) => setDateRangeStart(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[12px] font-medium text-zinc-600 block mb-1">Date To</label>
                                    <input
                                        type="date"
                                        value={dateRangeEnd}
                                        onChange={(e) => setDateRangeEnd(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[12px] font-medium text-zinc-600 block mb-1">Amount Min</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={amountRangeMin}
                                        onChange={(e) => setAmountRangeMin(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[12px] font-medium text-zinc-600 block mb-1">Amount Max</label>
                                    <input
                                        type="number"
                                        placeholder="999999"
                                        value={amountRangeMax}
                                        onChange={(e) => setAmountRangeMax(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                    />
                                </div>
                                {hasActiveFilters && (
                                    <div className="sm:col-span-4 flex gap-2">
                                        <button
                                            onClick={clearFilters}
                                            className="px-2.5 py-1.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                <th className="px-4 py-2.5">
                                    <button
                                        onClick={handleSelectAll}
                                        className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 transition-colors"
                                    >
                                        {selectedOrders.size === orders.length && orders.length > 0 ? (
                                            <CheckSquare className="w-3.5 h-3.5 text-[#5B5FEF]" />
                                        ) : (
                                            <Square className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </th>
                                {[
                                    { label: "Order", field: "id" as const },
                                    { label: "Customer", field: "customer" as const },
                                    { label: "Date", field: "date" as const },
                                    { label: "Shipment Date", field: null as any },
                                    { label: "Status", field: "status" as const },
                                    { label: "Items", field: null as any },
                                    { label: "Amount", field: "amount" as const },
                                    { label: "", field: null as any },
                                ].map((col) => (
                                    <th
                                        key={col.label || "actions"}
                                        className={cn(
                                            "px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap",
                                            col.label === "" && "text-right"
                                        )}
                                    >
                                        {col.field ? (
                                            <SortableHeader
                                                label={col.label}
                                                field={col.field}
                                                currentSort={sortConfig}
                                                onSort={handleSort}
                                            />
                                        ) : (
                                            col.label
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <p className="text-[13px] text-zinc-400">Loading orders…</p>
                                    </td>
                                </tr>
                            )}

                            {!loading && orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className={cn(
                                        "cursor-pointer transition-colors relative group",
                                        selectedOrders.has(order.id) ? "bg-blue-50" : "hover:bg-zinc-50/70"
                                    )}
                                    onClick={() => setOpenMenuId(null)}
                                >
                                    {/* Checkbox */}
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectOrder(order.id);
                                            }}
                                            className={cn(
                                                "p-0.5 rounded transition-colors",
                                                selectedOrders.has(order.id) ? "text-[#5B5FEF]" : "text-zinc-300 group-hover:text-zinc-400"
                                            )}
                                        >
                                            {selectedOrders.has(order.id) ? (
                                                <CheckSquare className="w-3.5 h-3.5" />
                                            ) : (
                                                <Square className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </td>

                                    {/* Order ID */}
                                    <td className="px-6 py-3">
                                        <span className="text-[13px] font-semibold text-[#5B5FEF]">
                                            {order.orderNumber}
                                        </span>
                                    </td>

                                    {/* Customer */}
                                    <td className="px-6 py-3">
                                        <p className="text-[13px] font-medium text-zinc-900">{order.customer}</p>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
                                        {formatDate(order.date)}
                                    </td>

                                    {/* Shipment date */}
                                    <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
                                        {formatDate(order.shipmentDate)}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-3">
                                        <StatusBadge status={order.status} />
                                    </td>

                                    {/* Items */}
                                    <td className="px-6 py-3 text-[13px] text-zinc-600 tabular-nums">
                                        {order.items}
                                    </td>

                                    {/* Amount */}
                                    <td className="px-6 py-3 font-mono text-[13px] font-medium text-zinc-900 tabular-nums whitespace-nowrap">
                                        {formatCurrency(order.amount)}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-3 text-right relative" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        {openMenuId === order.id && (
                                            <div className="absolute right-6 top-10 z-10 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 w-48">
                                                {order.status === "Draft" && (
                                                    <button
                                                        onClick={() => updateStatus([order.id], "Confirmed")}
                                                        className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                                                        Mark as Confirmed
                                                    </button>
                                                )}
                                                {order.status === "Confirmed" && (
                                                    <button
                                                        onClick={() => updateStatus([order.id], "Shipped")}
                                                        className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                                                    >
                                                        <Truck className="w-3.5 h-3.5 text-purple-500" />
                                                        Mark as Shipped
                                                    </button>
                                                )}
                                                {order.status === "Shipped" && (
                                                    <button
                                                        onClick={() => updateStatus([order.id], "Invoiced")}
                                                        className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                                                    >
                                                        <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                                                        Convert to Invoice
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => router.push(`/sales-orders/${order.id}`)}
                                                    className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                                                >
                                                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                                    Edit Order
                                                </button>
                                                {order.status !== "Cancelled" && order.status !== "Invoiced" && (
                                                    <button
                                                        onClick={() => updateStatus([order.id], "Cancelled")}
                                                        className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Cancel Order
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {!loading && orders.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <p className="text-[13px] text-zinc-400">No orders match your filters.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
                            <span className="text-[12px] text-zinc-500">
                                Page {currentPage} of {totalPages} · {totalCount} total
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-[12px] text-zinc-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
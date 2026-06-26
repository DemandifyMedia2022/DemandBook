"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
    Search,
    Plus,
    ChevronDown,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Receipt,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type OrderStatus = "Draft" | "Confirmed" | "Invoiced" | "Cancelled";

interface SalesOrder {
    id: string;
    customer: string;
    customerId: string;
    date: string;
    shipmentDate: string;
    status: OrderStatus;
    amount: number;
    items: number;
    trend: number[];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialOrders: SalesOrder[] = [
    {
        id: "SO-1042",
        customer: "Acme Solutions",
        customerId: "CUST-4092",
        date: "2025-06-18",
        shipmentDate: "2025-06-25",
        status: "Confirmed",
        amount: 48500,
        items: 6,
        trend: [30000, 35000, 38000, 42000, 44000, 46000, 47000, 48500],
    },
    {
        id: "SO-1041",
        customer: "Eco Stream Logistics",
        customerId: "CUST-8210",
        date: "2025-06-17",
        shipmentDate: "2025-06-24",
        status: "Invoiced",
        amount: 12200,
        items: 3,
        trend: [8000, 9000, 9500, 10000, 10800, 11200, 11800, 12200],
    },
    {
        id: "SO-1040",
        customer: "FlexTech Systems",
        customerId: "CUST-6390",
        date: "2025-06-16",
        shipmentDate: "2025-06-23",
        status: "Draft",
        amount: 6750,
        items: 4,
        trend: [4000, 4500, 5000, 5500, 6000, 6200, 6500, 6750],
    },
    {
        id: "SO-1039",
        customer: "Blue Tier Tech",
        customerId: "CUST-3912",
        date: "2025-06-15",
        shipmentDate: "2025-06-22",
        status: "Cancelled",
        amount: 3300,
        items: 2,
        trend: [3300, 3300, 3300, 3300, 3300, 3300, 3300, 3300],
    },
    {
        id: "SO-1038",
        customer: "Digital Wave Inc",
        customerId: "CUST-5512",
        date: "2025-06-14",
        shipmentDate: "2025-06-21",
        status: "Invoiced",
        amount: 91000,
        items: 11,
        trend: [60000, 65000, 70000, 75000, 80000, 85000, 88000, 91000],
    },
    {
        id: "SO-1037",
        customer: "Acme Solutions",
        customerId: "CUST-4092",
        date: "2025-06-13",
        shipmentDate: "2025-06-20",
        status: "Confirmed",
        amount: 22400,
        items: 5,
        trend: [15000, 16000, 17500, 19000, 20000, 21000, 21800, 22400],
    },
    {
        id: "SO-1036",
        customer: "Cloud Harbor",
        customerId: "CUST-2844",
        date: "2025-06-11",
        shipmentDate: "2025-06-18",
        status: "Draft",
        amount: 5100,
        items: 3,
        trend: [3000, 3500, 4000, 4200, 4500, 4700, 4900, 5100],
    },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const statusConfig: Record<
    OrderStatus,
    { bg: string; text: string; dot: string; icon: React.ReactNode }
> = {
    Draft: {
        bg: "bg-zinc-100",
        text: "text-zinc-600",
        dot: "bg-zinc-400",
        icon: <Clock className="w-3 h-3" />,
    },
    Confirmed: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        dot: "bg-blue-500",
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    Invoiced: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        icon: <Receipt className="w-3 h-3" />,
    },
    Cancelled: {
        bg: "bg-red-50",
        text: "text-red-600",
        dot: "bg-red-400",
        icon: <XCircle className="w-3 h-3" />,
    },
};

const statuses: OrderStatus[] = ["Draft", "Confirmed", "Invoiced", "Cancelled"];

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
function TrendBadge({ data }: { data: number[] }) {
    const start = data[0];
    const end = data[data.length - 1];
    const pct = ((end - start) / start) * 100;
    const positive = pct >= 0;

    return (
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
            {Math.abs(pct).toFixed(1)}%
        </span>
    );
}

function StatCard({
    label,
    value,
    delta,
    icon,
}: {
    label: string;
    value: string;
    delta?: number;
    icon?: React.ReactNode;
}) {
    const positive = delta !== undefined && delta >= 0;

    return (
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-zinc-500 flex items-center gap-1.5">
                    {icon}
                    {label}
                </span>
                {delta !== undefined && (
                    <span
                        className={cn(
                            "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
                            positive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
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

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SalesOrders() {
    const router = useRouter();
    const [orders] = useState<SalesOrder[]>(initialOrders);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<"All" | OrderStatus>(
        "All"
    );
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const filtered = orders.filter((o) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            o.id.toLowerCase().includes(q) ||
            o.customer.toLowerCase().includes(q);
        const matchesStatus =
            selectedStatus === "All" || o.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const totalAmount = orders.reduce((s, o) => s + o.amount, 0);
    const draftCount = orders.filter((o) => o.status === "Draft").length;
    const confirmedCount = orders.filter((o) => o.status === "Confirmed").length;
    const invoicedCount = orders.filter((o) => o.status === "Invoiced").length;

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
                            Sales Orders
                        </h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            Track and manage customer orders end-to-end
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

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Orders"
                        value={String(orders.length)}
                        delta={9.3}
                        icon={<FileText className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                    <StatCard
                        label="Draft"
                        value={String(draftCount)}
                        icon={<Clock className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                    <StatCard
                        label="Confirmed"
                        value={String(confirmedCount)}
                        delta={4.1}
                        icon={<CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                    <StatCard
                        label="Total Value"
                        value={`₹${totalAmount.toLocaleString("en-IN")}`}
                        delta={11.6}
                        icon={<Receipt className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                </div>

                {/* Table section */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Table header controls */}
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">
                                Order List
                            </h2>
                            <p className="text-[12px] text-zinc-500">
                                {filtered.length} order{filtered.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="relative w-56">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Status filter */}
                            <div className="relative">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value as "All" | OrderStatus)
                                    }
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="All">All Status</option>
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
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
                                    "Order",
                                    "Customer",
                                    "Date",
                                    "Shipment Date",
                                    "Status",
                                    "Items",
                                    "Amount",
                                    "Trend",
                                    "",
                                ].map((col) => (
                                    <th
                                        key={col}
                                        className={cn(
                                            "px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap",
                                            col === "" && "text-right"
                                        )}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.map((order) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-zinc-50/70 transition-colors cursor-pointer relative"
                                    onClick={() => setOpenMenuId(null)}
                                >
                                    {/* Order ID */}
                                    <td className="px-6 py-3">
                                        <span className="text-[13px] font-semibold text-[#5B5FEF]">
                                            {order.id}
                                        </span>
                                    </td>

                                    {/* Customer */}
                                    <td className="px-6 py-3">
                                        <div>
                                            <p className="text-[13px] font-medium text-zinc-900">
                                                {order.customer}
                                            </p>
                                            <p className="text-[12px] text-zinc-400">
                                                {order.customerId}
                                            </p>
                                        </div>
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
                                        ₹{order.amount.toLocaleString("en-IN")}
                                    </td>

                                    {/* Trend */}
                                    <td className="px-6 py-3">
                                        <TrendBadge data={order.trend} />
                                    </td>

                                    {/* Actions */}
                                    <td
                                        className="px-6 py-3 text-right relative"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() =>
                                                setOpenMenuId(
                                                    openMenuId === order.id ? null : order.id
                                                )
                                            }
                                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        {openMenuId === order.id && (
                                            <div className="absolute right-6 top-10 z-10 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 w-48">
                                                {order.status === "Draft" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                                                        Mark as Confirmed
                                                    </button>
                                                )}
                                                {order.status === "Confirmed" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                        <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                                                        Convert to Invoice
                                                    </button>
                                                )}
                                                <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                                    Edit Order
                                                </button>
                                                {order.status !== "Cancelled" &&
                                                    order.status !== "Invoiced" && (
                                                        <button className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            Cancel Order
                                                        </button>
                                                    )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <p className="text-[13px] text-zinc-400">
                                            No orders match your filters.
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
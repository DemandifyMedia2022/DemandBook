"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

import {
    Search,
    Plus,
    ChevronDown,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    Truck,
    PackageCheck,
    XCircle,
    FileText,
    Receipt,
    Clock,
    Package,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ChallanStatus = "Draft" | "Open" | "Delivered" | "Cancelled";

interface DeliveryChallan {
    id: string;
    customer: string;
    customerId: string;
    salesOrderId: string | null;
    date: string;
    deliveryDate: string;
    status: ChallanStatus;
    amount: number;
    quantity: number;
    trend: number[];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialChallans: DeliveryChallan[] = [
    {
        id: "DC-0031",
        customer: "Acme Solutions",
        customerId: "CUST-4092",
        salesOrderId: "SO-1042",
        date: "2025-06-18",
        deliveryDate: "2025-06-25",
        status: "Open",
        amount: 48500,
        quantity: 12,
        trend: [30000, 35000, 38000, 42000, 44000, 46000, 47000, 48500],
    },
    {
        id: "DC-0030",
        customer: "Eco Stream Logistics",
        customerId: "CUST-8210",
        salesOrderId: "SO-1041",
        date: "2025-06-17",
        deliveryDate: "2025-06-22",
        status: "Delivered",
        amount: 12200,
        quantity: 5,
        trend: [8000, 9000, 9500, 10000, 10800, 11200, 11800, 12200],
    },
    {
        id: "DC-0029",
        customer: "FlexTech Systems",
        customerId: "CUST-6390",
        salesOrderId: "SO-1040",
        date: "2025-06-16",
        deliveryDate: "2025-06-23",
        status: "Draft",
        amount: 6750,
        quantity: 8,
        trend: [4000, 4500, 5000, 5500, 6000, 6200, 6500, 6750],
    },
    {
        id: "DC-0028",
        customer: "Digital Wave Inc",
        customerId: "CUST-5512",
        salesOrderId: "SO-1038",
        date: "2025-06-14",
        deliveryDate: "2025-06-20",
        status: "Delivered",
        amount: 91000,
        quantity: 22,
        trend: [60000, 65000, 70000, 75000, 80000, 85000, 88000, 91000],
    },
    {
        id: "DC-0027",
        customer: "Blue Tier Tech",
        customerId: "CUST-3912",
        salesOrderId: "SO-1039",
        date: "2025-06-13",
        deliveryDate: "2025-06-19",
        status: "Cancelled",
        amount: 3300,
        quantity: 4,
        trend: [3300, 3300, 3300, 3300, 3300, 3300, 3300, 3300],
    },
    {
        id: "DC-0026",
        customer: "Acme Solutions",
        customerId: "CUST-4092",
        salesOrderId: "SO-1037",
        date: "2025-06-12",
        deliveryDate: "2025-06-18",
        status: "Delivered",
        amount: 22400,
        quantity: 9,
        trend: [15000, 16000, 17500, 19000, 20000, 21000, 21800, 22400],
    },
    {
        id: "DC-0025",
        customer: "Cloud Harbor",
        customerId: "CUST-2844",
        salesOrderId: null,
        date: "2025-06-11",
        deliveryDate: "2025-06-17",
        status: "Open",
        amount: 5100,
        quantity: 6,
        trend: [3000, 3500, 4000, 4200, 4500, 4700, 4900, 5100],
    },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const statusConfig: Record<
    ChallanStatus,
    { bg: string; text: string; icon: React.ReactNode }
> = {
    Draft: {
        bg: "bg-zinc-100",
        text: "text-zinc-600",
        icon: <Clock className="w-3 h-3" />,
    },
    Open: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: <Truck className="w-3 h-3" />,
    },
    Delivered: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <PackageCheck className="w-3 h-3" />,
    },
    Cancelled: {
        bg: "bg-red-50",
        text: "text-red-600",
        icon: <XCircle className="w-3 h-3" />,
    },
};

const statuses: ChallanStatus[] = ["Draft", "Open", "Delivered", "Cancelled"];

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

function StatusBadge({ status }: { status: ChallanStatus }) {
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
export default function DeliveryChallans() {
    const router = useRouter();
    const [challans] = useState<DeliveryChallan[]>(initialChallans);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<"All" | ChallanStatus>("All");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const filtered = challans.filter((c) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            c.id.toLowerCase().includes(q) ||
            c.customer.toLowerCase().includes(q) ||
            (c.salesOrderId?.toLowerCase() ?? "").includes(q);
        const matchesStatus =
            selectedStatus === "All" || c.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const openCount = challans.filter((c) => c.status === "Open").length;
    const deliveredCount = challans.filter((c) => c.status === "Delivered").length;
    const draftCount = challans.filter((c) => c.status === "Draft").length;
    const totalQty = challans.reduce((s, c) => s + c.quantity, 0);

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
                            Delivery Challans
                        </h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            Track dispatch documents and goods movement
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/delivery-challans/new")}
                        className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        New Challan
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Draft"
                        value={String(draftCount)}
                        icon={<Clock className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                    <StatCard
                        label="Open"
                        value={String(openCount)}
                        delta={3.8}
                        icon={<Truck className="w-3.5 h-3.5 text-blue-500" />}
                    />
                    <StatCard
                        label="Delivered"
                        value={String(deliveredCount)}
                        delta={7.2}
                        icon={<PackageCheck className="w-3.5 h-3.5 text-emerald-500" />}
                    />
                    <StatCard
                        label="Total Qty Dispatched"
                        value={String(totalQty)}
                        delta={5.1}
                        icon={<Package className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                </div>

                {/* Table section */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Controls */}
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">
                                Challan List
                            </h2>
                            <p className="text-[12px] text-zinc-500">
                                {filtered.length} challan{filtered.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="relative w-56">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search challans..."
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
                                        setSelectedStatus(e.target.value as "All" | ChallanStatus)
                                    }
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="All">All Status</option>
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>{s}</option>
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
                                    "Challan",
                                    "Customer",
                                    "Sales Order",
                                    "Date",
                                    "Delivery Date",
                                    "Status",
                                    "Qty",
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
                            {filtered.map((challan) => (
                                <tr
                                    key={challan.id}
                                    className="hover:bg-zinc-50/70 transition-colors cursor-pointer"
                                    onClick={() => setOpenMenuId(null)}
                                >
                                    {/* Challan ID */}
                                    <td className="px-6 py-3">
                                        <span className="text-[13px] font-semibold text-[#5B5FEF]">
                                            {challan.id}
                                        </span>
                                    </td>

                                    {/* Customer */}
                                    <td className="px-6 py-3">
                                        <div>
                                            <p className="text-[13px] font-medium text-zinc-900">
                                                {challan.customer}
                                            </p>
                                            <p className="text-[12px] text-zinc-400">
                                                {challan.customerId}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Sales Order */}
                                    <td className="px-6 py-3">
                                        {challan.salesOrderId ? (
                                            <span className="text-[12px] font-medium text-[#5B5FEF] bg-indigo-50 px-2 py-0.5 rounded-full">
                                                {challan.salesOrderId}
                                            </span>
                                        ) : (
                                            <span className="text-[12px] text-zinc-400 italic">Standalone</span>
                                        )}
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
                                        {formatDate(challan.date)}
                                    </td>

                                    {/* Delivery Date */}
                                    <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
                                        {formatDate(challan.deliveryDate)}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-3">
                                        <StatusBadge status={challan.status} />
                                    </td>

                                    {/* Quantity */}
                                    <td className="px-6 py-3 text-[13px] text-zinc-600 tabular-nums">
                                        {challan.quantity} units
                                    </td>

                                    {/* Amount */}
                                    <td className="px-6 py-3 font-mono text-[13px] font-medium text-zinc-900 tabular-nums whitespace-nowrap">
                                        ₹{challan.amount.toLocaleString("en-IN")}
                                    </td>

                                    {/* Trend */}
                                    <td className="px-6 py-3">
                                        <TrendBadge data={challan.trend} />
                                    </td>

                                    {/* Actions */}
                                    <td
                                        className="px-6 py-3 text-right relative"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() =>
                                                setOpenMenuId(
                                                    openMenuId === challan.id ? null : challan.id
                                                )
                                            }
                                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        {openMenuId === challan.id && (
                                            <div className="absolute right-6 top-10 z-10 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 w-52">
                                                {challan.status === "Draft" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                        <Truck className="w-3.5 h-3.5 text-blue-500" />
                                                        Mark as Open
                                                    </button>
                                                )}
                                                {challan.status === "Open" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                        <PackageCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                        Mark as Delivered
                                                    </button>
                                                )}
                                                {challan.status === "Delivered" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                        <Receipt className="w-3.5 h-3.5 text-[#5B5FEF]" />
                                                        Convert to Invoice
                                                    </button>
                                                )}
                                                <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                                    Edit Challan
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                                    Download PDF
                                                </button>
                                                {challan.status !== "Delivered" &&
                                                    challan.status !== "Cancelled" && (
                                                        <button className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            Cancel Challan
                                                        </button>
                                                    )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center">
                                        <p className="text-[13px] text-zinc-400">
                                            No challans match your filters.
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
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

import {
    Search,
    Plus,
    ChevronDown,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    PauseCircle,
    PlayCircle,
    Trash2,
    FileText,
    Send,
    Calendar,
    Repeat,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type RecurringStatus = "Active" | "On Hold" | "Expired";
type Frequency = "Daily" | "Weekly" | "Monthly" | "Yearly";

interface RecurringInvoice {
    id: string;
    profileName: string;
    customer: string;
    customerId: string;
    frequency: Frequency;
    nextInvoiceDate: string;
    endDate: string | null; // null = Never
    status: RecurringStatus;
    amount: number;
    childCount: number; // how many invoices generated so far
    trend: number[];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialProfiles: RecurringInvoice[] = [
    {
        id: "REC-0011",
        profileName: "Monthly SaaS License",
        customer: "Acme Solutions",
        customerId: "CUST-4092",
        frequency: "Monthly",
        nextInvoiceDate: "2025-07-01",
        endDate: null,
        status: "Active",
        amount: 12000,
        childCount: 8,
        trend: [8000, 9000, 9500, 10000, 10500, 11000, 11500, 12000],
    },
    {
        id: "REC-0010",
        profileName: "Annual Support Contract",
        customer: "Eco Stream Logistics",
        customerId: "CUST-8210",
        frequency: "Yearly",
        nextInvoiceDate: "2026-01-15",
        endDate: "2028-01-15",
        status: "Active",
        amount: 85000,
        childCount: 2,
        trend: [75000, 77000, 79000, 80000, 81000, 82000, 83500, 85000],
    },
    {
        id: "REC-0009",
        profileName: "Weekly Delivery Fees",
        customer: "FlexTech Systems",
        customerId: "CUST-6390",
        frequency: "Weekly",
        nextInvoiceDate: "2025-06-23",
        endDate: "2025-12-31",
        status: "Active",
        amount: 1500,
        childCount: 24,
        trend: [1100, 1150, 1200, 1250, 1300, 1350, 1400, 1500],
    },
    {
        id: "REC-0008",
        profileName: "Quarterly Retainer",
        customer: "Blue Tier Tech",
        customerId: "CUST-3912",
        frequency: "Monthly",
        nextInvoiceDate: "2025-07-05",
        endDate: "2025-09-05",
        status: "On Hold",
        amount: 22000,
        childCount: 5,
        trend: [18000, 19000, 19500, 20000, 20500, 21000, 21500, 22000],
    },
    {
        id: "REC-0007",
        profileName: "Daily Data Sync",
        customer: "Digital Wave Inc",
        customerId: "CUST-5512",
        frequency: "Daily",
        nextInvoiceDate: "2025-06-19",
        endDate: "2025-06-30",
        status: "Active",
        amount: 400,
        childCount: 60,
        trend: [320, 330, 340, 355, 365, 375, 390, 400],
    },
    {
        id: "REC-0006",
        profileName: "Cloud Hosting Plan",
        customer: "Cloud Harbor",
        customerId: "CUST-2844",
        frequency: "Monthly",
        nextInvoiceDate: "",
        endDate: "2024-12-31",
        status: "Expired",
        amount: 9500,
        childCount: 12,
        trend: [9500, 9500, 9500, 9500, 9500, 9500, 9500, 9500],
    },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const statusConfig: Record<
    RecurringStatus,
    { bg: string; text: string; icon: React.ReactNode }
> = {
    Active: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <PlayCircle className="w-3 h-3" />,
    },
    "On Hold": {
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: <PauseCircle className="w-3 h-3" />,
    },
    Expired: {
        bg: "bg-zinc-100",
        text: "text-zinc-500",
        icon: <RefreshCw className="w-3 h-3" />,
    },
};

const frequencyConfig: Record<
    Frequency,
    { bg: string; text: string }
> = {
    Daily: { bg: "bg-purple-50", text: "text-purple-700" },
    Weekly: { bg: "bg-blue-50", text: "text-blue-700" },
    Monthly: { bg: "bg-indigo-50", text: "text-indigo-700" },
    Yearly: { bg: "bg-teal-50", text: "text-teal-700" },
};

const frequencies: Frequency[] = ["Daily", "Weekly", "Monthly", "Yearly"];
const statuses: RecurringStatus[] = ["Active", "On Hold", "Expired"];

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

function StatusBadge({ status }: { status: RecurringStatus }) {
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

function FrequencyBadge({ frequency }: { frequency: Frequency }) {
    const cfg = frequencyConfig[frequency];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded-full",
                cfg.bg,
                cfg.text
            )}
        >
            <Repeat className="w-3 h-3" />
            {frequency}
        </span>
    );
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function RecurringInvoices() {
    const [profiles] = useState<RecurringInvoice[]>(initialProfiles);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<"All" | RecurringStatus>("All");
    const [selectedFrequency, setSelectedFrequency] = useState<"All" | Frequency>("All");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const filtered = profiles.filter((p) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            p.profileName.toLowerCase().includes(q) ||
            p.customer.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q);
        const matchesStatus =
            selectedStatus === "All" || p.status === selectedStatus;
        const matchesFreq =
            selectedFrequency === "All" || p.frequency === selectedFrequency;
        return matchesSearch && matchesStatus && matchesFreq;
    });

    const activeCount = profiles.filter((p) => p.status === "Active").length;
    const onHoldCount = profiles.filter((p) => p.status === "On Hold").length;
    const expiredCount = profiles.filter((p) => p.status === "Expired").length;
    const monthlyValue = profiles
        .filter((p) => p.status === "Active" && p.frequency === "Monthly")
        .reduce((s, p) => s + p.amount, 0);

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
                            Recurring Invoices
                        </h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            Manage auto-billing profiles and schedules
                        </p>
                    </div>
                    <button className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        New Profile
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Active"
                        value={String(activeCount)}
                        delta={6.2}
                        icon={<PlayCircle className="w-3.5 h-3.5 text-emerald-500" />}
                    />
                    <StatCard
                        label="On Hold"
                        value={String(onHoldCount)}
                        icon={<PauseCircle className="w-3.5 h-3.5 text-amber-500" />}
                    />
                    <StatCard
                        label="Expired"
                        value={String(expiredCount)}
                        icon={<RefreshCw className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                    <StatCard
                        label="Monthly Value"
                        value={`₹${monthlyValue.toLocaleString("en-IN")}`}
                        delta={8.4}
                        icon={<Calendar className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                </div>

                {/* Table section */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Controls */}
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">
                                Billing Profiles
                            </h2>
                            <p className="text-[12px] text-zinc-500">
                                {filtered.length} profile{filtered.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="relative w-56">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search profiles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Frequency filter */}
                            <div className="relative">
                                <select
                                    value={selectedFrequency}
                                    onChange={(e) =>
                                        setSelectedFrequency(e.target.value as "All" | Frequency)
                                    }
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="All">All Frequency</option>
                                    {frequencies.map((f) => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {/* Status filter */}
                            <div className="relative">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value as "All" | RecurringStatus)
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
                                    "Profile",
                                    "Customer",
                                    "Frequency",
                                    "Next Invoice",
                                    "End Date",
                                    "Status",
                                    "Amount",
                                    "Invoices",
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
                            {filtered.map((profile) => (
                                <tr
                                    key={profile.id}
                                    className="hover:bg-zinc-50/70 transition-colors cursor-pointer"
                                    onClick={() => setOpenMenuId(null)}
                                >
                                    {/* Profile */}
                                    <td className="px-6 py-3">
                                        <div>
                                            <p className="text-[13px] font-medium text-zinc-900">
                                                {profile.profileName}
                                            </p>
                                            <p className="text-[12px] text-[#5B5FEF] font-medium">
                                                {profile.id}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Customer */}
                                    <td className="px-6 py-3">
                                        <div>
                                            <p className="text-[13px] font-medium text-zinc-900">
                                                {profile.customer}
                                            </p>
                                            <p className="text-[12px] text-zinc-400">
                                                {profile.customerId}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Frequency */}
                                    <td className="px-6 py-3">
                                        <FrequencyBadge frequency={profile.frequency} />
                                    </td>

                                    {/* Next Invoice */}
                                    <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
                                        {profile.status === "Expired"
                                            ? <span className="text-zinc-400">—</span>
                                            : formatDate(profile.nextInvoiceDate)}
                                    </td>

                                    {/* End Date */}
                                    <td className="px-6 py-3 text-[13px] whitespace-nowrap">
                                        {profile.endDate ? (
                                            <span className="text-zinc-600">{formatDate(profile.endDate)}</span>
                                        ) : (
                                            <span className="text-zinc-400 italic">Never</span>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-3">
                                        <StatusBadge status={profile.status} />
                                    </td>

                                    {/* Amount */}
                                    <td className="px-6 py-3 font-mono text-[13px] font-medium text-zinc-900 tabular-nums whitespace-nowrap">
                                        ₹{profile.amount.toLocaleString("en-IN")}
                                    </td>

                                    {/* Child invoices count */}
                                    <td className="px-6 py-3">
                                        <span className="inline-flex items-center gap-1 text-[12px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full font-medium">
                                            <FileText className="w-3 h-3" />
                                            {profile.childCount}
                                        </span>
                                    </td>

                                    {/* Trend */}
                                    <td className="px-6 py-3">
                                        <TrendBadge data={profile.trend} />
                                    </td>

                                    {/* Actions */}
                                    <td
                                        className="px-6 py-3 text-right relative"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() =>
                                                setOpenMenuId(
                                                    openMenuId === profile.id ? null : profile.id
                                                )
                                            }
                                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        {openMenuId === profile.id && (
                                            <div className="absolute right-6 top-10 z-10 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 w-52">
                                                {profile.status === "Active" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                        <Send className="w-3.5 h-3.5 text-[#5B5FEF]" />
                                                        Send Now
                                                    </button>
                                                )}
                                                <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                                    View Child Invoices
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                                    Edit Profile
                                                </button>
                                                {profile.status === "Active" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                                        <PauseCircle className="w-3.5 h-3.5" />
                                                        Put on Hold
                                                    </button>
                                                )}
                                                {profile.status === "On Hold" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                                                        <PlayCircle className="w-3.5 h-3.5" />
                                                        Resume
                                                    </button>
                                                )}
                                                {profile.status !== "Expired" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete Profile
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
                                            No profiles match your filters.
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
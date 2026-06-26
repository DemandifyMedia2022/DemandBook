"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
    Search,
    Plus,
    ChevronDown,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    Banknote,
    CheckCircle2,
    RotateCcw,
    FileText,
    Send,
    Printer,
    Trash2,
    CreditCard,
    Landmark,
    Wallet,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type PaymentStatus = "Undeposited" | "Deposited" | "Refunded";
type PaymentMode = "UPI" | "Bank Transfer" | "Cash" | "Cheque" | "Card";

interface Payment {
    id: string;
    customer: string;
    customerId: string;
    invoiceId: string;
    date: string;
    mode: PaymentMode;
    reference: string;
    status: PaymentStatus;
    amount: number;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialPayments: Payment[] = [
    {
        id: "PMT-0091",
        customer: "Acme Solutions",
        customerId: "CUST-4092",
        invoiceId: "INV-2041",
        date: "2025-06-18",
        mode: "Bank Transfer",
        reference: "UTR884521003",
        status: "Deposited",
        amount: 48500,
    },
    {
        id: "PMT-0090",
        customer: "Eco Stream Logistics",
        customerId: "CUST-8210",
        invoiceId: "INV-2038",
        date: "2025-06-17",
        mode: "UPI",
        reference: "UPI/250617/884123",
        status: "Undeposited",
        amount: 12200,
    },
    {
        id: "PMT-0089",
        customer: "Digital Wave Inc",
        customerId: "CUST-5512",
        invoiceId: "INV-2035",
        date: "2025-06-15",
        mode: "Cheque",
        reference: "CHQ-004521",
        status: "Undeposited",
        amount: 91000,
    },
    {
        id: "PMT-0088",
        customer: "FlexTech Systems",
        customerId: "CUST-6390",
        invoiceId: "INV-2031",
        date: "2025-06-14",
        mode: "Card",
        reference: "TXN8821004512",
        status: "Deposited",
        amount: 6750,
    },
    {
        id: "PMT-0087",
        customer: "Blue Tier Tech",
        customerId: "CUST-3912",
        invoiceId: "INV-2028",
        date: "2025-06-12",
        mode: "Cash",
        reference: "CASH-0087",
        status: "Deposited",
        amount: 3300,
    },
    {
        id: "PMT-0086",
        customer: "Acme Solutions",
        customerId: "CUST-4092",
        invoiceId: "INV-2024",
        date: "2025-06-10",
        mode: "Bank Transfer",
        reference: "UTR774210992",
        status: "Refunded",
        amount: 22400,
    },
    {
        id: "PMT-0085",
        customer: "Cloud Harbor",
        customerId: "CUST-2844",
        invoiceId: "INV-2020",
        date: "2025-06-08",
        mode: "UPI",
        reference: "UPI/250608/771009",
        status: "Deposited",
        amount: 9500,
    },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const statusConfig: Record<
    PaymentStatus,
    { bg: string; text: string; icon: React.ReactNode }
> = {
    Undeposited: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: <Banknote className="w-3 h-3" />,
    },
    Deposited: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    Refunded: {
        bg: "bg-red-50",
        text: "text-red-600",
        icon: <RotateCcw className="w-3 h-3" />,
    },
};

const modeConfig: Record<
    PaymentMode,
    { bg: string; text: string; icon: React.ReactNode }
> = {
    UPI: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        icon: <Wallet className="w-3 h-3" />,
    },
    "Bank Transfer": {
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: <Landmark className="w-3 h-3" />,
    },
    Cash: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <Banknote className="w-3 h-3" />,
    },
    Cheque: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: <FileText className="w-3 h-3" />,
    },
    Card: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        icon: <CreditCard className="w-3 h-3" />,
    },
};

const statuses: PaymentStatus[] = ["Undeposited", "Deposited", "Refunded"];
const modes: PaymentMode[] = ["UPI", "Bank Transfer", "Cash", "Cheque", "Card"];

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
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

function StatusBadge({ status }: { status: PaymentStatus }) {
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

function ModeBadge({ mode }: { mode: PaymentMode }) {
    const cfg = modeConfig[mode];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full",
                cfg.bg,
                cfg.text
            )}
        >
            {cfg.icon}
            {mode}
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
export default function PaymentsReceived() {
    const router = useRouter();
    const [payments] = useState<Payment[]>(initialPayments);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<"All" | PaymentStatus>("All");
    const [selectedMode, setSelectedMode] = useState<"All" | PaymentMode>("All");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const filtered = payments.filter((p) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            p.id.toLowerCase().includes(q) ||
            p.customer.toLowerCase().includes(q) ||
            p.invoiceId.toLowerCase().includes(q) ||
            p.reference.toLowerCase().includes(q);
        const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;
        const matchesMode = selectedMode === "All" || p.mode === selectedMode;
        return matchesSearch && matchesStatus && matchesMode;
    });

    const totalReceived = payments.reduce((s, p) => s + p.amount, 0);
    const thisMonth = payments
        .filter((p) => p.date.startsWith("2025-06"))
        .reduce((s, p) => s + p.amount, 0);
    const undeposited = payments
        .filter((p) => p.status === "Undeposited")
        .reduce((s, p) => s + p.amount, 0);
    const refunded = payments
        .filter((p) => p.status === "Refunded")
        .reduce((s, p) => s + p.amount, 0);

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
                            Payments Received
                        </h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            Track incoming payments and deposit status
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/payments-received/new")}
                        className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Payment
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Received"
                        value={`₹${totalReceived.toLocaleString("en-IN")}`}
                        delta={11.2}
                        icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    />
                    <StatCard
                        label="This Month"
                        value={`₹${thisMonth.toLocaleString("en-IN")}`}
                        delta={6.4}
                        icon={<ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />}
                    />
                    <StatCard
                        label="Undeposited"
                        value={`₹${undeposited.toLocaleString("en-IN")}`}
                        icon={<Banknote className="w-3.5 h-3.5 text-amber-500" />}
                    />
                    <StatCard
                        label="Refunded"
                        value={`₹${refunded.toLocaleString("en-IN")}`}
                        icon={<RotateCcw className="w-3.5 h-3.5 text-red-400" />}
                    />
                </div>

                {/* Table section */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

                    {/* Controls */}
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Payment List</h2>
                            <p className="text-[12px] text-zinc-500">
                                {filtered.length} payment{filtered.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="relative w-56">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search payments..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Mode filter */}
                            <div className="relative">
                                <select
                                    value={selectedMode}
                                    onChange={(e) => setSelectedMode(e.target.value as "All" | PaymentMode)}
                                    className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                                >
                                    <option value="All">All Modes</option>
                                    {modes.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {/* Status filter */}
                            <div className="relative">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value as "All" | PaymentStatus)}
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
                                {["Payment #", "Customer", "Invoice", "Date", "Mode", "Reference", "Status", "Amount", ""].map(
                                    (col) => (
                                        <th
                                            key={col}
                                            className={cn(
                                                "px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap",
                                                col === "" && "text-right"
                                            )}
                                        >
                                            {col}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="hover:bg-zinc-50/70 transition-colors cursor-pointer"
                                    onClick={() => setOpenMenuId(null)}
                                >
                                    {/* Payment ID */}
                                    <td className="px-6 py-3">
                                        <span className="text-[13px] font-semibold text-[#5B5FEF]">
                                            {payment.id}
                                        </span>
                                    </td>

                                    {/* Customer */}
                                    <td className="px-6 py-3">
                                        <div>
                                            <p className="text-[13px] font-medium text-zinc-900">
                                                {payment.customer}
                                            </p>
                                            <p className="text-[12px] text-zinc-400">{payment.customerId}</p>
                                        </div>
                                    </td>

                                    {/* Invoice */}
                                    <td className="px-6 py-3">
                                        <span className="text-[12px] font-medium text-[#5B5FEF] bg-indigo-50 px-2 py-0.5 rounded-full">
                                            {payment.invoiceId}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-3 text-[13px] text-zinc-600 whitespace-nowrap">
                                        {formatDate(payment.date)}
                                    </td>

                                    {/* Mode */}
                                    <td className="px-6 py-3">
                                        <ModeBadge mode={payment.mode} />
                                    </td>

                                    {/* Reference */}
                                    <td className="px-6 py-3">
                                        <span className="text-[12px] font-mono text-zinc-500">
                                            {payment.reference}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-3">
                                        <StatusBadge status={payment.status} />
                                    </td>

                                    {/* Amount */}
                                    <td className="px-6 py-3 font-mono text-[13px] font-medium text-zinc-900 tabular-nums whitespace-nowrap">
                                        ₹{payment.amount.toLocaleString("en-IN")}
                                    </td>

                                    {/* Actions */}
                                    <td
                                        className="px-6 py-3 text-right relative"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() =>
                                                setOpenMenuId(openMenuId === payment.id ? null : payment.id)
                                            }
                                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        {openMenuId === payment.id && (
                                            <div className="absolute right-6 top-10 z-10 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 w-52">
                                                <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                                    View Invoice
                                                </button>
                                                {payment.status === "Undeposited" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        Mark as Deposited
                                                    </button>
                                                )}
                                                <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                    <Send className="w-3.5 h-3.5 text-[#5B5FEF]" />
                                                    Send Receipt
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                                                    <Printer className="w-3.5 h-3.5 text-zinc-400" />
                                                    Download PDF
                                                </button>
                                                {payment.status === "Deposited" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        Refund
                                                    </button>
                                                )}
                                                {payment.status !== "Refunded" && (
                                                    <button className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
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
                                            No payments match your filters.
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
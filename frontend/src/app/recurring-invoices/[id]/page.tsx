"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    PlayCircle,
    PauseCircle,
    CheckCircle2,
    RefreshCw,
    Send,
    PencilLine,
    Trash2,
    FileText,
    Repeat,
    Calendar,
    Loader2,
    Clock,
} from "lucide-react";

function fmt(n: number) {
    return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(amount: number, currency: string) {
    const symbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
    const symbol = symbols[currency] ?? currency + " ";
    return `${symbol}${fmt(amount)}`;
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    Active: { bg: "bg-emerald-50", text: "text-emerald-700", icon: <PlayCircle className="w-3.5 h-3.5" /> },
    "On Hold": { bg: "bg-amber-50", text: "text-amber-700", icon: <PauseCircle className="w-3.5 h-3.5" /> },
    Expired: { bg: "bg-zinc-100", text: "text-zinc-500", icon: <RefreshCw className="w-3.5 h-3.5" /> },
    Completed: { bg: "bg-blue-50", text: "text-blue-700", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

const invoiceStatusConfig: Record<string, { bg: string; text: string }> = {
    Draft: { bg: "bg-zinc-100", text: "text-zinc-600" },
    Sent: { bg: "bg-blue-50", text: "text-blue-700" },
    Viewed: { bg: "bg-violet-50", text: "text-violet-700" },
    Partial: { bg: "bg-amber-50", text: "text-amber-700" },
    Paid: { bg: "bg-emerald-50", text: "text-emerald-700" },
    Overdue: { bg: "bg-red-50", text: "text-red-700" },
    Cancelled: { bg: "bg-zinc-100", text: "text-zinc-500" },
};

export default function RecurringInvoiceDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const authHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    });

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8888/api/recurring-invoices/${params.id}`, {
                headers: authHeaders(),
            });
            const data = await res.json();
            if (data.success) {
                setProfile(data.profile);
            } else {
                alert("Recurring profile not found");
                router.push("/recurring-invoices");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [params.id]);

    const handleGenerateNow = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`http://localhost:8888/api/recurring-invoices/${params.id}/generate-now`, {
                method: "POST",
                headers: authHeaders(),
            });
            const data = await res.json();
            if (data.success) {
                fetchProfile();
                router.push(`/invoices/${data.invoice.id}`);
            } else {
                alert(data.message || "Failed to generate invoice");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    };

    const handlePause = async () => {
        const reason = window.prompt("Reason for pausing this profile (optional):") || "";
        setActionLoading(true);
        try {
            const res = await fetch(`http://localhost:8888/api/recurring-invoices/${params.id}/pause`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ reason }),
            });
            const data = await res.json();
            if (data.success) fetchProfile();
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    };

    const handleResume = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`http://localhost:8888/api/recurring-invoices/${params.id}/resume`, {
                method: "POST",
                headers: authHeaders(),
            });
            const data = await res.json();
            if (data.success) fetchProfile();
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this recurring profile? This won't affect invoices already generated.")) return;
        setActionLoading(true);
        try {
            const res = await fetch(`http://localhost:8888/api/recurring-invoices/${params.id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            const data = await res.json();
            if (data.success) router.push("/recurring-invoices");
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
            </div>
        );
    }

    if (!profile) return null;

    const cfg = statusConfig[profile.status] ?? statusConfig.Active;
    const isFinished = profile.status === "Expired" || profile.status === "Completed";

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1000px] mx-auto px-8 py-8 space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/recurring-invoices")}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-[20px] font-semibold text-zinc-900 tracking-tight">{profile.profile_name}</h1>
                                <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full", cfg.bg, cfg.text)}>
                                    {cfg.icon}
                                    {profile.status}
                                </span>
                            </div>
                            <p className="text-[13px] text-zinc-500 mt-0.5">{profile.custom_id} · {profile.customer_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {profile.status === "Active" && (
                            <button
                                onClick={handleGenerateNow}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1.5 bg-[#5B5FEF] hover:bg-[#4a4ed4] disabled:opacity-50 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                            >
                                <Send className="w-3.5 h-3.5" />
                                Send Now
                            </button>
                        )}
                        {!isFinished && (
                            <button
                                onClick={() => router.push(`/recurring-invoices/${params.id}/edit`)}
                                className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                            >
                                <PencilLine className="w-3.5 h-3.5" />
                                Edit
                            </button>
                        )}
                        {profile.status === "Active" && (
                            <button
                                onClick={handlePause}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1.5 bg-white hover:bg-amber-50 text-amber-600 border border-zinc-200 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                            >
                                <PauseCircle className="w-3.5 h-3.5" />
                                Pause
                            </button>
                        )}
                        {profile.status === "On Hold" && (
                            <button
                                onClick={handleResume}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-600 border border-zinc-200 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                            >
                                <PlayCircle className="w-3.5 h-3.5" />
                                Resume
                            </button>
                        )}
                        {!isFinished && (
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 border border-zinc-200 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                {profile.status === "On Hold" && profile.pause_reason && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-[13px] text-amber-800">
                        <span className="font-medium">Pause reason: </span>{profile.pause_reason}
                    </div>
                )}

                {/* Schedule + Billing summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-4">
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <Repeat className="w-3 h-3" /> Frequency
                        </p>
                        <p className="text-[14px] font-semibold text-zinc-900">
                            {profile.interval_count > 1 ? `Every ${profile.interval_count} ` : ""}{profile.frequency}
                        </p>
                    </div>
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-4">
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <Calendar className="w-3 h-3" /> Next Invoice
                        </p>
                        <p className="text-[14px] font-semibold text-zinc-900">
                            {isFinished ? "—" : formatDate(profile.next_generation_date)}
                        </p>
                    </div>
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-4">
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <Clock className="w-3 h-3" /> Last Generated
                        </p>
                        <p className="text-[14px] font-semibold text-zinc-900">
                            {formatDate(profile.last_generated_at)}
                        </p>
                    </div>
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-4">
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <FileText className="w-3 h-3" /> Invoices Sent
                        </p>
                        <p className="text-[14px] font-semibold text-zinc-900">
                            {profile.occurrences_generated}
                            {profile.end_condition === "AfterOccurrences" && ` / ${profile.max_occurrences}`}
                        </p>
                    </div>
                </div>

                {/* Line items */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div className="px-6 py-4 border-b border-zinc-100">
                        <h2 className="text-[14px] font-semibold text-zinc-900">Line Items</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-100">
                                    <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Description</th>
                                    <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Qty</th>
                                    <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Rate</th>
                                    <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Tax</th>
                                    <th className="px-6 py-2.5 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {(profile.items || []).map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-3 text-[13px] text-zinc-900">{item.description}</td>
                                        <td className="px-4 py-3 text-[13px] text-zinc-600 font-mono tabular-nums">{item.quantity}</td>
                                        <td className="px-4 py-3 text-[13px] text-zinc-600 font-mono tabular-nums">{fmt(item.rate)}</td>
                                        <td className="px-4 py-3 text-[13px] text-zinc-600 font-mono tabular-nums">{fmt(item.tax_amount)}</td>
                                        <td className="px-6 py-3 text-right text-[13px] font-semibold text-zinc-900 font-mono tabular-nums">{fmt(item.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-zinc-100 px-6 py-4 flex justify-end">
                        <div className="w-64 space-y-1.5">
                            <div className="flex justify-between text-[13px]">
                                <span className="text-zinc-500">Sub Total</span>
                                <span className="font-mono tabular-nums text-zinc-900">{fmt(profile.sub_total)}</span>
                            </div>
                            {Number(profile.discount_total) > 0 && (
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-red-500">Discount</span>
                                    <span className="font-mono tabular-nums text-red-500">− {fmt(profile.discount_total)}</span>
                                </div>
                            )}
                            {Number(profile.tax_total) > 0 && (
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-zinc-500">Tax</span>
                                    <span className="font-mono tabular-nums text-zinc-900">{fmt(profile.tax_total)}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-zinc-200 text-[14px] font-semibold">
                                <span className="text-zinc-900">Total ({profile.currency})</span>
                                <span className="font-mono tabular-nums text-[#5B5FEF]">{formatCurrency(profile.amount, profile.currency)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Child invoices */}
                <div id="children" className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div className="px-6 py-4 border-b border-zinc-100">
                        <h2 className="text-[14px] font-semibold text-zinc-900">Generated Invoices</h2>
                        <p className="text-[12px] text-zinc-500">{(profile.childInvoices || []).length} invoice{(profile.childInvoices || []).length !== 1 ? "s" : ""}</p>
                    </div>
                    {(profile.childInvoices || []).length === 0 ? (
                        <div className="px-6 py-10 text-center text-[13px] text-zinc-400">No invoices generated yet.</div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {profile.childInvoices.map((inv: any) => {
                                const ic = invoiceStatusConfig[inv.status] ?? invoiceStatusConfig.Draft;
                                return (
                                    <div
                                        key={inv.id}
                                        onClick={() => router.push(`/invoices/${inv.id}`)}
                                        className="px-6 py-3 flex items-center justify-between hover:bg-zinc-50/70 cursor-pointer transition-colors"
                                    >
                                        <div>
                                            <p className="text-[13px] font-mono font-semibold text-[#5B5FEF]">{inv.number}</p>
                                            <p className="text-[12px] text-zinc-400">{formatDate(inv.invoice_date)} · Due {formatDate(inv.due_date)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={cn("text-[11px] font-medium px-2 py-1 rounded-md", ic.bg, ic.text)}>{inv.status}</span>
                                            <span className="text-[13px] font-mono font-semibold text-zinc-900 tabular-nums">{formatCurrency(inv.amount, profile.currency)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Activity log */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div className="px-6 py-4 border-b border-zinc-100">
                        <h2 className="text-[14px] font-semibold text-zinc-900">Activity</h2>
                    </div>
                    {(profile.activity || []).length === 0 ? (
                        <div className="px-6 py-10 text-center text-[13px] text-zinc-400">No activity yet.</div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {profile.activity.map((log: any) => (
                                <div key={log.id} className="px-6 py-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[13px] font-medium text-zinc-900">{log.action}</p>
                                        <p className="text-[12px] text-zinc-400">{formatDateTime(log.timestamp)}</p>
                                    </div>
                                    {log.remarks && <p className="text-[12px] text-zinc-500 mt-0.5">{log.remarks}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
    ArrowLeft,
    ChevronDown,
    Calendar,
    FileText,
    Info,
    Save,
    Send,
    AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CreditReason =
    | "Returned Goods"
    | "Price Adjustment"
    | "Duplicate Invoice"
    | "Other";

interface InvoiceOption {
    id: string;
    total: number;
    balanceDue: number;
    date: string;
}

interface CustomerOption {
    id: string;
    name: string;
    invoices: InvoiceOption[];
}

// ---------------------------------------------------------------------------
// Mock data — replace with API data (customers + their invoices)
// ---------------------------------------------------------------------------
const customers: CustomerOption[] = [
    {
        id: "CUST-4092",
        name: "Acme Solutions",
        invoices: [
            { id: "INV-2041", total: 45000, balanceDue: 45000, date: "2025-06-18" },
            { id: "INV-2024", total: 8800, balanceDue: 0, date: "2025-06-07" },
        ],
    },
    {
        id: "CUST-8210",
        name: "Eco Stream Logistics",
        invoices: [
            { id: "INV-2038", total: 4500, balanceDue: 4500, date: "2025-06-15" },
        ],
    },
    {
        id: "CUST-5512",
        name: "Digital Wave Inc",
        invoices: [
            { id: "INV-2035", total: 91000, balanceDue: 46000, date: "2025-06-13" },
        ],
    },
    {
        id: "CUST-6390",
        name: "FlexTech Systems",
        invoices: [
            { id: "INV-2031", total: 6750, balanceDue: 6750, date: "2025-06-11" },
        ],
    },
];

const reasons: CreditReason[] = [
    "Returned Goods",
    "Price Adjustment",
    "Duplicate Invoice",
    "Other",
];

function formatCurrency(n: number) {
    return `₹${n.toLocaleString("en-IN")}`;
}

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Reusable field shell
// ---------------------------------------------------------------------------
function Field({
    label,
    required,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[13px] font-medium text-zinc-700">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {hint && <p className="text-[12px] text-zinc-400">{hint}</p>}
        </div>
    );
}

const inputClass =
    "w-full px-3 py-2 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors placeholder:text-zinc-400";

const selectClass = cn(inputClass, "appearance-none pr-8 cursor-pointer");

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function NewCreditNote() {
    const router = useRouter();

    const [customerId, setCustomerId] = useState("");
    const [invoiceId, setInvoiceId] = useState("");
    const [date, setDate] = useState(todayISO());
    const [reason, setReason] = useState<CreditReason>("Returned Goods");
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState<"draft" | "open" | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const selectedCustomer = useMemo(
        () => customers.find((c) => c.id === customerId) ?? null,
        [customerId]
    );

    const selectedInvoice = useMemo(
        () => selectedCustomer?.invoices.find((i) => i.id === invoiceId) ?? null,
        [selectedCustomer, invoiceId]
    );

    const amountNum = parseFloat(amount) || 0;
    const exceedsInvoice =
        selectedInvoice !== null && amountNum > selectedInvoice.total;

    function handleCustomerChange(id: string) {
        setCustomerId(id);
        setInvoiceId(""); // reset dependent field
        setErrors((e) => ({ ...e, customerId: "", invoiceId: "" }));
    }

    function validate() {
        const next: Record<string, string> = {};
        if (!customerId) next.customerId = "Select a customer";
        if (!invoiceId) next.invoiceId = "Select an invoice";
        if (!amountNum || amountNum <= 0) next.amount = "Enter an amount greater than 0";
        if (exceedsInvoice) next.amount = "Amount can't exceed the invoice total";
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function handleSave(status: "draft" | "open") {
        if (!validate()) return;
        setSubmitting(status);

        const payload = {
            customerId,
            invoiceId,
            date,
            reason,
            amount: amountNum,
            notes,
            status: status === "draft" ? "Draft" : "Open",
        };

        // TODO: replace with real API call
        // await fetch("/api/credit-notes", { method: "POST", body: JSON.stringify(payload) })
        console.log("Saving credit note:", payload);

        setTimeout(() => {
            setSubmitting(null);
            router.push("/credit-notes");
        }, 500);
    }

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/credit-notes")}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
                            New Credit Note
                        </h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            Issue a credit against an existing invoice
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

                    {/* Left: form */}
                    <div className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] divide-y divide-zinc-100">

                        {/* Section: Customer & Invoice */}
                        <div className="p-6 space-y-4">
                            <h2 className="text-[14px] font-semibold text-zinc-900">
                                Customer &amp; Invoice
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Customer" required>
                                    <div className="relative">
                                        <select
                                            value={customerId}
                                            onChange={(e) => handleCustomerChange(e.target.value)}
                                            className={cn(
                                                selectClass,
                                                errors.customerId && "ring-2 ring-red-100 border-red-300"
                                            )}
                                        >
                                            <option value="">Select customer</option>
                                            {customers.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                    {errors.customerId && (
                                        <p className="text-[12px] text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {errors.customerId}
                                        </p>
                                    )}
                                </Field>

                                <Field label="Invoice" required hint={!selectedCustomer ? "Select a customer first" : undefined}>
                                    <div className="relative">
                                        <select
                                            value={invoiceId}
                                            onChange={(e) => {
                                                setInvoiceId(e.target.value);
                                                setErrors((er) => ({ ...er, invoiceId: "" }));
                                            }}
                                            disabled={!selectedCustomer}
                                            className={cn(
                                                selectClass,
                                                !selectedCustomer && "opacity-50 cursor-not-allowed",
                                                errors.invoiceId && "ring-2 ring-red-100 border-red-300"
                                            )}
                                        >
                                            <option value="">Select invoice</option>
                                            {selectedCustomer?.invoices.map((inv) => (
                                                <option key={inv.id} value={inv.id}>
                                                    {inv.id} — {formatCurrency(inv.total)}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                    {errors.invoiceId && (
                                        <p className="text-[12px] text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {errors.invoiceId}
                                        </p>
                                    )}
                                </Field>
                            </div>

                            {selectedInvoice && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/60 border border-indigo-100 rounded-lg text-[12px] text-zinc-600">
                                    <Info className="w-3.5 h-3.5 text-[#5B5FEF] flex-shrink-0" />
                                    Invoice total is{" "}
                                    <span className="font-mono font-medium text-zinc-900">
                                        {formatCurrency(selectedInvoice.total)}
                                    </span>
                                    , with{" "}
                                    <span className="font-mono font-medium text-zinc-900">
                                        {formatCurrency(selectedInvoice.balanceDue)}
                                    </span>{" "}
                                    currently due.
                                </div>
                            )}
                        </div>

                        {/* Section: Credit Details */}
                        <div className="p-6 space-y-4">
                            <h2 className="text-[14px] font-semibold text-zinc-900">
                                Credit Details
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Credit Note Date" required>
                                    <div className="relative">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className={cn(inputClass, "pl-8")}
                                        />
                                    </div>
                                </Field>

                                <Field label="Reason" required>
                                    <div className="relative">
                                        <select
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value as CreditReason)}
                                            className={selectClass}
                                        >
                                            {reasons.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </Field>
                            </div>

                            <Field label="Credit Amount" required>
                                <div className="relative max-w-[220px]">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-zinc-400">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setErrors((er) => ({ ...er, amount: "" }));
                                        }}
                                        className={cn(
                                            inputClass,
                                            "pl-7 font-mono tabular-nums",
                                            errors.amount && "ring-2 ring-red-100 border-red-300"
                                        )}
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="text-[12px] text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.amount}
                                    </p>
                                )}
                            </Field>

                            <Field label="Notes" hint="Optional — visible to the customer if sent">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Add a note about this credit note…"
                                    className={cn(inputClass, "resize-none")}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Right: live summary */}
                    <div className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6 space-y-5 lg:sticky lg:top-8">
                        <h2 className="text-[14px] font-semibold text-zinc-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-zinc-400" />
                            Summary
                        </h2>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[13px]">
                                <span className="text-zinc-500">Customer</span>
                                <span className="font-medium text-zinc-900">
                                    {selectedCustomer?.name ?? "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[13px]">
                                <span className="text-zinc-500">Invoice</span>
                                <span className="font-medium text-[#5B5FEF]">
                                    {selectedInvoice?.id ?? "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[13px]">
                                <span className="text-zinc-500">Invoice Total</span>
                                <span className="font-mono font-medium text-zinc-900 tabular-nums">
                                    {selectedInvoice ? formatCurrency(selectedInvoice.total) : "—"}
                                </span>
                            </div>

                            <div className="border-t border-zinc-100 pt-3 flex items-center justify-between">
                                <span className="text-[13px] text-zinc-500">Credit Amount</span>
                                <span
                                    className={cn(
                                        "font-mono font-semibold tabular-nums text-[15px]",
                                        exceedsInvoice ? "text-red-600" : "text-zinc-900"
                                    )}
                                >
                                    {formatCurrency(amountNum)}
                                </span>
                            </div>

                            {exceedsInvoice && (
                                <p className="text-[12px] text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                    Exceeds the invoice total
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => handleSave("open")}
                                disabled={submitting !== null}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white text-[13px] font-medium px-3.5 py-2.5 rounded-lg transition-colors shadow-sm"
                            >
                                <Send className="w-3.5 h-3.5" />
                                {submitting === "open" ? "Saving…" : "Save & Mark as Open"}
                            </button>
                            <button
                                onClick={() => handleSave("draft")}
                                disabled={submitting !== null}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-50 disabled:opacity-60 text-zinc-700 text-[13px] font-medium px-3.5 py-2.5 rounded-lg border border-zinc-200 transition-colors"
                            >
                                <Save className="w-3.5 h-3.5" />
                                {submitting === "draft" ? "Saving…" : "Save as Draft"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
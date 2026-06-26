"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
    ArrowLeft,
    ChevronDown,
    Calendar,
    FileText,
    Save,
    CheckCircle2,
    AlertCircle,
    Plus,
    Trash2,
    Receipt,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ProductOption {
    id: string;
    name: string;
    rate: number;
    unit: string;
}

interface CustomerOption {
    id: string;
    name: string;
}

interface LineItem {
    rowId: string;
    productId: string;
    quantity: number;
    rate: number;
}

// ---------------------------------------------------------------------------
// Mock data — replace with API data (customers + product/price list)
// ---------------------------------------------------------------------------
const customers: CustomerOption[] = [
    { id: "CUST-4092", name: "Acme Solutions" },
    { id: "CUST-8210", name: "Eco Stream Logistics" },
    { id: "CUST-5512", name: "Digital Wave Inc" },
    { id: "CUST-6390", name: "FlexTech Systems" },
    { id: "CUST-3912", name: "Blue Tier Tech" },
    { id: "CUST-2844", name: "Cloud Harbor" },
];

const products: ProductOption[] = [
    { id: "PRD-001", name: "Standard License Seat", rate: 4500, unit: "seat" },
    { id: "PRD-002", name: "Onboarding & Setup", rate: 12000, unit: "service" },
    { id: "PRD-003", name: "API Access Add-on", rate: 2200, unit: "month" },
    { id: "PRD-004", name: "Priority Support Plan", rate: 6750, unit: "month" },
    { id: "PRD-005", name: "Data Migration Package", rate: 18500, unit: "service" },
];

function formatCurrency(n: number) {
    return `₹${n.toLocaleString("en-IN")}`;
}

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

function makeRowId() {
    return Math.random().toString(36).slice(2, 9);
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
export default function NewSalesOrder() {
    const router = useRouter();

    const [customerId, setCustomerId] = useState("");
    const [orderDate, setOrderDate] = useState(todayISO());
    const [shipmentDate, setShipmentDate] = useState(addDaysISO(7));
    const [notes, setNotes] = useState("");
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { rowId: makeRowId(), productId: "", quantity: 1, rate: 0 },
    ]);
    const [submitting, setSubmitting] = useState<"draft" | "confirm" | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const selectedCustomer = useMemo(
        () => customers.find((c) => c.id === customerId) ?? null,
        [customerId]
    );

    function addRow() {
        setLineItems((rows) => [
            ...rows,
            { rowId: makeRowId(), productId: "", quantity: 1, rate: 0 },
        ]);
    }

    function removeRow(rowId: string) {
        setLineItems((rows) => (rows.length > 1 ? rows.filter((r) => r.rowId !== rowId) : rows));
    }

    function updateRow(rowId: string, patch: Partial<LineItem>) {
        setLineItems((rows) =>
            rows.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r))
        );
        setErrors((e) => ({ ...e, lineItems: "" }));
    }

    function handleProductChange(rowId: string, productId: string) {
        const product = products.find((p) => p.id === productId);
        updateRow(rowId, { productId, rate: product?.rate ?? 0 });
    }

    const validRows = lineItems.filter((r) => r.productId && r.quantity > 0);
    const subtotal = validRows.reduce((s, r) => s + r.quantity * r.rate, 0);
    const totalItems = validRows.reduce((s, r) => s + r.quantity, 0);

    function validate() {
        const next: Record<string, string> = {};
        if (!customerId) next.customerId = "Select a customer";
        if (!shipmentDate) next.shipmentDate = "Set a shipment date";
        if (validRows.length === 0) next.lineItems = "Add at least one line item";
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function handleSave(status: "draft" | "confirm") {
        if (!validate()) return;
        setSubmitting(status);

        const payload = {
            customerId,
            orderDate,
            shipmentDate,
            notes,
            items: validRows.map((r) => ({
                productId: r.productId,
                quantity: r.quantity,
                rate: r.rate,
                amount: r.quantity * r.rate,
            })),
            amount: subtotal,
            status: status === "draft" ? "Draft" : "Confirmed",
        };

        // TODO: replace with real API call
        // await fetch("/api/sales-orders", { method: "POST", body: JSON.stringify(payload) })
        console.log("Saving sales order:", payload);

        setTimeout(() => {
            setSubmitting(null);
            router.push("/sales-orders");
        }, 500);
    }

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

                {/* Page header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/sales-orders")}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
                            New Sales Order
                        </h1>
                        <p className="text-[13px] text-zinc-500 mt-0.5">
                            Build an order for line items and confirm with the customer
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

                    {/* Left: form */}
                    <div className="space-y-6">

                        {/* Section: Customer & Dates */}
                        <div className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6 space-y-4">
                            <h2 className="text-[14px] font-semibold text-zinc-900">
                                Customer &amp; Dates
                            </h2>

                            <div className="grid grid-cols-3 gap-4">
                                <Field label="Customer" required>
                                    <div className="relative">
                                        <select
                                            value={customerId}
                                            onChange={(e) => {
                                                setCustomerId(e.target.value);
                                                setErrors((er) => ({ ...er, customerId: "" }));
                                            }}
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

                                <Field label="Order Date" required>
                                    <div className="relative">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="date"
                                            value={orderDate}
                                            onChange={(e) => setOrderDate(e.target.value)}
                                            className={cn(inputClass, "pl-8")}
                                        />
                                    </div>
                                </Field>

                                <Field label="Shipment Date" required>
                                    <div className="relative">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="date"
                                            value={shipmentDate}
                                            onChange={(e) => {
                                                setShipmentDate(e.target.value);
                                                setErrors((er) => ({ ...er, shipmentDate: "" }));
                                            }}
                                            className={cn(
                                                inputClass,
                                                "pl-8",
                                                errors.shipmentDate && "ring-2 ring-red-100 border-red-300"
                                            )}
                                        />
                                    </div>
                                    {errors.shipmentDate && (
                                        <p className="text-[12px] text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {errors.shipmentDate}
                                        </p>
                                    )}
                                </Field>
                            </div>
                        </div>

                        {/* Section: Line items */}
                        <div className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                                <h2 className="text-[14px] font-semibold text-zinc-900">Line Items</h2>
                                <button
                                    onClick={addRow}
                                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#5B5FEF] hover:text-[#4347d9] transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Row
                                </button>
                            </div>

                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-100">
                                        {["Product", "Qty", "Rate", "Amount", ""].map((col) => (
                                            <th
                                                key={col}
                                                className={cn(
                                                    "px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap",
                                                    col === "" && "w-10"
                                                )}
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {lineItems.map((row) => {
                                        const product = products.find((p) => p.id === row.productId);
                                        const amount = row.quantity * row.rate;
                                        return (
                                            <tr key={row.rowId}>
                                                <td className="px-6 py-2.5 min-w-[220px]">
                                                    <div className="relative">
                                                        <select
                                                            value={row.productId}
                                                            onChange={(e) =>
                                                                handleProductChange(row.rowId, e.target.value)
                                                            }
                                                            className={selectClass}
                                                        >
                                                            <option value="">Select product</option>
                                                            {products.map((p) => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-2.5 w-28">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={row.quantity}
                                                        onChange={(e) =>
                                                            updateRow(row.rowId, {
                                                                quantity: parseInt(e.target.value) || 0,
                                                            })
                                                        }
                                                        className={cn(inputClass, "font-mono tabular-nums")}
                                                    />
                                                </td>
                                                <td className="px-6 py-2.5 w-36">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-zinc-400">
                                                            ₹
                                                        </span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={row.rate}
                                                            onChange={(e) =>
                                                                updateRow(row.rowId, {
                                                                    rate: parseFloat(e.target.value) || 0,
                                                                })
                                                            }
                                                            className={cn(inputClass, "pl-7 font-mono tabular-nums")}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-2.5 font-mono text-[13px] font-medium text-zinc-900 tabular-nums whitespace-nowrap">
                                                    {formatCurrency(amount)}
                                                    {product && (
                                                        <p className="text-[11px] font-sans font-normal text-zinc-400">
                                                            per {product.unit}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-2.5 text-right">
                                                    <button
                                                        onClick={() => removeRow(row.rowId)}
                                                        disabled={lineItems.length === 1}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {errors.lineItems && (
                                <p className="px-6 py-3 text-[12px] text-red-500 flex items-center gap-1 border-t border-zinc-100">
                                    <AlertCircle className="w-3 h-3" /> {errors.lineItems}
                                </p>
                            )}
                        </div>

                        {/* Section: Notes */}
                        <div className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6">
                            <Field label="Notes" hint="Optional — internal note for this order">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Add a note about this order…"
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
                                <span className="text-zinc-500">Line Items</span>
                                <span className="font-mono font-medium text-zinc-900 tabular-nums">
                                    {validRows.length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[13px]">
                                <span className="text-zinc-500">Total Quantity</span>
                                <span className="font-mono font-medium text-zinc-900 tabular-nums">
                                    {totalItems}
                                </span>
                            </div>

                            <div className="border-t border-zinc-100 pt-3 flex items-center justify-between">
                                <span className="text-[13px] text-zinc-500">Order Total</span>
                                <span className="font-mono font-semibold text-zinc-900 tabular-nums text-[15px]">
                                    {formatCurrency(subtotal)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => handleSave("confirm")}
                                disabled={submitting !== null}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white text-[13px] font-medium px-3.5 py-2.5 rounded-lg transition-colors shadow-sm"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {submitting === "confirm" ? "Saving…" : "Save & Confirm"}
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
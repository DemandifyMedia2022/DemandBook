"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
    ArrowLeft,
    Plus,
    Trash2,
    ChevronDown,
    FileText,
    Truck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LineItem {
    id: string;
    itemName: string;
    description: string;
    quantity: number | "";
    unit: string;
    rate: number | "";
}

interface FormData {
    customerId: string;
    salesOrderId: string;
    challanNo: string;
    challanDate: string;
    deliveryDate: string;
    shipToName: string;
    shipToAddress: string;
    shipToContact: string;
    shipToPhone: string;
    notes: string;
    terms: string;
    lineItems: LineItem[];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const customers = [
    { id: "CUST-4092", name: "Acme Solutions", address: "14 Connaught Place, New Delhi 110001", contact: "John Doe", phone: "+91 98765 43210" },
    { id: "CUST-8210", name: "Eco Stream Logistics", address: "Plot 22, MIDC, Pune 411019", contact: "Ravi Mehta", phone: "+91 88884 56789" },
    { id: "CUST-6390", name: "FlexTech Systems", address: "8th Floor, Cyber City, Gurugram 122002", contact: "Priya Sharma", phone: "+91 99990 11100" },
    { id: "CUST-3912", name: "Blue Tier Tech", address: "Tower B, Bandra Kurla Complex, Mumbai 400051", contact: "Sarah Khan", phone: "+91 91234 56789" },
    { id: "CUST-5512", name: "Digital Wave Inc", address: "HSR Layout, Bengaluru 560102", contact: "Mark Fernandez", phone: "+91 77777 12345" },
    { id: "CUST-2844", name: "Cloud Harbor", address: "Salt Lake Sector V, Kolkata 700091", contact: "Ananya Roy", phone: "+91 80001 11222" },
];

const salesOrders: Record<string, { id: string; label: string }[]> = {
    "CUST-4092": [{ id: "SO-1042", label: "SO-1042 — ₹48,500" }, { id: "SO-1037", label: "SO-1037 — ₹22,400" }],
    "CUST-8210": [{ id: "SO-1041", label: "SO-1041 — ₹12,200" }],
    "CUST-6390": [{ id: "SO-1040", label: "SO-1040 — ₹6,750" }],
    "CUST-3912": [{ id: "SO-1039", label: "SO-1039 — ₹3,300" }],
    "CUST-5512": [{ id: "SO-1038", label: "SO-1038 — ₹91,000" }],
    "CUST-2844": [],
};

const units = ["pcs", "kg", "box", "set", "litre", "metre", "dozen", "pack"];

const today = new Date().toISOString().split("T")[0];

function generateChallanNo() {
    return `DC-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

function newLineItem(): LineItem {
    return {
        id: crypto.randomUUID(),
        itemName: "",
        description: "",
        quantity: "",
        unit: "pcs",
        rate: "",
    };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SectionCard({
    title,
    children,
    icon,
}: {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
                {icon && <span className="text-zinc-400">{icon}</span>}
                <h2 className="text-[14px] font-semibold text-zinc-900">{title}</h2>
            </div>
            <div className="px-6 py-5">{children}</div>
        </div>
    );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">
            {children}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}

const inputCls =
    "w-full px-3 py-2 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors placeholder:text-zinc-400";

const selectCls =
    "w-full px-3 py-2 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors appearance-none cursor-pointer";

function SelectWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative">
            {children}
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function NewDeliveryChallan() {
    const router = useRouter();

    const [form, setForm] = useState<FormData>({
        customerId: "",
        salesOrderId: "",
        challanNo: generateChallanNo(),
        challanDate: today,
        deliveryDate: "",
        shipToName: "",
        shipToAddress: "",
        shipToContact: "",
        shipToPhone: "",
        notes: "",
        terms: "Goods once dispatched will not be taken back.\nThis challan is valid for 30 days from the date of issue.",
        lineItems: [newLineItem()],
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    // ---- Handlers ----
    const setField = useCallback(
        <K extends keyof FormData>(key: K, value: FormData[K]) => {
            setForm((prev) => ({ ...prev, [key]: value }));
            setErrors((prev) => ({ ...prev, [key]: undefined }));
        },
        []
    );

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find((c) => c.id === customerId);
        setForm((prev) => ({
            ...prev,
            customerId,
            salesOrderId: "",
            shipToName: customer?.name ?? "",
            shipToAddress: customer?.address ?? "",
            shipToContact: customer?.contact ?? "",
            shipToPhone: customer?.phone ?? "",
        }));
        setErrors((prev) => ({ ...prev, customerId: undefined }));
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
        setForm((prev) => ({
            ...prev,
            lineItems: prev.lineItems.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        }));
    };

    const addLineItem = () => {
        setForm((prev) => ({
            ...prev,
            lineItems: [...prev.lineItems, newLineItem()],
        }));
    };

    const removeLineItem = (id: string) => {
        setForm((prev) => ({
            ...prev,
            lineItems: prev.lineItems.filter((item) => item.id !== id),
        }));
    };

    // ---- Calculations ----
    const totalQty = form.lineItems.reduce(
        (s, i) => s + (Number(i.quantity) || 0),
        0
    );
    const subtotal = form.lineItems.reduce(
        (s, i) => s + (Number(i.quantity) || 0) * (Number(i.rate) || 0),
        0
    );

    // ---- Validation ----
    const validate = () => {
        const e: Partial<Record<keyof FormData, string>> = {};
        if (!form.customerId) e.customerId = "Customer is required";
        if (!form.challanDate) e.challanDate = "Challan date is required";
        if (!form.deliveryDate) e.deliveryDate = "Delivery date is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        // TODO: API call
        router.push("/delivery-challans");
    };

    const handleSaveDraft = () => {
        // TODO: API call with status Draft
        router.push("/delivery-challans");
    };

    const availableOrders = form.customerId ? (salesOrders[form.customerId] ?? []) : [];

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[900px] mx-auto px-8 py-8 space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/delivery-challans")}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
                                New Delivery Challan
                            </h1>
                            <p className="text-[13px] text-zinc-500 mt-0.5">
                                Create a dispatch document for goods movement
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSaveDraft}
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <FileText className="w-4 h-4" />
                            Save as Draft
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <Truck className="w-4 h-4" />
                            Submit Challan
                        </button>
                    </div>
                </div>

                {/* Section 1 — Basic Details */}
                <SectionCard title="Basic Details" icon={<FileText className="w-4 h-4" />}>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {/* Customer */}
                        <div>
                            <Label required>Customer</Label>
                            <SelectWrapper>
                                <select
                                    value={form.customerId}
                                    onChange={(e) => handleCustomerChange(e.target.value)}
                                    className={cn(selectCls, errors.customerId && "border-red-300 focus:border-red-400")}
                                >
                                    <option value="">Select a customer</option>
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </SelectWrapper>
                            {errors.customerId && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.customerId}</p>
                            )}
                        </div>

                        {/* Sales Order */}
                        <div>
                            <Label>Sales Order (optional)</Label>
                            <SelectWrapper>
                                <select
                                    value={form.salesOrderId}
                                    onChange={(e) => setField("salesOrderId", e.target.value)}
                                    disabled={!form.customerId}
                                    className={cn(
                                        selectCls,
                                        !form.customerId && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <option value="">
                                        {form.customerId
                                            ? availableOrders.length
                                                ? "Select a sales order"
                                                : "No orders for this customer"
                                            : "Select a customer first"}
                                    </option>
                                    {availableOrders.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </SelectWrapper>
                        </div>

                        {/* Challan No */}
                        <div>
                            <Label required>Challan #</Label>
                            <input
                                type="text"
                                value={form.challanNo}
                                onChange={(e) => setField("challanNo", e.target.value)}
                                className={inputCls}
                            />
                        </div>

                        {/* Challan Date */}
                        <div>
                            <Label required>Challan Date</Label>
                            <input
                                type="date"
                                value={form.challanDate}
                                onChange={(e) => setField("challanDate", e.target.value)}
                                className={cn(inputCls, errors.challanDate && "border-red-300")}
                            />
                            {errors.challanDate && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.challanDate}</p>
                            )}
                        </div>

                        {/* Delivery Date */}
                        <div>
                            <Label required>Expected Delivery Date</Label>
                            <input
                                type="date"
                                value={form.deliveryDate}
                                onChange={(e) => setField("deliveryDate", e.target.value)}
                                min={form.challanDate}
                                className={cn(inputCls, errors.deliveryDate && "border-red-300")}
                            />
                            {errors.deliveryDate && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.deliveryDate}</p>
                            )}
                        </div>
                    </div>
                </SectionCard>

                {/* Section 2 — Ship To */}
                <SectionCard title="Ship To" icon={<Truck className="w-4 h-4" />}>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <Label>Company / Name</Label>
                            <input
                                type="text"
                                value={form.shipToName}
                                onChange={(e) => setField("shipToName", e.target.value)}
                                placeholder="Delivery recipient"
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <Label>Contact Person</Label>
                            <input
                                type="text"
                                value={form.shipToContact}
                                onChange={(e) => setField("shipToContact", e.target.value)}
                                placeholder="Full name"
                                className={inputCls}
                            />
                        </div>

                        <div className="col-span-2">
                            <Label>Delivery Address</Label>
                            <textarea
                                value={form.shipToAddress}
                                onChange={(e) => setField("shipToAddress", e.target.value)}
                                placeholder="Street, City, State, PIN"
                                rows={2}
                                className={cn(inputCls, "resize-none")}
                            />
                        </div>

                        <div>
                            <Label>Phone</Label>
                            <input
                                type="text"
                                value={form.shipToPhone}
                                onChange={(e) => setField("shipToPhone", e.target.value)}
                                placeholder="+91 00000 00000"
                                className={inputCls}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* Section 3 — Line Items */}
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    <div className="px-6 py-4 border-b border-zinc-100">
                        <h2 className="text-[14px] font-semibold text-zinc-900">Line Items</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-100">
                                    {["Item Name", "Description", "Qty", "Unit", "Rate (₹)", "Amount (₹)", ""].map(
                                        (col) => (
                                            <th
                                                key={col}
                                                className="px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap"
                                            >
                                                {col}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {form.lineItems.map((item, idx) => {
                                    const amount =
                                        (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                                    return (
                                        <tr key={item.id} className="group">
                                            {/* Item Name */}
                                            <td className="px-4 py-2.5 min-w-[160px]">
                                                <input
                                                    type="text"
                                                    value={item.itemName}
                                                    onChange={(e) =>
                                                        updateLineItem(item.id, "itemName", e.target.value)
                                                    }
                                                    placeholder="Item name"
                                                    className={cn(inputCls, "min-w-[140px]")}
                                                />
                                            </td>

                                            {/* Description */}
                                            <td className="px-4 py-2.5 min-w-[180px]">
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        updateLineItem(item.id, "description", e.target.value)
                                                    }
                                                    placeholder="Optional"
                                                    className={cn(inputCls, "min-w-[160px]")}
                                                />
                                            </td>

                                            {/* Qty */}
                                            <td className="px-4 py-2.5 min-w-[80px]">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            item.id,
                                                            "quantity",
                                                            e.target.value === "" ? "" : Number(e.target.value)
                                                        )
                                                    }
                                                    placeholder="0"
                                                    className={cn(inputCls, "min-w-[70px]")}
                                                />
                                            </td>

                                            {/* Unit */}
                                            <td className="px-4 py-2.5 min-w-[90px]">
                                                <SelectWrapper>
                                                    <select
                                                        value={item.unit}
                                                        onChange={(e) =>
                                                            updateLineItem(item.id, "unit", e.target.value)
                                                        }
                                                        className={cn(selectCls, "min-w-[80px]")}
                                                    >
                                                        {units.map((u) => (
                                                            <option key={u} value={u}>
                                                                {u}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </SelectWrapper>
                                            </td>

                                            {/* Rate */}
                                            <td className="px-4 py-2.5 min-w-[110px]">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={item.rate}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            item.id,
                                                            "rate",
                                                            e.target.value === "" ? "" : Number(e.target.value)
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    className={cn(inputCls, "min-w-[100px]")}
                                                />
                                            </td>

                                            {/* Amount */}
                                            <td className="px-4 py-2.5 min-w-[110px]">
                                                <span className="text-[13px] font-medium text-zinc-900 tabular-nums">
                                                    ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>

                                            {/* Delete */}
                                            <td className="px-4 py-2.5">
                                                <button
                                                    onClick={() => removeLineItem(item.id)}
                                                    disabled={form.lineItems.length === 1}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-300 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Add item + totals */}
                    <div className="px-6 py-4 border-t border-zinc-100 flex items-start justify-between gap-6">
                        <button
                            onClick={addLineItem}
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5B5FEF] hover:text-[#4a4ed8] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>

                        <div className="space-y-2 min-w-[220px]">
                            <div className="flex items-center justify-between text-[13px]">
                                <span className="text-zinc-500">Total Quantity</span>
                                <span className="font-medium text-zinc-900 tabular-nums">
                                    {totalQty} units
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[13px]">
                                <span className="text-zinc-500">Subtotal</span>
                                <span className="font-semibold text-zinc-900 tabular-nums">
                                    ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4 — Notes & Terms */}
                <SectionCard title="Notes & Terms">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <Label>Notes</Label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => setField("notes", e.target.value)}
                                placeholder="Any additional notes for this challan..."
                                rows={4}
                                className={cn(inputCls, "resize-none")}
                            />
                        </div>
                        <div>
                            <Label>Terms & Conditions</Label>
                            <textarea
                                value={form.terms}
                                onChange={(e) => setField("terms", e.target.value)}
                                rows={4}
                                className={cn(inputCls, "resize-none")}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* Bottom actions */}
                <div className="flex items-center justify-end gap-2 pb-8">
                    <button
                        onClick={() => router.push("/delivery-challans")}
                        className="text-[13px] font-medium text-zinc-500 hover:text-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveDraft}
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <FileText className="w-4 h-4" />
                        Save as Draft
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Truck className="w-4 h-4" />
                        Submit Challan
                    </button>
                </div>
            </div>
        </div>
    );
}
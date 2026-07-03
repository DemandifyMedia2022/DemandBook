"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    Plus,
    Trash2,
    ChevronDown,
    FileText,
    Receipt,
    Repeat,
    Save,
    Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Shared local UI (matches Create Invoice page's conventions)
// ---------------------------------------------------------------------------
function SectionCard({
    title,
    children,
    icon,
    noPadding,
}: {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    noPadding?: boolean;
}) {
    return (
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
                {icon && <span className="text-zinc-400">{icon}</span>}
                <h2 className="text-[14px] font-semibold text-zinc-900">{title}</h2>
            </div>
            <div className={noPadding ? "" : "px-6 py-5"}>{children}</div>
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

const selectCls = cn(inputCls, "appearance-none cursor-pointer");

function SelectWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative">
            {children}
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
    );
}

function fmt(n: number) {
    return n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LineItem {
    id: number;
    description: string;
    quantity: number;
    rate: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    amount: number;
}

type Frequency = "Daily" | "Weekly" | "Monthly" | "Yearly";
type EndCondition = "Never" | "OnDate" | "AfterOccurrences";
type CreationMode = "AutoSend" | "Draft";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CreateRecurringInvoicePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        profileName: "",
        customerName: "",
        customerEmail: "",

        // Schedule
        frequency: "Monthly" as Frequency,
        intervalCount: 1,
        startDate: new Date().toISOString().split("T")[0],
        endCondition: "Never" as EndCondition,
        endDate: "",
        maxOccurrences: 12,

        // Billing behavior
        creationMode: "Draft" as CreationMode,
        dueDateOffsetDays: 15,
        currency: "INR",

        paymentTerms: "Net 15",
        referenceNumber: "",
        customerNotes: "",
        termsConditions: "",
        internalNotes: "",
        shippingCharges: 0,
        roundOff: 0,
    });

    const [items, setItems] = useState<LineItem[]>([
        { id: Date.now(), description: "", quantity: 1, rate: 0, discount: 0, taxRate: 0, taxAmount: 0, amount: 0 },
    ]);

    const handleItemChange = (id: number, field: string, value: number | string) => {
        setItems(items.map((item) => {
            if (item.id !== id) return item;
            const updated = { ...item, [field]: value };
            const base = updated.quantity * updated.rate;
            const afterDiscount = base - (updated.discount || 0);
            updated.taxAmount = (afterDiscount * (updated.taxRate || 0)) / 100;
            updated.amount = afterDiscount + updated.taxAmount;
            return updated;
        }));
    };

    const addItem = () =>
        setItems([...items, { id: Date.now(), description: "", quantity: 1, rate: 0, discount: 0, taxRate: 0, taxAmount: 0, amount: 0 }]);

    const removeItem = (id: number) => setItems(items.filter((i) => i.id !== id));

    const subTotal = items.reduce((s, i) => s + i.quantity * i.rate, 0);
    const discountTotal = items.reduce((s, i) => s + (i.discount || 0), 0);
    const taxTotal = items.reduce((s, i) => s + (i.taxAmount || 0), 0);
    const grandTotal = subTotal - discountTotal + taxTotal + Number(profileData.shippingCharges) + Number(profileData.roundOff);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (profileData.endCondition === "OnDate" && !profileData.endDate) {
            alert("Please set an end date, or choose a different end condition.");
            return;
        }
        if (profileData.endCondition === "AfterOccurrences" && (!profileData.maxOccurrences || profileData.maxOccurrences < 1)) {
            alert("Please set how many invoices to generate, or choose a different end condition.");
            return;
        }

        setLoading(true);
        const payload = {
            profile_name: profileData.profileName,
            customerName: profileData.customerName,
            customerEmail: profileData.customerEmail,

            frequency: profileData.frequency,
            interval_count: Number(profileData.intervalCount),
            start_date: profileData.startDate,
            end_condition: profileData.endCondition,
            end_date: profileData.endCondition === "OnDate" ? profileData.endDate : null,
            max_occurrences: profileData.endCondition === "AfterOccurrences" ? Number(profileData.maxOccurrences) : null,

            creation_mode: profileData.creationMode,
            due_date_offset_days: Number(profileData.dueDateOffsetDays),
            currency: profileData.currency,

            payment_terms: profileData.paymentTerms,
            reference_number: profileData.referenceNumber,
            customer_notes: profileData.customerNotes,
            terms_conditions: profileData.termsConditions,
            internal_notes: profileData.internalNotes,
            shipping_charges: Number(profileData.shippingCharges),
            round_off: Number(profileData.roundOff),

            items: items.map((i) => ({
                description: i.description,
                quantity: i.quantity,
                rate: i.rate,
                discount: i.discount,
                tax_rate: i.taxRate,
                tax_amount: i.taxAmount,
                amount: i.amount,
            })),
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8888/api/recurring-invoices`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/recurring-invoices`);
            } else {
                alert("Failed to create recurring profile: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error creating recurring profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
            <div className="max-w-[1000px] mx-auto px-8 py-8 space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
                                Create Recurring Invoice
                            </h1>
                            <p className="text-[13px] text-zinc-500 mt-0.5">
                                Set up a billing profile that auto-generates invoices on a schedule
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            form="create-recurring-form"
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Profile
                        </button>
                    </div>
                </div>

                <form id="create-recurring-form" onSubmit={handleSubmit} className="space-y-5">

                    {/* Profile + Customer */}
                    <SectionCard title="Profile & Customer" icon={<FileText className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="md:col-span-2">
                                <Label required>Profile Name</Label>
                                <input
                                    required
                                    className={inputCls}
                                    placeholder="e.g. Monthly SaaS License"
                                    value={profileData.profileName}
                                    onChange={(e) => setProfileData({ ...profileData, profileName: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label required>Customer Name</Label>
                                <input
                                    required
                                    className={inputCls}
                                    placeholder="e.g. Acme Corp"
                                    value={profileData.customerName}
                                    onChange={(e) => setProfileData({ ...profileData, customerName: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Customer Email</Label>
                                <input
                                    type="email"
                                    className={inputCls}
                                    placeholder="billing@acme.com"
                                    value={profileData.customerEmail}
                                    onChange={(e) => setProfileData({ ...profileData, customerEmail: e.target.value })}
                                />
                            </div>
                        </div>
                    </SectionCard>

                    {/* Schedule */}
                    <SectionCard title="Billing Schedule" icon={<Repeat className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                            <div>
                                <Label required>Repeats Every</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        className={cn(inputCls, "w-16 font-mono tabular-nums")}
                                        value={profileData.intervalCount}
                                        onChange={(e) => setProfileData({ ...profileData, intervalCount: Number(e.target.value) })}
                                    />
                                    <SelectWrapper>
                                        <select
                                            className={selectCls}
                                            value={profileData.frequency}
                                            onChange={(e) => setProfileData({ ...profileData, frequency: e.target.value as Frequency })}
                                        >
                                            <option value="Daily">Day(s)</option>
                                            <option value="Weekly">Week(s)</option>
                                            <option value="Monthly">Month(s)</option>
                                            <option value="Yearly">Year(s)</option>
                                        </select>
                                    </SelectWrapper>
                                </div>
                            </div>
                            <div>
                                <Label required>Start Date</Label>
                                <input
                                    type="date"
                                    required
                                    className={inputCls}
                                    value={profileData.startDate}
                                    onChange={(e) => setProfileData({ ...profileData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Ends</Label>
                                <SelectWrapper>
                                    <select
                                        className={selectCls}
                                        value={profileData.endCondition}
                                        onChange={(e) => setProfileData({ ...profileData, endCondition: e.target.value as EndCondition })}
                                    >
                                        <option value="Never">Never</option>
                                        <option value="OnDate">On Date</option>
                                        <option value="AfterOccurrences">After N Invoices</option>
                                    </select>
                                </SelectWrapper>
                            </div>

                            {profileData.endCondition === "OnDate" && (
                                <div>
                                    <Label required>End Date</Label>
                                    <input
                                        type="date"
                                        required
                                        className={inputCls}
                                        value={profileData.endDate}
                                        onChange={(e) => setProfileData({ ...profileData, endDate: e.target.value })}
                                    />
                                </div>
                            )}
                            {profileData.endCondition === "AfterOccurrences" && (
                                <div>
                                    <Label required>Number of Invoices</Label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className={cn(inputCls, "font-mono tabular-nums")}
                                        value={profileData.maxOccurrences}
                                        onChange={(e) => setProfileData({ ...profileData, maxOccurrences: Number(e.target.value) })}
                                    />
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    {/* Billing behavior */}
                    <SectionCard title="Invoice Details" icon={<Receipt className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                            <div>
                                <Label>When Generated</Label>
                                <SelectWrapper>
                                    <select
                                        className={selectCls}
                                        value={profileData.creationMode}
                                        onChange={(e) => setProfileData({ ...profileData, creationMode: e.target.value as CreationMode })}
                                    >
                                        <option value="Draft">Save as Draft</option>
                                        <option value="AutoSend">Auto-send to Customer</option>
                                    </select>
                                </SelectWrapper>
                            </div>
                            <div>
                                <Label>Payment Terms</Label>
                                <SelectWrapper>
                                    <select
                                        className={selectCls}
                                        value={profileData.paymentTerms}
                                        onChange={(e) => {
                                            const terms = e.target.value;
                                            const offset =
                                                terms === "Due on Receipt" ? 0 :
                                                    terms === "Net 15" ? 15 :
                                                        terms === "Net 30" ? 30 :
                                                            terms === "Net 45" ? 45 :
                                                                terms === "Net 60" ? 60 : profileData.dueDateOffsetDays;
                                            setProfileData({ ...profileData, paymentTerms: terms, dueDateOffsetDays: offset });
                                        }}
                                    >
                                        <option>Due on Receipt</option>
                                        <option>Net 15</option>
                                        <option>Net 30</option>
                                        <option>Net 45</option>
                                        <option>Net 60</option>
                                    </select>
                                </SelectWrapper>
                            </div>
                            <div>
                                <Label>Currency</Label>
                                <SelectWrapper>
                                    <select
                                        className={selectCls}
                                        value={profileData.currency}
                                        onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                                    >
                                        <option value="INR">INR — Indian Rupee</option>
                                        <option value="USD">USD — US Dollar</option>
                                        <option value="EUR">EUR — Euro</option>
                                    </select>
                                </SelectWrapper>
                            </div>
                            <div>
                                <Label>Reference Number</Label>
                                <input
                                    className={inputCls}
                                    placeholder="PO-12345"
                                    value={profileData.referenceNumber}
                                    onChange={(e) => setProfileData({ ...profileData, referenceNumber: e.target.value })}
                                />
                            </div>
                        </div>
                    </SectionCard>

                    {/* Line Items */}
                    <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                        <div className="px-6 py-4 border-b border-zinc-100">
                            <h2 className="text-[14px] font-semibold text-zinc-900">Line Items</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left">
                                <thead>
                                    <tr className="border-b border-zinc-100">
                                        <th className="px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide min-w-[220px]">Description</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide w-20">Qty</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide w-28">Rate</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide w-24">Discount</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide w-24">Tax %</th>
                                        <th className="px-6 py-2.5 text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wide w-32">Amount</th>
                                        <th className="w-10" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {items.map((item) => (
                                        <tr key={item.id} className="group">
                                            <td className="px-6 py-2.5">
                                                <input
                                                    required
                                                    placeholder="Service or product name"
                                                    className={inputCls}
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <input
                                                    required type="number" min="1" step="0.01"
                                                    className={cn(inputCls, "font-mono tabular-nums")}
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <input
                                                    required type="number" min="0" step="0.01"
                                                    className={cn(inputCls, "font-mono tabular-nums")}
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(item.id, "rate", Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <input
                                                    type="number" min="0" step="0.01"
                                                    className={cn(inputCls, "font-mono tabular-nums")}
                                                    value={item.discount}
                                                    onChange={(e) => handleItemChange(item.id, "discount", Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <SelectWrapper>
                                                    <select
                                                        className={selectCls}
                                                        value={item.taxRate}
                                                        onChange={(e) => handleItemChange(item.id, "taxRate", Number(e.target.value))}
                                                    >
                                                        <option value={0}>0%</option>
                                                        <option value={5}>5%</option>
                                                        <option value={12}>12%</option>
                                                        <option value={18}>18%</option>
                                                        <option value={28}>28%</option>
                                                    </select>
                                                </SelectWrapper>
                                            </td>
                                            <td className="px-6 py-2.5 text-right font-mono text-[13px] font-semibold text-zinc-900 tabular-nums whitespace-nowrap">
                                                {fmt(item.amount)}
                                            </td>
                                            <td className="pr-4 py-2.5 text-center">
                                                {items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-zinc-300 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-3 border-t border-zinc-100">
                            <button
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5B5FEF] hover:text-[#4a4ed4] transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add line item
                            </button>
                        </div>

                        {/* Notes + Totals */}
                        <div className="border-t border-zinc-100 px-6 py-5 flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <Label>Customer Notes</Label>
                                    <textarea
                                        rows={3}
                                        className={cn(inputCls, "resize-none")}
                                        placeholder="Thanks for your business."
                                        value={profileData.customerNotes}
                                        onChange={(e) => setProfileData({ ...profileData, customerNotes: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Terms &amp; Conditions</Label>
                                    <textarea
                                        rows={3}
                                        className={cn(inputCls, "resize-none")}
                                        placeholder="Payment due upon receipt."
                                        value={profileData.termsConditions}
                                        onChange={(e) => setProfileData({ ...profileData, termsConditions: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Internal Notes</Label>
                                    <textarea
                                        rows={2}
                                        className={cn(inputCls, "resize-none")}
                                        placeholder="Not shown to customer"
                                        value={profileData.internalNotes}
                                        onChange={(e) => setProfileData({ ...profileData, internalNotes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-72 space-y-2.5">
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-zinc-500">Sub Total</span>
                                    <span className="font-mono font-semibold text-zinc-900 tabular-nums">{fmt(subTotal)}</span>
                                </div>

                                {discountTotal > 0 && (
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-red-500">Discount</span>
                                        <span className="font-mono font-semibold text-red-500 tabular-nums">− {fmt(discountTotal)}</span>
                                    </div>
                                )}

                                {taxTotal > 0 && (
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-zinc-500">Tax</span>
                                        <span className="font-mono font-semibold text-zinc-900 tabular-nums">{fmt(taxTotal)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-zinc-500">Shipping</span>
                                    <input
                                        type="number"
                                        className="w-24 px-2 py-1 text-[13px] text-right bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors font-mono tabular-nums"
                                        value={profileData.shippingCharges}
                                        onChange={(e) => setProfileData({ ...profileData, shippingCharges: Number(e.target.value) })}
                                    />
                                </div>

                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-zinc-500">Round Off</span>
                                    <input
                                        type="number" step="0.01"
                                        className="w-24 px-2 py-1 text-[13px] text-right bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors font-mono tabular-nums"
                                        value={profileData.roundOff}
                                        onChange={(e) => setProfileData({ ...profileData, roundOff: Number(e.target.value) })}
                                    />
                                </div>

                                <div className="pt-3 border-t border-zinc-200 flex justify-between items-center">
                                    <span className="text-[14px] font-semibold text-zinc-900">Total ({profileData.currency})</span>
                                    <span className="font-mono text-[18px] font-bold text-[#5B5FEF] tabular-nums">{fmt(grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom actions */}
                    <div className="flex items-center justify-end gap-2 pb-8">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-[13px] font-medium text-zinc-500 hover:text-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
"use client";

import Logo from "@/components/logo";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  Save,
  Palette,
  Eye,
  Sliders,
  CheckCircle2,
  Trash2,
  Sparkles,
  ChevronDown,
  Info
} from "lucide-react";

// Presets for the customizer colors
const PRIMARY_PRESETS = [
  { name: "Slate", value: "#1e293b" },
  { name: "Blue", value: "#2563eb" },
  { name: "Emerald", value: "#059669" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Rose", value: "#e11d48" },
  { name: "Orange", value: "#ea580c" },
  { name: "Violet", value: "#7c3aed" }
];

const SECONDARY_PRESETS = [
  { name: "Light Slate", value: "#f1f5f9" },
  { name: "Light Blue", value: "#eff6ff" },
  { name: "Light Emerald", value: "#ecfdf5" },
  { name: "Light Indigo", value: "#e0e7ff" },
  { name: "Light Rose", value: "#fff1f2" },
  { name: "Light Orange", value: "#fff7ed" },
  { name: "Light Violet", value: "#f5f3ff" }
];

const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-zinc-800 placeholder:text-zinc-400";
const SELECT = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-zinc-800 cursor-pointer appearance-none";

export default function InvoiceSettings() {
  // Settings Form State
  const [logo, setLogo] = useState<string | null>(null);
  const [prefix, setPrefix] = useState("INV-");
  const [nextNumber, setNextNumber] = useState("10001");
  const [paymentTerms, setPaymentTerms] = useState("Due on Receipt");
  const [taxRate, setTaxRate] = useState("18");
  const [discountRate, setDiscountRate] = useState("0");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#eff6ff");
  const [logoAlignment, setLogoAlignment] = useState<"left" | "center" | "right">("left");
  const [showShippingAddress, setShowShippingAddress] = useState(true);
  const [showTerms, setShowTerms] = useState(true);
  const [customerNotes, setCustomerNotes] = useState("Thank you for your business!");
  const [termsAndConditions, setTermsAndConditions] = useState("Please pay within the due date to avoid interest charges.");

  // Feedback State
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load existing settings if saved in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLogo = localStorage.getItem("inv_logo");
      const savedPrefix = localStorage.getItem("inv_prefix");
      const savedNumber = localStorage.getItem("inv_number");
      const savedTerms = localStorage.getItem("inv_terms");
      const savedTax = localStorage.getItem("inv_tax");
      const savedDiscount = localStorage.getItem("inv_discount");
      const savedPrimary = localStorage.getItem("inv_primary");
      const savedSecondary = localStorage.getItem("inv_secondary");
      const savedAlign = localStorage.getItem("inv_align");
      const savedShowShip = localStorage.getItem("inv_show_ship");
      const savedShowTerms = localStorage.getItem("inv_show_terms");
      const savedNotes = localStorage.getItem("inv_notes");
      const savedTermsCond = localStorage.getItem("inv_terms_cond");

      if (savedLogo) setLogo(savedLogo);
      if (savedPrefix) setPrefix(savedPrefix);
      if (savedNumber) setNextNumber(savedNumber);
      if (savedTerms) setPaymentTerms(savedTerms);
      if (savedTax) setTaxRate(savedTax);
      if (savedDiscount) setDiscountRate(savedDiscount);
      if (savedPrimary) setPrimaryColor(savedPrimary);
      if (savedSecondary) setSecondaryColor(savedSecondary);
      if (savedAlign) setLogoAlignment(savedAlign as any);
      if (savedShowShip) setShowShippingAddress(savedShowShip === "true");
      if (savedShowTerms) setShowTerms(savedShowTerms === "true");
      if (savedNotes) setCustomerNotes(savedNotes);
      if (savedTermsCond) setTermsAndConditions(savedTermsCond);
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo file is too large. Max size is 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (typeof window !== "undefined") {
      if (logo) localStorage.setItem("inv_logo", logo);
      else localStorage.removeItem("inv_logo");
      localStorage.setItem("inv_prefix", prefix);
      localStorage.setItem("inv_number", nextNumber);
      localStorage.setItem("inv_terms", paymentTerms);
      localStorage.setItem("inv_tax", taxRate);
      localStorage.setItem("inv_discount", discountRate);
      localStorage.setItem("inv_primary", primaryColor);
      localStorage.setItem("inv_secondary", secondaryColor);
      localStorage.setItem("inv_align", logoAlignment);
      localStorage.setItem("inv_show_ship", String(showShippingAddress));
      localStorage.setItem("inv_show_terms", String(showTerms));
      localStorage.setItem("inv_notes", customerNotes);
      localStorage.setItem("inv_terms_cond", termsAndConditions);
    }

    setTimeout(() => {
      setSaving(false);
      setToastMessage("Invoice customization settings saved successfully!");
    }, 800);
  };

  // Toast Auto-hide timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Compute mock due date based on payment terms
  const computedDueDate = () => {
    const today = new Date();
    if (paymentTerms === "Net 15") today.setDate(today.getDate() + 15);
    else if (paymentTerms === "Net 30") today.setDate(today.getDate() + 30);
    else if (paymentTerms === "Net 60") today.setDate(today.getDate() + 60);
    return today.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Pre-calculated mock invoice amounts
  const subTotal = 150000;
  const discountVal = (subTotal * (parseFloat(discountRate) || 0)) / 100;
  const taxableVal = subTotal - discountVal;
  const taxVal = (taxableVal * (parseFloat(taxRate) || 0)) / 100;
  const totalVal = taxableVal + taxVal;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Back Navigation & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors text-[13px] font-semibold mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Invoice Settings</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Configure prefixes, tax settings, branding, and PDF templates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Settings Form panel */}
        <form onSubmit={handleSaveSettings} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6 lg:col-span-5 xl:col-span-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-[14.5px] font-bold text-zinc-900">Customization Panel</h2>
          </div>

          {/* Logo Upload dropzone */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Company Logo</label>
            {logo ? (
              <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-xl bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-12 border border-zinc-200 bg-white rounded overflow-hidden flex items-center justify-center">
                    <img src={logo} alt="Company Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">Custom logo uploaded</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                  title="Remove Logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-300 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-zinc-400 mb-1.5" />
                <p className="text-[12px] font-medium text-zinc-700">Upload logo image</p>
                <p className="text-[10px] text-zinc-400 mt-1">PNG/JPG, max 2MB</p>
              </div>
            )}
          </div>

          {/* Prefix & Next Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Invoice Prefix</label>
              <input
                type="text"
                required
                className={FIELD}
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Next Invoice#</label>
              <input
                type="number"
                required
                className={FIELD}
                value={nextNumber}
                onChange={(e) => setNextNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Default tax, discount, terms */}
          <div className="grid grid-cols-3 gap-3 border-t border-zinc-100 pt-5">
            <div className="col-span-3">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Default Payment Terms</label>
              <div className="relative">
                <select
                  className={SELECT}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15 days</option>
                  <option value="Net 30">Net 30 days</option>
                  <option value="Net 60">Net 60 days</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Default Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className={FIELD}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className={FIELD}
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
              />
            </div>
          </div>

          {/* Theme Colors branding */}
          <div className="space-y-4 border-t border-zinc-100 pt-5">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-zinc-400" />
                Theme Configuration
              </label>

              {/* Primary Color presets */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Primary Accent Color</span>
                <div className="flex flex-wrap gap-2 items-center">
                  {PRIMARY_PRESETS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setPrimaryColor(color.value)}
                      className={cn(
                        "w-6 h-6 rounded-full border border-zinc-200 relative transition-transform hover:scale-105 active:scale-95",
                        primaryColor === color.value ? "ring-2 ring-blue-500 ring-offset-2 scale-105" : ""
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                  {/* Custom color input */}
                  <input
                    type="color"
                    className="w-6 h-6 rounded-full overflow-hidden border border-zinc-300 cursor-pointer shadow-sm relative"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    title="Custom Primary Color"
                  />
                </div>
              </div>

              {/* Secondary Color presets */}
              <div className="space-y-2 mt-3">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Secondary Accent (Table BG)</span>
                <div className="flex flex-wrap gap-2 items-center">
                  {SECONDARY_PRESETS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSecondaryColor(color.value)}
                      className={cn(
                        "w-6 h-6 rounded-full border border-zinc-200 relative transition-transform hover:scale-105 active:scale-95",
                        secondaryColor === color.value ? "ring-2 ring-blue-500 ring-offset-2 scale-105" : ""
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                  {/* Custom color input */}
                  <input
                    type="color"
                    className="w-6 h-6 rounded-full overflow-hidden border border-zinc-300 cursor-pointer shadow-sm relative"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    title="Custom Secondary Color"
                  />
                </div>
              </div>
            </div>

            {/* Logo alignment */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Header Logo Alignment</label>
              <div className="flex gap-2">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => setLogoAlignment(align as any)}
                    className={cn(
                      "flex-1 py-1.5 text-[12px] font-bold border rounded-lg transition-all capitalize",
                      logoAlignment === align
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                        : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Toggles checkboxes */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500/20"
                  checked={showShippingAddress}
                  onChange={(e) => setShowShippingAddress(e.target.checked)}
                />
                <span className="text-[12.5px] font-medium text-zinc-700">Shipping Address</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500/20"
                  checked={showTerms}
                  onChange={(e) => setShowTerms(e.target.checked)}
                />
                <span className="text-[12.5px] font-medium text-zinc-700">Terms &amp; Conditions</span>
              </label>
            </div>
          </div>

          {/* Default Notes fields */}
          <div className="space-y-4 border-t border-zinc-100 pt-5">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Default Customer Notes</label>
              <textarea
                rows={2}
                className={FIELD}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Default Terms &amp; Conditions</label>
              <textarea
                rows={2}
                className={FIELD}
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
              />
            </div>
          </div>

          {/* Save Action Footer */}
          <div className="pt-4 border-t border-zinc-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>

        {/* Right Column: Live Mock Invoice Preview */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-lg max-w-max">
            <Eye className="w-4.5 h-4.5 text-zinc-400" />
            <span>Interactive Invoice Live Preview</span>
          </div>

          {/* Mini mock invoice container */}
          <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] text-[12px] min-h-[500px] flex flex-col justify-between select-none">
            
            {/* Header section (depends on Logo Alignment) */}
            <div className="space-y-6">
              <div
                className={cn(
                  "flex flex-col gap-4",
                  logoAlignment === "left" && "sm:flex-row justify-between items-start",
                  logoAlignment === "right" && "sm:flex-row-reverse justify-between items-start",
                  logoAlignment === "center" && "items-center text-center"
                )}
              >
                {/* Logo wrapper */}
                <div>
                  {logo ? (
                    <img src={logo} alt="Invoice Logo" className="max-h-16 max-w-[200px] object-contain" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-sm">
                        <Logo className="w-5.5 h-5.5" />
                      </div>
                      <span className="font-extrabold text-[14px] text-zinc-900">Demand Tech</span>
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px]">Vikarah Tech Private Limited • Pune, Maharashtra</p>
                </div>

                {/* Invoice Title Header */}
                <div className={cn("space-y-1", logoAlignment === "right" ? "sm:text-left" : "sm:text-right")}>
                  <h2 className="text-[20px] font-black tracking-tight" style={{ color: primaryColor }}>INVOICE</h2>
                  <p className="font-mono text-zinc-950 font-bold">#{prefix}{nextNumber}</p>
                </div>
              </div>

              {/* Invoice details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-zinc-100 py-4">
                <div>
                  <span className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide mb-0.5">Date</span>
                  <span className="font-semibold text-zinc-900">
                    {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div>
                  <span className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide mb-0.5">Due Date</span>
                  <span className="font-semibold text-zinc-900">{computedDueDate()}</span>
                </div>
                <div>
                  <span className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide mb-0.5">Payment Terms</span>
                  <span className="font-semibold text-zinc-900">{paymentTerms}</span>
                </div>
                <div>
                  <span className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide mb-0.5">Sales Person</span>
                  <span className="font-semibold text-zinc-900">Sanjog Adhav</span>
                </div>
              </div>

              {/* Billing Info addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">Bill To</span>
                  <p className="font-bold text-zinc-900">Acme Corporation</p>
                  <p className="text-zinc-500 leading-relaxed text-[11px]">
                    102, Innovation Towers, Senapati Bapat Road,<br />
                    Pune, MH, 411016
                  </p>
                </div>
                {showShippingAddress && (
                  <div className="space-y-1">
                    <span className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">Ship To</span>
                    <p className="font-bold text-zinc-900">Acme Corp - Logistics Unit</p>
                    <p className="text-zinc-500 leading-relaxed text-[11px]">
                      Plot No. 44, Talawade IT Park,<br />
                      Pune, MH, 411044
                    </p>
                  </div>
                )}
              </div>

              {/* Mock items table */}
              <div className="border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-white text-[9.5px] font-bold uppercase tracking-wider" style={{ backgroundColor: primaryColor }}>
                      <th className="px-4 py-2">Item Details</th>
                      <th className="px-4 py-2 text-right w-16">Qty</th>
                      <th className="px-4 py-2 text-right w-24">Rate</th>
                      <th className="px-4 py-2 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr className="hover:bg-zinc-50/50">
                      <td className="px-4 py-2.5">
                        <span className="font-semibold text-zinc-900 block">Software Engineering Services</span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">Development of DemandERP custom extensions & portals</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-zinc-500 tabular-nums">1.00</td>
                      <td className="px-4 py-2.5 text-right font-mono text-zinc-500 tabular-nums">₹1,50,000.00</td>
                      <td className="px-4 py-2.5 text-right font-mono text-zinc-950 font-bold tabular-nums">₹1,50,000.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Calculations sum block */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 border-zinc-100 text-[11.5px] font-medium">
                  <div className="flex justify-between text-zinc-500">
                    <span>Sub Total:</span>
                    <span className="font-mono text-zinc-800">₹{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>

                  {parseFloat(discountRate) > 0 && (
                    <div className="flex justify-between text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      <span>Discount ({discountRate}%):</span>
                      <span className="font-mono font-bold">-₹{discountVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-500">
                    <span>Tax ({taxRate}%):</span>
                    <span className="font-mono text-zinc-800">₹{taxVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between text-[13px] font-bold text-zinc-950 border-t border-zinc-200/80 pt-2" style={{ borderTopColor: primaryColor }}>
                    <span>Total Amount:</span>
                    <span className="font-mono">₹{totalVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer notes & Terms section */}
            <div className="border-t border-zinc-100 pt-6 mt-8 space-y-4">
              {customerNotes && (
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1">Customer Notes</span>
                  <p className="text-[10px] text-zinc-500 leading-normal whitespace-pre-line">{customerNotes}</p>
                </div>
              )}

              {showTerms && termsAndConditions && (
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1">Terms &amp; Conditions</span>
                  <p className="text-[10px] text-zinc-500 leading-normal whitespace-pre-line">{termsAndConditions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Success Toast alert banner */}
      <div
        className={cn(
          "fixed bottom-5 right-5 bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm transition-all duration-300 z-50 transform",
          toastMessage ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
        )}
      >
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <span className="text-[12.5px] font-semibold">{toastMessage}</span>
        <button
          onClick={() => setToastMessage(null)}
          className="text-zinc-400 hover:text-zinc-200 ml-auto"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

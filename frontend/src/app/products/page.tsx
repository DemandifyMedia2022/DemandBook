"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Package,
  SlidersHorizontal,
  Upload,
  Trash2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Product {
  id?: number;
  custom_id: string; // SKU
  name: string;
  category: string;
  price: number; // selling_price is price
  status: "in stock" | "low stock" | "out of stock" | "In Stock" | "Low Stock" | "Out of Stock";
  stock: number;
  type: "Goods" | "Service";
  unit: string;
  hsn_code?: string;
  tax_preference: string;
  image_url?: string;
  selling_price: number;
  sales_account?: string;
  sales_description?: string;
  cost_price: number;
  purchase_account?: string;
  purchase_description?: string;
  preferred_vendor_id?: number | null;
  intra_state_tax_rate: string;
  inter_state_tax_rate: string;
  track_inventory: boolean;
}

interface Account {
  id: number;
  account_code: string;
  account_name: string;
  account_type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
}

interface Vendor {
  id: number;
  custom_id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  string,
  { dot: string; text: string; bg: string; icon: React.ReactNode }
> = {
  "in stock": { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-3 h-3" /> },
  "low stock": { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", icon: <AlertTriangle className="w-3 h-3" /> },
  "out of stock": { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", icon: <XCircle className="w-3 h-3" /> },
  "In Stock": { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-3 h-3" /> },
  "Low Stock": { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", icon: <AlertTriangle className="w-3 h-3" /> },
  "Out of Stock": { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", icon: <XCircle className="w-3 h-3" /> },
};

const STATUSES = ["All", "In Stock", "Low Stock", "Out of Stock"] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) {
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function getStatusKey(status: string): string {
  const s = status.toLowerCase();
  if (s === "in stock" || s === "low stock" || s === "out of stock") return s;
  return "in stock";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatCard({ label, value, delta }: { label: string; value: string; delta?: number }) {
  const positive = delta !== undefined && delta >= 0;
  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-zinc-500">{label}</span>
        {delta !== undefined && (
          <span className={cn(
            "inline-flex items-center gap-0.5 text-[12px] font-medium px-1.5 py-0.5 rounded-full",
            positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          )}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <span className="text-[26px] font-semibold text-zinc-900 tabular-nums tracking-tight">{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const key = getStatusKey(status);
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG["in stock"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full", cfg.bg, cfg.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {key === "in stock" ? "In Stock" : key === "low stock" ? "Low Stock" : "Out of Stock"}
    </span>
  );
}

function StockBar({ stock, status }: { stock: number; status: string }) {
  const key = getStatusKey(status);
  const barColor =
    key === "out of stock" ? "bg-red-400" :
      key === "low stock" ? "bg-amber-400" :
        "bg-emerald-500";
  const maxStock = 500;
  const pct = Math.min((stock / maxStock) * 100, 100);

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[13px] text-zinc-500 tabular-nums w-8">{stock}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add / Edit Product Modal
// ---------------------------------------------------------------------------
const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
const SELECT = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 cursor-pointer appearance-none";

function AddProductModal({
  onClose,
  onSave,
  accounts,
  vendors,
  editProduct
}: {
  onClose: () => void;
  onSave: (p: Partial<Product>) => void;
  accounts: Account[];
  vendors: Vendor[];
  editProduct: Product | null;
}) {
  const [type, setType] = useState<"Goods" | "Service">("Goods");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [customId, setCustomId] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [hsnCode, setHsnCode] = useState("");
  const [taxPreference, setTaxPreference] = useState("Taxable");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("0");

  const [sellingPrice, setSellingPrice] = useState("");
  const [salesAccount, setSalesAccount] = useState("");
  const [salesDescription, setSalesDescription] = useState("");

  const [costPrice, setCostPrice] = useState("");
  const [purchaseAccount, setPurchaseAccount] = useState("");
  const [purchaseDescription, setPurchaseDescription] = useState("");
  const [preferredVendorId, setPreferredVendorId] = useState<string>("");

  const [intraStateTaxRate, setIntraStateTaxRate] = useState("GST18 (18 %)");
  const [interStateTaxRate, setInterStateTaxRate] = useState("IGST18 (18 %)");
  const [trackInventory, setTrackInventory] = useState(true);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Filter accounts
  const salesAccounts = accounts.filter(a => a.account_type === "Revenue");
  const expenseAccounts = accounts.filter(a => a.account_type === "Expense");

  useEffect(() => {
    if (editProduct) {
      setType(editProduct.type || "Goods");
      setName(editProduct.name || "");
      setCategory(editProduct.category || "General");
      setCustomId(editProduct.custom_id || "");
      setUnit(editProduct.unit || "pcs");
      setHsnCode(editProduct.hsn_code || "");
      setTaxPreference(editProduct.tax_preference || "Taxable");
      setImageUrl(editProduct.image_url || "");
      setImagePreview(editProduct.image_url || null);
      setStock(String(editProduct.stock || 0));
      setSellingPrice(String(editProduct.selling_price || editProduct.price || ""));
      setSalesAccount(editProduct.sales_account || "");
      setSalesDescription(editProduct.sales_description || "");
      setCostPrice(String(editProduct.cost_price || ""));
      setPurchaseAccount(editProduct.purchase_account || "");
      setPurchaseDescription(editProduct.purchase_description || "");
      setPreferredVendorId(editProduct.preferred_vendor_id ? String(editProduct.preferred_vendor_id) : "");
      setIntraStateTaxRate(editProduct.intra_state_tax_rate || "GST18 (18 %)");
      setInterStateTaxRate(editProduct.inter_state_tax_rate || "IGST18 (18 %)");
      setTrackInventory(editProduct.track_inventory ?? true);
    } else {
      setType("Goods");
      setName("");
      setCategory("General");
      setCustomId(`SKU-${Math.floor(10000 + Math.random() * 90000)}`);
      setUnit("pcs");
      setHsnCode("");
      setTaxPreference("Taxable");
      setImageUrl("");
      setImagePreview(null);
      setStock("0");
      setSellingPrice("");
      setSalesAccount("");
      setSalesDescription("");
      setCostPrice("");
      setPurchaseAccount("");
      setPurchaseDescription("");
      setPreferredVendorId("");
      setIntraStateTaxRate("GST18 (18 %)");
      setInterStateTaxRate("IGST18 (18 %)");
      setTrackInventory(true);
    }
  }, [editProduct]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sellingPrice) return;

    onSave({
      custom_id: customId,
      name,
      category,
      price: parseFloat(sellingPrice),
      stock: parseInt(stock) || 0,
      type,
      unit,
      hsn_code: hsnCode,
      tax_preference: taxPreference,
      image_url: imageUrl,
      selling_price: parseFloat(sellingPrice),
      sales_account: salesAccount,
      sales_description: salesDescription,
      cost_price: costPrice ? parseFloat(costPrice) : 0,
      purchase_account: purchaseAccount,
      purchase_description: purchaseDescription,
      preferred_vendor_id: preferredVendorId ? parseInt(preferredVendorId) : null,
      intra_state_tax_rate: intraStateTaxRate,
      inter_state_tax_rate: interStateTaxRate,
      track_inventory: trackInventory
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[840px] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h3 className="text-[16px] font-semibold text-zinc-900">{editProduct ? "Edit Item" : "New Item"}</h3>
            <p className="text-[12px] text-zinc-500 mt-0.5">Manage details of catalog goods and services</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: General Details */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">General Information</h4>
              
              {/* Type selector */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType("Goods")}
                    className={cn(
                      "flex-1 py-2 text-[13px] font-semibold border rounded-lg transition-colors",
                      type === "Goods"
                        ? "bg-zinc-900 border-zinc-900 text-white"
                        : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    Goods
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("Service")}
                    className={cn(
                      "flex-1 py-2 text-[13px] font-semibold border rounded-lg transition-colors",
                      type === "Service"
                        ? "bg-zinc-900 border-zinc-900 text-white"
                        : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    Service
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Name</label>
                <input
                  required
                  placeholder="Item Name"
                  className={FIELD}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Category & SKU */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">SKU / Item Code</label>
                  <input
                    required
                    className={FIELD}
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Category</label>
                  <input
                    className={FIELD}
                    placeholder="General"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>

              {/* Unit & HSN Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Unit</label>
                  <div className="relative">
                    <select
                      className={SELECT}
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      <option value="pcs">pcs (Pieces)</option>
                      <option value="box">box (Box)</option>
                      <option value="kg">kg (Kilograms)</option>
                      <option value="g">g (Grams)</option>
                      <option value="m">m (Meters)</option>
                      <option value="in">in (Inches)</option>
                      <option value="units">units (Units)</option>
                      <option value="hrs">hrs (Hours)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">HSN Code</label>
                  <input
                    placeholder="e.g. 84713010"
                    className={FIELD}
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                  />
                </div>
              </div>

              {/* Tax Preference */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Tax Preference</label>
                <div className="flex gap-4 items-center mt-1">
                  <label className="flex items-center gap-2 text-[13px] text-zinc-700 cursor-pointer">
                    <input
                      type="radio"
                      name="taxPreference"
                      value="Taxable"
                      checked={taxPreference === "Taxable"}
                      onChange={() => setTaxPreference("Taxable")}
                      className="text-[#5B5FEF] focus:ring-[#5B5FEF]"
                    />
                    Taxable
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-zinc-700 cursor-pointer">
                    <input
                      type="radio"
                      name="taxPreference"
                      value="Tax Exempt"
                      checked={taxPreference === "Tax Exempt"}
                      onChange={() => setTaxPreference("Tax Exempt")}
                      className="text-[#5B5FEF] focus:ring-[#5B5FEF]"
                    />
                    Tax Exempt
                  </label>
                </div>
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Item Image</label>
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-300 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-200 bg-white">
                      <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setImagePreview(null);
                          setImageUrl("");
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-zinc-400 group-hover:text-zinc-500 transition-colors mb-2" />
                      <p className="text-[12px] font-medium text-zinc-700">Drag image(s) here or <span className="text-[#5B5FEF] font-semibold">Browse images</span></p>
                      <p className="text-[10px] text-zinc-400 mt-1">No file chosen</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sales & Purchase Information */}
            <div className="space-y-5">
              
              {/* Sales Info Section */}
              <div className="p-4 bg-zinc-50/50 border border-zinc-200/60 rounded-xl space-y-3.5">
                <h4 className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 pb-1.5">Sales Information</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Selling Price</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        required
                        placeholder="0.00"
                        className={cn(FIELD, "pl-11")}
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-zinc-400">INR</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Account</label>
                    <div className="relative">
                      <select
                        className={SELECT}
                        value={salesAccount}
                        onChange={(e) => setSalesAccount(e.target.value)}
                      >
                        <option value="">Choose Account</option>
                        {salesAccounts.map(a => (
                          <option key={a.id} value={a.account_name}>{a.account_code} - {a.account_name}</option>
                        ))}
                        {salesAccounts.length === 0 && <option value="Sales">Sales Account (Default)</option>}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea
                    placeholder="Sales transaction notes..."
                    rows={2}
                    className={FIELD}
                    value={salesDescription}
                    onChange={(e) => setSalesDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Purchase Info Section */}
              <div className="p-4 bg-zinc-50/50 border border-zinc-200/60 rounded-xl space-y-3.5">
                <h4 className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 pb-1.5">Purchase Information</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Cost Price</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="0.00"
                        className={cn(FIELD, "pl-11")}
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-zinc-400">INR</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Account</label>
                    <div className="relative">
                      <select
                        className={SELECT}
                        value={purchaseAccount}
                        onChange={(e) => setPurchaseAccount(e.target.value)}
                      >
                        <option value="">Choose Account</option>
                        {expenseAccounts.map(a => (
                          <option key={a.id} value={a.account_name}>{a.account_code} - {a.account_name}</option>
                        ))}
                        {expenseAccounts.length === 0 && <option value="Cost of Goods Sold">Cost of Goods Sold (Default)</option>}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Preferred Vendor</label>
                    <div className="relative">
                      <select
                        className={SELECT}
                        value={preferredVendorId || ""}
                        onChange={(e) => setPreferredVendorId(e.target.value)}
                      >
                        <option value="">Choose Vendor</option>
                        {vendors.map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.custom_id})</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea
                    placeholder="Purchase notes..."
                    rows={2}
                    className={FIELD}
                    value={purchaseDescription}
                    onChange={(e) => setPurchaseDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Tax Rates */}
              <div className="p-4 bg-zinc-50/50 border border-zinc-200/60 rounded-xl space-y-3">
                <h4 className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider pb-1">Default Tax Rates</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Intra State Tax Rate</label>
                    <div className="relative">
                      <select
                        className={SELECT}
                        value={intraStateTaxRate}
                        onChange={(e) => setIntraStateTaxRate(e.target.value)}
                      >
                        <option value="GST18 (18 %)">GST18 (18 %)</option>
                        <option value="GST12 (12 %)">GST12 (12 %)</option>
                        <option value="GST5 (5 %)">GST5 (5 %)</option>
                        <option value="GST28 (28 %)">GST28 (28 %)</option>
                        <option value="GST0 (0 %)">GST0 (0 %)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Inter State Tax Rate</label>
                    <div className="relative">
                      <select
                        className={SELECT}
                        value={interStateTaxRate}
                        onChange={(e) => setInterStateTaxRate(e.target.value)}
                      >
                        <option value="IGST18 (18 %)">IGST18 (18 %)</option>
                        <option value="IGST12 (12 %)">IGST12 (12 %)</option>
                        <option value="IGST5 (5 %)">IGST5 (5 %)</option>
                        <option value="IGST28 (28 %)">IGST28 (28 %)</option>
                        <option value="IGST0 (0 %)">IGST0 (0 %)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Track Inventory Toggle */}
              <div className="p-4 bg-zinc-50/50 border border-zinc-200/60 rounded-xl space-y-2">
                <label className="flex items-center gap-2.5 font-semibold text-[13px] text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trackInventory}
                    onChange={(e) => setTrackInventory(e.target.checked)}
                    className="w-4 h-4 text-[#5B5FEF] focus:ring-[#5B5FEF] rounded"
                  />
                  Track Inventory for this item
                </label>
                <p className="text-[11px] text-amber-600 font-medium leading-relaxed pl-6">
                  You cannot enable/disable inventory tracking once you&apos;ve created transactions for this item
                </p>
                {trackInventory && (
                  <div className="pl-6 pt-2">
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">Opening Stock</label>
                    <input
                      type="number"
                      min={0}
                      className={cn(FIELD, "w-32")}
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-zinc-100 flex items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm"
            >
              Save Item
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function AdjustStockModal({
  product,
  onClose,
  onSave
}: {
  product: Product;
  onClose: () => void;
  onSave: (id: number, stockQty: number) => void;
}) {
  const [qty, setQty] = useState(String(product.stock));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product.id) {
      onSave(product.id, parseInt(qty) || 0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[380px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-[15px] font-semibold text-zinc-900">Adjust Stock</h3>
            <p className="text-[12px] text-zinc-500 mt-0.5">{product.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-between">
            <span className="text-[12px] font-medium text-zinc-500">Current Stock</span>
            <span className="text-[13px] font-semibold text-zinc-900 tabular-nums">{product.stock} units</span>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">New Quantity</label>
            <input
              type="number"
              required
              min={0}
              placeholder="Enter new stock quantity"
              className={FIELD}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm"
            >
              Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch baseline accounts, vendors, and products from server
  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // 1. Fetch products
      const pRes = await fetch("http://localhost:8888/api/product/list", { headers });
      const pData = await pRes.json();
      if (pData.success) {
        setProducts(pData.products);
      }

      // 2. Fetch chart of accounts
      const aRes = await fetch("http://localhost:8888/api/accountant/chart-of-accounts", { headers });
      const aData = await aRes.json();
      if (aData.success) {
        setAccounts(aData.accounts || aData.chartOfAccounts || []);
      }

      // 3. Fetch vendors
      const vRes = await fetch("http://localhost:8888/api/client/list?type=vendor", { headers });
      const vData = await vRes.json();
      if (vData.success) {
        setVendors(vData.clients || []);
      }

    } catch (e) {
      console.error("Failed to load catalog data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category || "General")))];

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.custom_id.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;

    const statusKey = getStatusKey(p.status);
    let matchesStatus = true;
    if (selectedStatus !== "All") {
      const selectedLower = selectedStatus.toLowerCase();
      matchesStatus = statusKey === selectedLower;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const inventoryValue = products.reduce((s, p) => s + (p.stock || 0) * (p.price || 0), 0);
  const outOfStock = products.filter((p) => getStatusKey(p.status) === "out of stock").length;
  const lowStock = products.filter((p) => getStatusKey(p.status) === "low stock").length;

  const handleSave = async (productData: Partial<Product>) => {
    const token = localStorage.getItem("token");
    try {
      let url = "http://localhost:8888/api/product/create";
      let method = "POST";

      if (editingProduct && editingProduct.id) {
        url = `http://localhost:8888/api/product/${editingProduct.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      if (data.success) {
        loadData();
        setShowAddModal(false);
        setEditingProduct(null);
      } else {
        alert(data.message || "Failed to save item.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving item.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item? This action will remove it from inventory logs.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8888/api/product/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.message || "Failed to delete item.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting item.");
    }
  };

  const handleAdjust = async (id: number, qty: number) => {
    const token = localStorage.getItem("token");
    const status = qty === 0 ? "out of stock" : qty < 20 ? "low stock" : "in stock";

    try {
      const res = await fetch(`http://localhost:8888/api/product/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: qty, status }),
      });

      const data = await res.json();
      if (data.success) {
        loadData();
        setAdjustProduct(null);
      } else {
        alert(data.message || "Failed to adjust stock.");
      }
    } catch (e) {
      console.error(e);
      alert("Error adjusting stock.");
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Items Catalog</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">Manage goods, services, custom pricing, and inventory levels.</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Item
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Items" value={String(products.length)} />
          <StatCard label="Inventory Value" value={fmt(inventoryValue)} />
          <StatCard label="Out of Stock" value={String(outOfStock)} />
          <StatCard label="Low Stock Alerts" value={String(lowStock)} />
        </div>

        {/* Table card */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900 font-sans">Active Catalog</h2>
              <p className="text-[12px] text-zinc-500">
                {loading ? "Loading items..." : `Showing ${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative w-52">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors"
                />
              </div>

              {/* Category filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer text-zinc-700"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer text-zinc-700"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/40">
                {[
                  ["Item Name", ""],
                  ["SKU / HSN", ""],
                  ["Type", ""],
                  ["Category", ""],
                  ["Rate (Selling / Cost)", "text-right"],
                  ["Stock Level", ""],
                  ["Status", ""],
                  ["Actions", "text-right"],
                ].map(([h, cls], i) => (
                  <th key={i} className={cn("px-6 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wide", cls)}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((product) => (
                <tr key={product.id || product.custom_id} className="hover:bg-zinc-50/70 transition-colors cursor-pointer group">

                  {/* Product Name */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-100 flex items-center justify-center flex-shrink-0 relative border border-zinc-200/60">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill sizes="36px" className="object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-zinc-900">{product.name}</p>
                        {product.unit && <p className="text-[11px] text-zinc-400">per {product.unit}</p>}
                      </div>
                    </div>
                  </td>

                  {/* SKU / HSN */}
                  <td className="px-6 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[12px] font-bold text-[#5B5FEF]">{product.custom_id}</span>
                      {product.hsn_code && <span className="text-[10px] text-zinc-400">HSN: {product.hsn_code}</span>}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-3.5 text-[13px]">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-bold",
                      product.type === "Service" 
                        ? "bg-purple-50 text-purple-700 border border-purple-200/50" 
                        : "bg-blue-50 text-blue-700 border border-blue-200/50"
                    )}>
                      {product.type || "Goods"}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-3.5 text-[13px] text-zinc-500">{product.category || "General"}</td>

                  {/* Price */}
                  <td className="px-6 py-3.5 text-right font-mono text-[13px] tabular-nums">
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900">S: {fmt(product.price || product.selling_price || 0)}</span>
                      {product.cost_price > 0 && <span className="text-[11px] text-zinc-400">C: {fmt(product.cost_price)}</span>}
                    </div>
                  </td>

                  {/* Stock bar */}
                  <td className="px-6 py-3.5">
                    {product.track_inventory ? (
                      <StockBar stock={product.stock || 0} status={product.status} />
                    ) : (
                      <span className="text-[12px] text-zinc-400 italic">No Tracking</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3.5">
                    {product.track_inventory ? (
                      <StatusPill status={product.status} />
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full bg-zinc-50 text-zinc-500">
                        Active
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      {product.track_inventory && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdjustProduct(product);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[12px] font-semibold text-[#5B5FEF] border border-[#5B5FEF]/20 bg-[#5B5FEF]/5 rounded-lg hover:bg-[#5B5FEF]/10 transition-colors whitespace-nowrap shadow-sm"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          Adjust
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct(product);
                          setShowAddModal(true);
                        }}
                        className="inline-flex items-center px-2 py-1 text-[12px] font-bold text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg transition-colors shadow-sm"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.id) handleDeleteProduct(product.id);
                        }}
                        className="inline-flex items-center px-2 py-1 text-[12px] font-bold text-red-600 bg-white border border-red-200/60 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shadow-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-7 h-7 text-zinc-200" />
                      <p className="text-[13px] text-zinc-400 font-medium">No items match your catalog filters.</p>
                      <button
                        onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedStatus("All"); }}
                        className="text-[12px] text-[#5B5FEF] font-bold hover:underline mt-1"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer */}
          {filtered.length > 0 && !loading && (
            <div className="px-6 py-3.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <span className="text-[12px] text-zinc-400 font-medium">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""}
              </span>
              <span className="text-[13px] font-bold text-zinc-900 tabular-nums font-mono">
                Total Value: {fmt(filtered.reduce((s, p) => s + (p.stock || 0) * (p.price || 0), 0))}
              </span>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddProductModal
          accounts={accounts}
          vendors={vendors}
          editProduct={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
        />
      )}

      {adjustProduct && (
        <AdjustStockModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSave={handleAdjust}
        />
      )}
    </div>
  );
}
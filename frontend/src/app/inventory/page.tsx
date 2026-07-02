"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  AlertCircle,
  Download,
  ChevronDown,
  MoreHorizontal,
  X,
  Upload,
  Calendar,
  AlertTriangle,
  FileText,
  Trash2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AdjustmentItem {
  id?: number;
  adjustment_id?: number;
  product_id: number;
  product_name?: string;
  product_sku?: string;
  quantity_available: number;
  new_quantity_on_hand: number;
  quantity_adjusted: number;
  value_adjusted: number;
}

interface Adjustment {
  id: number;
  mode: "Quantity" | "Value";
  reference_number: string;
  adjustment_date: string;
  account_name: string;
  reason: string;
  description: string;
  status: "Approved" | "Draft";
  created_at: string;
  items: AdjustmentItem[];
  attachments?: { id: number; file_name: string }[];
}

interface Product {
  id: number;
  custom_id: string; // SKU
  name: string;
  stock: number;
  price: number; // selling_price
  cost_price: number;
  status: string;
}

interface Account {
  id: number;
  account_code: string;
  account_name: string;
  account_type: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) {
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const REASONS = [
  "Inventory Count",
  "Damaged Goods",
  "Theft / Loss",
  "Restocking",
  "Stock Transfer",
  "Write-off"
];

// ---------------------------------------------------------------------------
// New/Edit Adjustment Modal
// ---------------------------------------------------------------------------
const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-zinc-800 placeholder:text-zinc-400";
const SELECT = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-zinc-800 cursor-pointer appearance-none";

function NewAdjustmentModal({
  onClose,
  onSave,
  products,
  accounts,
  editAdjustment
}: {
  onClose: () => void;
  onSave: (adj: any) => void;
  products: Product[];
  accounts: Account[];
  editAdjustment: Adjustment | null;
}) {
  const [mode, setMode] = useState<"Quantity" | "Value">("Quantity");
  const [refNum, setRefNum] = useState("");
  const [date, setDate] = useState("");
  const [accountName, setAccountName] = useState("");
  const [reason, setReason] = useState("Inventory Count");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Approved" | "Draft">("Approved");

  // Multi-row item selection state
  const [items, setItems] = useState<Array<{
    product_id: string;
    quantity_available: number;
    new_quantity_on_hand: number;
    quantity_adjusted: number;
    value_adjusted: number;
  }>>([{ product_id: "", quantity_available: 0, new_quantity_on_hand: 0, quantity_adjusted: 0, value_adjusted: 0 }]);

  // Attached files state
  const [attachments, setAttachments] = useState<Array<{ file_name: string; file_data: string }>>([]);

  useEffect(() => {
    if (editAdjustment) {
      setMode(editAdjustment.mode);
      setRefNum(editAdjustment.reference_number);
      // Ensure date format matches yyyy-MM-dd
      setDate(new Date(editAdjustment.adjustment_date).toISOString().split("T")[0]);
      setAccountName(editAdjustment.account_name || "");
      setReason(editAdjustment.reason);
      setDescription(editAdjustment.description || "");
      setStatus(editAdjustment.status);

      if (editAdjustment.items && editAdjustment.items.length > 0) {
        setItems(editAdjustment.items.map(item => ({
          product_id: String(item.product_id),
          quantity_available: Number(item.quantity_available),
          new_quantity_on_hand: Number(item.new_quantity_on_hand),
          quantity_adjusted: Number(item.quantity_adjusted),
          value_adjusted: Number(item.value_adjusted || 0)
        })));
      }

      if (editAdjustment.attachments) {
        setAttachments(editAdjustment.attachments.map(att => ({
          file_name: att.file_name,
          file_data: "" // Placeholder since we don't edit original uploaded content unless custom files added
        })));
      }
    } else {
      setRefNum(`ADJ-${Math.floor(10000 + Math.random() * 90000)}`);
      setDate(new Date().toISOString().split("T")[0]);
      setMode("Quantity");
      setAccountName("");
      setReason("Inventory Count");
      setDescription("");
      setStatus("Approved");
      setItems([{ product_id: "", quantity_available: 0, new_quantity_on_hand: 0, quantity_adjusted: 0, value_adjusted: 0 }]);
      setAttachments([]);
    }
  }, [editAdjustment]);

  const handleAddRow = () => {
    setItems([...items, { product_id: "", quantity_available: 0, new_quantity_on_hand: 0, quantity_adjusted: 0, value_adjusted: 0 }]);
  };

  const handleRemoveRow = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const handleProductSelect = (idx: number, prodId: string) => {
    const selectedProd = products.find(p => String(p.id) === prodId);
    const newItems = [...items];
    if (selectedProd) {
      newItems[idx] = {
        ...newItems[idx],
        product_id: prodId,
        quantity_available: selectedProd.stock || 0,
        new_quantity_on_hand: selectedProd.stock || 0,
        quantity_adjusted: 0,
        value_adjusted: 0
      };
    } else {
      newItems[idx] = { product_id: "", quantity_available: 0, new_quantity_on_hand: 0, quantity_adjusted: 0, value_adjusted: 0 };
    }
    setItems(newItems);
  };

  const handleNewQtyChange = (idx: number, val: string) => {
    const newQty = parseFloat(val) || 0;
    const newItems = [...items];
    const item = newItems[idx];
    const diff = newQty - item.quantity_available;

    const prod = products.find(p => String(p.id) === item.product_id);
    const price = prod ? prod.price : 0;

    newItems[idx] = {
      ...item,
      new_quantity_on_hand: newQty,
      quantity_adjusted: diff,
      value_adjusted: diff * price
    };
    setItems(newItems);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const allowedCount = 5 - attachments.length;
      const filesArr = Array.from(files).slice(0, allowedCount);

      filesArr.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Max size is 10MB.`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments(prev => [...prev, {
            file_name: file.name,
            file_data: reader.result as string
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveFile = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(item => item.product_id !== "");
    if (validItems.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    onSave({
      mode,
      reference_number: refNum,
      adjustment_date: date,
      account_name: accountName,
      reason,
      description,
      status,
      items: validItems,
      attachments
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0 bg-zinc-50/50">
          <div>
            <h3 className="text-[16px] font-semibold text-zinc-900">{editAdjustment ? "Edit Adjustment" : "New Adjustment"}</h3>
            <p className="text-[12px] text-zinc-500 mt-0.5">Record warehouse inventory stock change</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Mode Tab selector */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Mode of adjustment</label>
            <div className="flex gap-2 w-72">
              <button
                type="button"
                onClick={() => setMode("Quantity")}
                className={cn(
                  "flex-1 py-1.5 text-[13px] font-semibold border rounded-lg transition-colors",
                  mode === "Quantity"
                    ? "bg-zinc-900 border-zinc-900 text-white"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                )}
              >
                Quantity Adjustment
              </button>
              <button
                type="button"
                onClick={() => setMode("Value")}
                className={cn(
                  "flex-1 py-1.5 text-[13px] font-semibold border rounded-lg transition-colors",
                  mode === "Value"
                    ? "bg-zinc-900 border-zinc-900 text-white"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                )}
              >
                Value Adjustment
              </button>
            </div>
          </div>

          {/* Form fields row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Reference Number</label>
              <input required className={FIELD} value={refNum} onChange={(e) => setRefNum(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Date</label>
              <div className="relative">
                <input type="date" required className={FIELD} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Account</label>
              <div className="relative">
                <select
                  className={SELECT}
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                >
                  <option value="">Choose Account</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.account_name}>{a.account_code} - {a.account_name}</option>
                  ))}
                  {accounts.length === 0 && <option value="Inventory Adjustment">Inventory Adjustment (Default)</option>}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Reason</label>
              <div className="relative">
                <select
                  className={SELECT}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  {REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Description (Max. 500 characters)</label>
              <textarea
                maxLength={500}
                placeholder="Description of adjustment..."
                className={FIELD}
                rows={1}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Item details table */}
          <div className="space-y-2">
            <h4 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Item Table</h4>
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-200">
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Item Details</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide text-right">Quantity Available</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide text-right">New Quantity on hand</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide text-right">Quantity Adjusted</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide text-center">More Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/40 transition-colors">
                      {/* Product selection */}
                      <td className="p-3 w-72">
                        <div className="relative">
                          <select
                            className={SELECT}
                            value={row.product_id}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                          >
                            <option value="">Select Item</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.custom_id})</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>

                      {/* Qty Available (read-only) */}
                      <td className="p-3 text-right font-mono text-[13px] text-zinc-500 tabular-nums">
                        {row.quantity_available}
                      </td>

                      {/* New Qty Input */}
                      <td className="p-3 w-40">
                        <input
                          type="number"
                          min={0}
                          disabled={!row.product_id}
                          className={cn(FIELD, "text-right font-mono disabled:opacity-50")}
                          value={row.new_quantity_on_hand}
                          onChange={(e) => handleNewQtyChange(idx, e.target.value)}
                        />
                      </td>

                      {/* Qty Adjusted */}
                      <td className={cn(
                        "p-3 text-right font-mono text-[13px] font-semibold tabular-nums",
                        row.quantity_adjusted < 0 ? "text-red-600" : "text-emerald-700"
                      )}>
                        {row.quantity_adjusted > 0 ? `+${row.quantity_adjusted}` : row.quantity_adjusted}
                      </td>

                      {/* Row Delete Actions */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          disabled={items.length === 1}
                          className="p-1 text-zinc-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="p-3 bg-zinc-50/50 border-t border-zinc-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-semibold text-blue-600 border border-blue-200/50 hover:bg-blue-50/50 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Row
                </button>
                <div className="text-[12px] font-semibold text-zinc-600">
                  Total Adjusted Qty:{" "}
                  <span className="font-mono text-zinc-900">
                    {items.reduce((s, i) => s + i.quantity_adjusted, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Attach files */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Attach File(s) to inventory adjustment</label>
            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-300 transition-colors relative cursor-pointer group">
              <input
                type="file"
                multiple
                disabled={attachments.length >= 5}
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Upload className="w-5 h-5 text-zinc-400 mb-1.5" />
              <p className="text-[12px] font-medium text-zinc-700">Drag files here or <span className="text-blue-600 font-semibold">Browse files</span></p>
              <p className="text-[10px] text-zinc-400 mt-1">You can upload a maximum of 5 files, 10MB each</p>
            </div>

            {/* List uploads */}
            {attachments.length > 0 && (
              <div className="flex gap-2 flex-wrap pt-2">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-semibold border border-zinc-200 rounded-lg bg-white shadow-sm relative group">
                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="max-w-40 truncate">{att.file_name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="p-0.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-zinc-100 flex items-center gap-2.5 flex-shrink-0 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm"
            >
              Record Adjustment
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page component
// ---------------------------------------------------------------------------
export default function Inventory() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddAdjustmentModal, setShowAddAdjustmentModal] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState<Adjustment | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // 1. Fetch adjustments
      const adjRes = await fetch("http://localhost:8888/api/inventory/list", { headers });
      const adjData = await adjRes.json();
      if (adjData.success) {
        setAdjustments(adjData.adjustments);
      }

      // 2. Fetch products
      const pRes = await fetch("http://localhost:8888/api/product/list", { headers });
      const pData = await pRes.json();
      if (pData.success) {
        setProducts(pData.products);
      }

      // 3. Fetch chart of accounts
      const aRes = await fetch("http://localhost:8888/api/accountant/chart-of-accounts", { headers });
      const aData = await aRes.json();
      if (aData.success) {
        setAccounts(aData.accounts || aData.chartOfAccounts || []);
      }

    } catch (e) {
      console.error("Failed to load inventory dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAdjustment = async (adjData: any) => {
    const token = localStorage.getItem("token");
    try {
      let url = "http://localhost:8888/api/inventory/create";
      let method = "POST";

      if (editingAdjustment) {
        url = `http://localhost:8888/api/inventory/${editingAdjustment.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adjData)
      });

      const data = await res.json();
      if (data.success) {
        loadData();
        setShowAddAdjustmentModal(false);
        setEditingAdjustment(null);
      } else {
        alert(data.message || "Failed to record inventory adjustment.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving adjustment.");
    }
  };

  const handleDeleteAdjustment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this inventory adjustment? Product stock levels will be reverted accordingly.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8888/api/inventory/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.message || "Failed to delete adjustment.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting adjustment.");
    }
  };

  const filteredAdjustments = adjustments.filter(
    (adj) =>
      adj.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adj.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (adj.account_name && adj.account_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Compute Stats from products list
  const totalProducts = products.length;
  const totalStockValue = products.reduce((s, p) => s + (p.stock || 0) * (p.price || 0), 0);
  const lowStockItems = products.filter(p => p.stock < 20).length;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">
        
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
              Inventory Dashboard
            </h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Real-time stock valuation, bento analytics, and adjustments log.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (adjustments.length === 0) return alert("No adjustments to export.");
                const csvHeaders = ["Adjustment Date", "Reference Number", "Mode", "Account", "Reason", "Description", "Status"];
                const rows = adjustments.map(a => [
                  a.adjustment_date,
                  a.reference_number,
                  a.mode,
                  a.account_name,
                  a.reason,
                  `"${a.description || ""}"`,
                  a.status
                ]);
                const csvContent = [csvHeaders, ...rows].map(r => r.join(",")).join("\n");
                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `adjustments_export_${new Date().toISOString().split("T")[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 text-[13px] font-medium px-3 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={() => {
                setEditingAdjustment(null);
                setShowAddAdjustmentModal(true);
              }}
              className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Adjustment
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Products" value={String(totalProducts)} />
          <StatCard label="Stock Value" value={fmt(totalStockValue)} />
          <StatCard label="Low Stock Items" value={String(lowStockItems)} isWarning={lowStockItems > 0} />
          <StatCard label="Active Regions" value="08 Warehouses" />
        </div>

        {/* Chart and Alert Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Flow Chart */}
          <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold text-zinc-900">Inventory Flow</h2>
                <p className="text-[12px] text-zinc-500">Stock in vs Stock out tracking logs</p>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Stock-in
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-300" />
                  Stock-out
                </span>
              </div>
            </div>
            <div className="h-48 flex items-end justify-between gap-2 px-4 border-b border-zinc-200">
              {[28, 40, 32, 52, 36, 56, 28, 44, 52, 36, 40, 48].map((h, i) => (
                <div key={i} className="flex-1 flex items-end justify-center gap-1">
                  <div
                    className="w-2 bg-blue-500 rounded-t-sm transition-all"
                    style={{ height: `${h}px` }}
                  />
                  <div
                    className="w-2 bg-zinc-300 rounded-t-sm transition-all"
                    style={{ height: `${Math.random() * h}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-zinc-400 px-4">
              <span>JAN</span>
              <span>FEB</span>
              <span>MAR</span>
              <span>APR</span>
              <span>MAY</span>
              <span>JUN</span>
              <span>JUL</span>
              <span>AUG</span>
              <span>SEP</span>
              <span>OCT</span>
              <span>NOV</span>
              <span>DEC</span>
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50">
              <h2 className="text-[14px] font-semibold text-zinc-900">
                Regional Distribution
              </h2>
            </div>
            <div className="relative h-56 bg-zinc-50">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi77GtVj5FN5x_EVLyo1DUi2VpvZvWPcDFesLURIWJ6j-fPZkul_A9bE8ekPpWI4WYsvQPYEk3xOal3skvF9ThFoP6LOlD6lWG9DN7voIBSLgmJgJw3UwTcJ6RvIOEmt92TejFzq_NLDE9n_WmmwFpf1omU8Um211TASxd_5GQkoRS2oOMHTYX8d1hCGZHJ7Zh-i1yLOvv8LXqH_VdBQyqpdC0-9afh3EngVfA9ebi2sSaUYXe0rFG_LBJu7HfAxEIC_K_abO9tHM"
                alt="Regional Distribution Map"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-sm border border-zinc-200">
                <p className="text-[12px] font-semibold text-zinc-900">NJ Warehouse</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Capacity: 92%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Adjustments Table */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">
                Recent Stock Adjustments
              </h2>
              <p className="text-[12px] text-zinc-500">
                {filteredAdjustments.length} adjustment{filteredAdjustments.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search adjustments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/40">
                {["Date", "Reference #", "Mode", "Account Name", "Reason", "Status", "Items Count", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className={cn(
                        "px-6 py-2.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wide",
                        h === "Actions" ? "text-right" : ""
                      )}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredAdjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-zinc-50/70 transition-colors cursor-pointer group">
                  <td className="px-6 py-3 text-[13px] text-zinc-500">{fmtDate(adj.adjustment_date)}</td>
                  <td className="px-6 py-3 font-semibold text-zinc-900 text-[13px]">{adj.reference_number}</td>
                  <td className="px-6 py-3">
                    <span className={cn(
                      "px-2 py-0.5 text-[11px] font-bold rounded",
                      adj.mode === "Value" ? "bg-amber-50 text-amber-700 border border-amber-200/50" : "bg-blue-50 text-blue-700 border border-blue-200/50"
                    )}>
                      {adj.mode}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[13px] text-zinc-600">{adj.account_name || "—"}</td>
                  <td className="px-6 py-3 text-[13px] text-zinc-600">{adj.reason}</td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center text-[12px] font-medium px-2 py-1 rounded-full",
                        adj.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {adj.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[13px] font-mono tabular-nums text-zinc-500">
                    {adj.items ? adj.items.length : 0} item(s)
                  </td>
                  <td className="px-6 py-3 text-right flex items-center justify-end gap-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAdjustment(adj);
                        setShowAddAdjustmentModal(true);
                      }}
                      className="inline-flex items-center px-2.5 py-1 text-[12px] font-bold text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg transition-colors shadow-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAdjustment(adj.id);
                      }}
                      className="inline-flex items-center px-2.5 py-1 text-[12px] font-bold text-red-600 bg-white border border-red-200/60 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shadow-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAdjustments.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[13px] text-zinc-400">
                    No adjustments registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddAdjustmentModal && (
        <NewAdjustmentModal
          products={products}
          accounts={accounts}
          editAdjustment={editingAdjustment}
          onClose={() => {
            setShowAddAdjustmentModal(false);
            setEditingAdjustment(null);
          }}
          onSave={handleSaveAdjustment}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, isWarning }: { label: string; value: string; isWarning?: boolean }) {
  return (
    <div className={cn(
      "bg-white border rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200",
      isWarning ? "border-red-200 bg-red-50/10" : "border-zinc-200/80"
    )}>
      <p className="text-[13px] font-medium text-zinc-500 mb-3">{label}</p>
      <h3 className={cn(
        "text-[26px] font-semibold tabular-nums tracking-tight",
        isWarning ? "text-red-600" : "text-zinc-900"
      )}>
        {value}
      </h3>
    </div>
  );
}

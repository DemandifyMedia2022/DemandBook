// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { cn } from "@/lib/utils";
// import {
//   PageHeader, StatCard, SectionCard, StatusBadge,
//   SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB, Modal, FormField, inputCls, selectCls,
// } from "@/components/ui/page-shell";

// interface Product {
//   sku: string;
//   name: string;
//   category: string;
//   stockLevel: number;
//   unitPrice: number;
//   status: "In Stock" | "Low Stock" | "Out of Stock";
//   imageUrl: string;
// }

// const initialProducts: Product[] = [
//   { sku: "SKU-29384-PM", name: "Precision Mech K1", category: "Hardware", stockLevel: 452, unitPrice: 189.0, status: "In Stock", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuikPChwJqz_7yqmDAQZC2XnUqBi8A22HtLu3nQwQB1M4gGXpx3XNc1WrPdDiRjVjnJqnBQOqRgu5p5bI020IYaM2bacc44JC5jbyJOpQsRSioZZj6X1qxlL_ipmpIKso6RZKaySdU0b_4CyE7jQl9YUWnEI-XsUHxIobJfKld7Ej9MjJbFyvc8gjrhGNJl1A-ILtzYjdEPeoltPr8XhJza0PwxwmBcXf4C9FY-QuzuetqAvOy936iMpXgl14u18n07Lqw8N0s7OU" },
//   { sku: "SKU-11209-FW", name: "Flux Wireless Mouse", category: "Peripherals", stockLevel: 12, unitPrice: 74.5, status: "Low Stock", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMQejQkGORsZ2z9hoDjKG7M_peI4OzMTtQlTWQAxohztS7WCO4izRaD6cK_HQGVdupQH5TRsZGhA7iz0AgWxC-_6oIdzeLOO6yGawxYwhQ2jVcmdbC3GnuDmt9i3ah4h1rPupocKSsG_QGvQcUYCDAipXjzq9dXQTLhArymMQw6h8Rs9ij8BevIkg7z4xOeHsnsxeMC52pZM4yljchkxnXGykwuhzelBjhbXd5fRGD-kc219z2BFo3jzr8uNMLUSYF0wxL5t2aP8I" },
//   { sku: "SKU-55412-UW", name: "Ultrawide 34-inch", category: "Displays", stockLevel: 0, unitPrice: 849.0, status: "Out of Stock", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCk_DX68i-RL0cKB6WUGbUH2WKKGZ_zL7EKv_I5Z3kBKfKJVnPUwNTVdw9SbLlWvJm4RuRg0L7PLxHME0k5vBJFHe76ypJoruJH6HWt74RMdcNAfPi0nF-KxE8N7TS2cbwTq7r3-r4s1IxB-YV14PQjzBVB6i6D7KSQ4c1d4C3rWYyRX0UqfTJ3YCLpZ9jjTzQ1K1r8ooiYaYB3k_4AVCGlMBQZwnEV4oJvw2M1vVSXOBNqNNHn2S0jBf9u5VOY4mOYBH5x7aw4" },
//   { sku: "SKU-84029-MB", name: "Macro Book X Pro", category: "Laptops", stockLevel: 28, unitPrice: 2299.0, status: "In Stock", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBf-YBsVYxvaSJLZQQx2qcEarPb1k8cMrlPCIi7SHEsM7y0NyaJJWoKwqiWaXFxIMwtI-1RoYM0-_L9Wnl4cCHI2OQQy7E9hEhPj0f3rWY6C0sYsC2fMG7lrmDjbD5ppKTkQh0H9Aqn_HLHpniqMpHIqvRfFkCMExgCKuXmTHuBvgbx5zrFkdGnhN2nstf6T_iWlFv--HZAZ_zAOL_pUc-p9VEWKfZhqAqZbdvYNEDi8_TfN3ztBIkFk3mDIGBhkJSqeYEMF3_g" },
// ];

// export default function Products() {
//   const [products, setProducts] = useState<Product[]>(initialProducts);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [selectedStatus, setSelectedStatus] = useState("All");
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
//   const [newStockQty, setNewStockQty] = useState("");

//   const [newSku, setNewSku] = useState("SKU-NEW-001");
//   const [newName, setNewName] = useState("");
//   const [newCategory, setNewCategory] = useState("Hardware");
//   const [newStock, setNewStock] = useState("");
//   const [newPrice, setNewPrice] = useState("");

//   const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

//   const handleCreate = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newName || !newPrice) return;
//     const stock = parseInt(newStock) || 0;
//     const status: Product["status"] = stock === 0 ? "Out of Stock" : stock < 20 ? "Low Stock" : "In Stock";
//     setProducts([{ sku: newSku, name: newName, category: newCategory, stockLevel: stock, unitPrice: parseFloat(newPrice), status, imageUrl: "" }, ...products]);
//     setShowCreateModal(false);
//     setNewName(""); setNewSku("SKU-NEW-" + String(products.length + 2).padStart(3, "0")); setNewStock(""); setNewPrice("");
//   };

//   const handleAdjust = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!adjustProduct || !newStockQty) return;
//     const qty = parseInt(newStockQty);
//     const status: Product["status"] = qty === 0 ? "Out of Stock" : qty < 20 ? "Low Stock" : "In Stock";
//     setProducts(products.map((p) => p.sku === adjustProduct.sku ? { ...p, stockLevel: qty, status } : p));
//     setAdjustProduct(null);
//     setNewStockQty("");
//   };

//   const filtered = products.filter((p) => {
//     const q = searchQuery.toLowerCase();
//     return (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) && (selectedCategory === "All" || p.category === selectedCategory) && (selectedStatus === "All" || p.status === selectedStatus);
//   });

//   const inventoryValue = products.reduce((s, p) => s + p.stockLevel * p.unitPrice, 0);
//   const outOfStock = products.filter((p) => p.status === "Out of Stock").length;
//   const lowStock = products.filter((p) => p.status === "Low Stock").length;

//   return (
//     <div className="p-6 max-w-[1440px] mx-auto space-y-6">
//       <PageHeader
//         title="Products & Services"
//         subtitle="Manage your product catalog, pricing, and stock levels."
//         actions={
//           <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm">
//             <span className="material-symbols-outlined text-[17px]">add</span>
//             Add Product
//           </button>
//         }
//       />

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard label="Total Products" value={String(products.length)} icon="inventory_2" trend={{ label: "+12% this month", up: true }} />
//         <StatCard label="Inventory Value" value={`₹${inventoryValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="sell" trend={{ label: "72% capacity used", up: null }} />
//         <StatCard label="Out of Stock" value={String(outOfStock)} icon="remove_shopping_cart" iconColor="text-destructive" trend={{ label: "Needs restocking", up: false }} />
//         <StatCard label="Low Stock Alerts" value={String(lowStock)} icon="warning" iconColor="text-destructive" trend={{ label: "Monitor closely", up: null }} />
//       </div>

//       <SectionCard title="Product Catalog" subtitle={`${filtered.length} products`} noPadding
//         actions={
//           <div className="flex items-center gap-2">
//             <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search products..." />
//             <FilterSelect value={selectedCategory} onChange={setSelectedCategory} options={categories} />
//             <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "In Stock", "Low Stock", "Out of Stock"]} />
//           </div>
//         }
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[720px]">
//             <thead>
//               <tr>
//                 <Th>Product</Th>
//                 <Th>SKU</Th>
//                 <Th>Category</Th>
//                 <Th right>Unit Price</Th>
//                 <Th>Stock Level</Th>
//                 <Th>Status</Th>
//                 <Th>Actions</Th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((product) => (
//                 <TableRow key={product.sku}>
//                   <Td>
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-lg overflow-hidden bg-card-container flex items-center justify-center shrink-0 relative border border-border">
//                         {product.imageUrl ? (
//                           <Image src={product.imageUrl} alt={product.name} fill sizes="40px" className="object-cover" />
//                         ) : (
//                           <span className="material-symbols-outlined text-muted-foreground text-[20px]">inventory_2</span>
//                         )}
//                       </div>
//                       <p className="font-bold text-foreground text-sm">{product.name}</p>
//                     </div>
//                   </Td>
//                   <Td className="font-mono text-[11px] text-primary">{product.sku}</Td>
//                   <Td className="text-muted-foreground">{product.category}</Td>
//                   <Td className="text-right font-bold font-mono text-foreground">₹{product.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Td>
//                   <Td>
//                     <div className="flex items-center gap-2">
//                       <div className="flex-1 bg-card-container rounded-full h-1.5 w-20">
//                         <div className={cn("h-full rounded-full", product.stockLevel === 0 ? "w-0" : product.status === "Low Stock" ? "bg-amber-500 w-1/4" : "bg-green-500 w-3/4")} />
//                       </div>
//                       <span className="text-xs text-muted-foreground w-8 text-right">{product.stockLevel}</span>
//                     </div>
//                   </Td>
//                   <Td><StatusBadge status={product.status} /></Td>
//                   <Td>
//                     <button onClick={() => setAdjustProduct(product)} className="flex items-center gap-1 text-[11px] font-bold text-primary border border-primary/30 px-2.5 py-1 rounded-lg hover:bg-primary/5 transition-colors">
//                       <span className="material-symbols-outlined text-[14px]">tune</span>
//                       Adjust
//                     </button>
//                   </Td>
//                 </TableRow>
//               ))}
//               {filtered.length === 0 && <EmptyState icon="inventory_2" message="No products match the filter." colSpan={7} />}
//             </tbody>
//           </table>
//         </div>
//       </SectionCard>

//       <FAB label="Add Product" onClick={() => setShowCreateModal(true)} />

//       {showCreateModal && (
//         <Modal title="Add New Product" onClose={() => setShowCreateModal(false)}>
//           <form onSubmit={handleCreate} className="p-6 space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="SKU"><input className={inputCls} value={newSku} onChange={(e) => setNewSku(e.target.value)} /></FormField>
//               <FormField label="Category"><input className={inputCls} value={newCategory} onChange={(e) => setNewCategory(e.target.value)} /></FormField>
//             </div>
//             <FormField label="Product Name"><input className={inputCls} required placeholder="e.g. Widget Pro X" value={newName} onChange={(e) => setNewName(e.target.value)} /></FormField>
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="Unit Price (₹)"><input type="number" step="0.01" required placeholder="0.00" className={inputCls} value={newPrice} onChange={(e) => setNewPrice(e.target.value)} /></FormField>
//               <FormField label="Stock Level"><input type="number" placeholder="0" className={inputCls} value={newStock} onChange={(e) => setNewStock(e.target.value)} /></FormField>
//             </div>
//             <div className="pt-4 border-t border-border flex justify-end gap-3">
//               <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:bg-card-container transition-colors">Cancel</button>
//               <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Add Product</button>
//             </div>
//           </form>
//         </Modal>
//       )}

//       {adjustProduct && (
//         <Modal title={`Adjust Stock: ${adjustProduct.name}`} onClose={() => setAdjustProduct(null)}>
//           <form onSubmit={handleAdjust} className="p-6 space-y-4">
//             <div className="p-3 bg-card-container-low rounded-lg flex items-center justify-between">
//               <span className="text-xs font-semibold text-muted-foreground">Current Stock</span>
//               <span className="font-bold text-foreground">{adjustProduct.stockLevel} units</span>
//             </div>
//             <FormField label="New Stock Quantity">
//               <input type="number" required min={0} placeholder="Enter new stock quantity" className={inputCls} value={newStockQty} onChange={(e) => setNewStockQty(e.target.value)} />
//             </FormField>
//             <div className="pt-4 border-t border-border flex justify-end gap-3">
//               <button type="button" onClick={() => setAdjustProduct(null)} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:bg-card-container transition-colors">Cancel</button>
//               <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Update Stock</button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Package,
  SlidersHorizontal,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Product {
  sku: string;
  name: string;
  category: string;
  stockLevel: number;
  unitPrice: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  imageUrl: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  Product["status"],
  { dot: string; text: string; bg: string; icon: React.ReactNode }
> = {
  "In Stock": { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-3 h-3" /> },
  "Low Stock": { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", icon: <AlertTriangle className="w-3 h-3" /> },
  "Out of Stock": { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", icon: <XCircle className="w-3 h-3" /> },
};

const STATUSES = ["All", "In Stock", "Low Stock", "Out of Stock"] as const;

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const initialProducts: Product[] = [
  { sku: "SKU-29384-PM", name: "Precision Mech K1", category: "Hardware", stockLevel: 452, unitPrice: 189.0, status: "In Stock", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuikPChwJqz_7yqmDAQZC2XnUqBi8A22HtLu3nQwQB1M4gGXpx3XNc1WrPdDiRjVjnJqnBQOqRgu5p5bI020IYaM2bacc44JC5jbyJOpQsRSioZZj6X1qxlL_ipmpIKso6RZKaySdU0b_4CyE7jQl9YUWnEI-XsUHxIobJfKld7Ej9MjJbFyvc8gjrhGNJl1A-ILtzYjdEPeoltPr8XhJza0PwxwmBcXf4C9FY-QuzuetqAvOy936iMpXgl14u18n07Lqw8N0s7OU" },
  { sku: "SKU-11209-FW", name: "Flux Wireless Mouse", category: "Peripherals", stockLevel: 12, unitPrice: 74.5, status: "Low Stock", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMQejQkGORsZ2z9hoDjKG7M_peI4OzMTtQlTWQAxohztS7WCO4izRaD6cK_HQGVdupQH5TRsZGhA7iz0AgWxC-_6oIdzeLOO6yGawxYwhQ2jVcmdbC3GnuDmt9i3ah4h1rPupocKSsG_QGvQcUYCDAipXjzq9dXQTLhArymMQw6h8Rs9ij8BevIkg7z4xOeHsnsxeMC52pZM4yljchkxnXGykwuhzelBjhbXd5fRGD-kc219z2BFo3jzr8uNMLUSYF0wxL5t2aP8I" },
  { sku: "SKU-55412-UW", name: "Ultrawide 34-inch", category: "Displays", stockLevel: 0, unitPrice: 849.0, status: "Out of Stock", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCk_DX68i-RL0cKB6WUGbUH2WKKGZ_zL7EKv_I5Z3kBKfKJVnPUwNTVdw9SbLlWvJm4RuRg0L7PLxHME0k5vBJFHe76ypJoruJH6HWt74RMdcNAfPi0nF-KxE8N7TS2cbwTq7r3-r4s1IxB-YV14PQjzBVB6i6D7KSQ4c1d4C3rWYyRX0UqfTJ3YCLpZ9jjTzQ1K1r8ooiYaYB3k_4AVCGlMBQZwnEV4oJvw2M1vVSXOBNqNNHn2S0jBf9u5VOY4mOYBH5x7aw4" },
  { sku: "SKU-84029-MB", name: "Macro Book X Pro", category: "Laptops", stockLevel: 28, unitPrice: 2299.0, status: "In Stock", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBf-YBsVYxvaSJLZQQx2qcEarPb1k8cMrlPCIi7SHEsM7y0NyaJJWoKwqiWaXFxIMwtI-1RoYM0-_L9Wnl4cCHI2OQQy7E9hEhPj0f3rWY6C0sYsC2fMG7lrmDjbD5ppKTkQh0H9Aqn_HLHpniqMpHIqvRfFkCMExgCKuXmTHuBvgbx5zrFkdGnhN2nstf6T_iWlFv--HZAZ_zAOL_pUc-p9VEWKfZhqAqZbdvYNEDi8_TfN3ztBIkFk3mDIGBhkJSqeYEMF3_g" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function deriveStatus(qty: number): Product["status"] {
  return qty === 0 ? "Out of Stock" : qty < 20 ? "Low Stock" : "In Stock";
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

function StatusPill({ status }: { status: Product["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full", cfg.bg, cfg.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {status}
    </span>
  );
}

function StockBar({ product }: { product: Product }) {
  const barColor =
    product.status === "Out of Stock" ? "bg-red-400" :
      product.status === "Low Stock" ? "bg-amber-400" :
        "bg-emerald-500";
  const maxStock = 500;
  const pct = Math.min((product.stockLevel / maxStock) * 100, 100);

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[13px] text-zinc-500 tabular-nums w-8">{product.stockLevel}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modals
// ---------------------------------------------------------------------------
const FIELD = "w-full px-3 py-2 text-[13px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 transition-colors text-zinc-800 placeholder:text-zinc-400";
const SELECT = cn(FIELD, "appearance-none cursor-pointer");

function AddProductModal({ products, onClose, onAdd }: { products: Product[]; onClose: () => void; onAdd: (p: Product) => void }) {
  const [sku, setSku] = useState(`SKU-NEW-${String(products.length + 1).padStart(3, "0")}`);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Hardware");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    const qty = parseInt(stock) || 0;
    onAdd({ sku, name, category, stockLevel: qty, unitPrice: parseFloat(price), status: deriveStatus(qty), imageUrl: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-[15px] font-semibold text-zinc-900">Add New Product</h3>
            <p className="text-[12px] text-zinc-500 mt-0.5">Add a product to your catalog</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">SKU</label>
              <input className={FIELD} value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Category</label>
              <input className={FIELD} placeholder="e.g. Hardware" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Product Name</label>
            <input required placeholder="e.g. Widget Pro X" className={FIELD} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Unit Price (₹)</label>
              <input type="number" step="0.01" min={0} required placeholder="0.00" className={FIELD} value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Stock Level</label>
              <input type="number" min={0} placeholder="0" className={FIELD} value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2.5">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm">Add Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdjustStockModal({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (sku: string, qty: number) => void }) {
  const [qty, setQty] = useState(String(product.stockLevel));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product.sku, parseInt(qty) || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
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
            <span className="text-[13px] font-semibold text-zinc-900 tabular-nums">{product.stockLevel} units</span>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">New Quantity</label>
            <input type="number" required min={0} placeholder="Enter new stock quantity" className={FIELD} value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="pt-2 flex items-center gap-2.5">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-[13px] font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm">Update Stock</button>
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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
      (selectedCategory === "All" || p.category === selectedCategory) &&
      (selectedStatus === "All" || p.status === selectedStatus)
    );
  });

  const inventoryValue = products.reduce((s, p) => s + p.stockLevel * p.unitPrice, 0);
  const outOfStock = products.filter((p) => p.status === "Out of Stock").length;
  const lowStock = products.filter((p) => p.status === "Low Stock").length;

  const handleAdd = (product: Product) => {
    setProducts([product, ...products]);
    setShowAddModal(false);
  };

  const handleAdjust = (sku: string, qty: number) => {
    setProducts(products.map((p) => p.sku === sku ? { ...p, stockLevel: qty, status: deriveStatus(qty) } : p));
    setAdjustProduct(null);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Products & Services</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">Manage your product catalog, pricing, and stock levels.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Products" value={String(products.length)} delta={12} />
          <StatCard label="Inventory Value" value={fmt(inventoryValue)} />
          <StatCard label="Out of Stock" value={String(outOfStock)} delta={outOfStock > 0 ? -outOfStock * 10 : 0} />
          <StatCard label="Low Stock Alerts" value={String(lowStock)} delta={lowStock > 0 ? -5 : 0} />
        </div>

        {/* Table card */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">Product Catalog</h2>
              <p className="text-[12px] text-zinc-500">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative w-52">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
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
                  className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
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
                  className="appearance-none pl-3 pr-8 py-1.5 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors cursor-pointer"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>
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
                  ["Product", ""],
                  ["SKU", ""],
                  ["Category", ""],
                  ["Unit Price", "text-right"],
                  ["Stock Level", ""],
                  ["Status", ""],
                  ["", ""],
                ].map(([h, cls], i) => (
                  <th key={i} className={cn("px-6 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide", cls)}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((product) => (
                <tr key={product.sku} className="hover:bg-zinc-50/70 transition-colors cursor-pointer group">

                  {/* Product */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-100 flex items-center justify-center flex-shrink-0 relative border border-zinc-200/60">
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt={product.name} fill sizes="36px" className="object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                      <p className="text-[13px] font-medium text-zinc-900">{product.name}</p>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-6 py-3">
                    <span className="font-mono text-[12px] font-bold text-[#5B5FEF]">{product.sku}</span>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-3 text-[13px] text-zinc-500">{product.category}</td>

                  {/* Price */}
                  <td className="px-6 py-3 text-right font-mono text-[13px] font-semibold text-zinc-900 tabular-nums">
                    {fmt(product.unitPrice)}
                  </td>

                  {/* Stock bar */}
                  <td className="px-6 py-3">
                    <StockBar product={product} />
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3">
                    <StatusPill status={product.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setAdjustProduct(product)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#5B5FEF] border border-[#5B5FEF]/20 bg-[#5B5FEF]/5 rounded-lg hover:bg-[#5B5FEF]/10 transition-colors whitespace-nowrap"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        Adjust
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-6 h-6 text-zinc-200" />
                      <p className="text-[13px] text-zinc-400">No products match your filters.</p>
                      <button
                        onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedStatus("All"); }}
                        className="text-[12px] text-[#5B5FEF] hover:underline mt-1"
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
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <span className="text-[12px] text-zinc-400">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </span>
              <span className="text-[13px] font-semibold text-zinc-900 tabular-nums font-mono">
                Value: {fmt(filtered.reduce((s, p) => s + p.stockLevel * p.unitPrice, 0))}
              </span>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddProductModal products={products} onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
      )}

      {adjustProduct && (
        <AdjustStockModal product={adjustProduct} onClose={() => setAdjustProduct(null)} onSave={handleAdjust} />
      )}
    </div>
  );
}
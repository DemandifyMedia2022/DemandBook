"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  PageHeader, StatCard, SectionCard, StatusBadge,
  SearchBar, FilterSelect, Th, Td, TableRow, EmptyState, FAB, Modal, FormField, inputCls, selectCls,
} from "@/components/ui/page-shell";

interface Product {
  sku: string;
  name: string;
  category: string;
  stockLevel: number;
  unitPrice: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  imageUrl: string;
}

const initialProducts: Product[] = [
  { sku: "SKU-29384-PM", name: "Precision Mech K1", category: "Hardware", stockLevel: 452, unitPrice: 189.0, status: "In Stock", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuikPChwJqz_7yqmDAQZC2XnUqBi8A22HtLu3nQwQB1M4gGXpx3XNc1WrPdDiRjVjnJqnBQOqRgu5p5bI020IYaM2bacc44JC5jbyJOpQsRSioZZj6X1qxlL_ipmpIKso6RZKaySdU0b_4CyE7jQl9YUWnEI-XsUHxIobJfKld7Ej9MjJbFyvc8gjrhGNJl1A-ILtzYjdEPeoltPr8XhJza0PwxwmBcXf4C9FY-QuzuetqAvOy936iMpXgl14u18n07Lqw8N0s7OU" },
  { sku: "SKU-11209-FW", name: "Flux Wireless Mouse", category: "Peripherals", stockLevel: 12, unitPrice: 74.5, status: "Low Stock", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMQejQkGORsZ2z9hoDjKG7M_peI4OzMTtQlTWQAxohztS7WCO4izRaD6cK_HQGVdupQH5TRsZGhA7iz0AgWxC-_6oIdzeLOO6yGawxYwhQ2jVcmdbC3GnuDmt9i3ah4h1rPupocKSsG_QGvQcUYCDAipXjzq9dXQTLhArymMQw6h8Rs9ij8BevIkg7z4xOeHsnsxeMC52pZM4yljchkxnXGykwuhzelBjhbXd5fRGD-kc219z2BFo3jzr8uNMLUSYF0wxL5t2aP8I" },
  { sku: "SKU-55412-UW", name: "Ultrawide 34-inch", category: "Displays", stockLevel: 0, unitPrice: 849.0, status: "Out of Stock", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCk_DX68i-RL0cKB6WUGbUH2WKKGZ_zL7EKv_I5Z3kBKfKJVnPUwNTVdw9SbLlWvJm4RuRg0L7PLxHME0k5vBJFHe76ypJoruJH6HWt74RMdcNAfPi0nF-KxE8N7TS2cbwTq7r3-r4s1IxB-YV14PQjzBVB6i6D7KSQ4c1d4C3rWYyRX0UqfTJ3YCLpZ9jjTzQ1K1r8ooiYaYB3k_4AVCGlMBQZwnEV4oJvw2M1vVSXOBNqNNHn2S0jBf9u5VOY4mOYBH5x7aw4" },
  { sku: "SKU-84029-MB", name: "Macro Book X Pro", category: "Laptops", stockLevel: 28, unitPrice: 2299.0, status: "In Stock", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBf-YBsVYxvaSJLZQQx2qcEarPb1k8cMrlPCIi7SHEsM7y0NyaJJWoKwqiWaXFxIMwtI-1RoYM0-_L9Wnl4cCHI2OQQy7E9hEhPj0f3rWY6C0sYsC2fMG7lrmDjbD5ppKTkQh0H9Aqn_HLHpniqMpHIqvRfFkCMExgCKuXmTHuBvgbx5zrFkdGnhN2nstf6T_iWlFv--HZAZ_zAOL_pUc-p9VEWKfZhqAqZbdvYNEDi8_TfN3ztBIkFk3mDIGBhkJSqeYEMF3_g" },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [newStockQty, setNewStockQty] = useState("");

  const [newSku, setNewSku] = useState("SKU-NEW-001");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Hardware");
  const [newStock, setNewStock] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    const stock = parseInt(newStock) || 0;
    const status: Product["status"] = stock === 0 ? "Out of Stock" : stock < 20 ? "Low Stock" : "In Stock";
    setProducts([{ sku: newSku, name: newName, category: newCategory, stockLevel: stock, unitPrice: parseFloat(newPrice), status, imageUrl: "" }, ...products]);
    setShowCreateModal(false);
    setNewName(""); setNewSku("SKU-NEW-" + String(products.length + 2).padStart(3, "0")); setNewStock(""); setNewPrice("");
  };

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProduct || !newStockQty) return;
    const qty = parseInt(newStockQty);
    const status: Product["status"] = qty === 0 ? "Out of Stock" : qty < 20 ? "Low Stock" : "In Stock";
    setProducts(products.map((p) => p.sku === adjustProduct.sku ? { ...p, stockLevel: qty, status } : p));
    setAdjustProduct(null);
    setNewStockQty("");
  };

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) && (selectedCategory === "All" || p.category === selectedCategory) && (selectedStatus === "All" || p.status === selectedStatus);
  });

  const inventoryValue = products.reduce((s, p) => s + p.stockLevel * p.unitPrice, 0);
  const outOfStock = products.filter((p) => p.status === "Out of Stock").length;
  const lowStock = products.filter((p) => p.status === "Low Stock").length;

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <PageHeader
        title="Products & Services"
        subtitle="Manage your product catalog, pricing, and stock levels."
        actions={
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-[17px]">add</span>
            Add Product
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={String(products.length)} icon="inventory_2" trend={{ label: "+12% this month", up: true }} />
        <StatCard label="Inventory Value" value={`₹${inventoryValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="sell" trend={{ label: "72% capacity used", up: null }} />
        <StatCard label="Out of Stock" value={String(outOfStock)} icon="remove_shopping_cart" iconColor="text-error" trend={{ label: "Needs restocking", up: false }} />
        <StatCard label="Low Stock Alerts" value={String(lowStock)} icon="warning" iconColor="text-error" trend={{ label: "Monitor closely", up: null }} />
      </div>

      <SectionCard title="Product Catalog" subtitle={`${filtered.length} products`} noPadding
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search products..." />
            <FilterSelect value={selectedCategory} onChange={setSelectedCategory} options={categories} />
            <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "In Stock", "Low Stock", "Out of Stock"]} />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr>
                <Th>Product</Th>
                <Th>SKU</Th>
                <Th>Category</Th>
                <Th right>Unit Price</Th>
                <Th>Stock Level</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <TableRow key={product.sku}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container flex items-center justify-center shrink-0 relative border border-outline-variant">
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt={product.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">inventory_2</span>
                        )}
                      </div>
                      <p className="font-bold text-on-surface text-sm">{product.name}</p>
                    </div>
                  </Td>
                  <Td className="font-mono text-[11px] text-primary">{product.sku}</Td>
                  <Td className="text-on-surface-variant">{product.category}</Td>
                  <Td className="text-right font-bold font-mono text-on-surface">₹{product.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-surface-container rounded-full h-1.5 w-20">
                        <div className={cn("h-full rounded-full", product.stockLevel === 0 ? "w-0" : product.status === "Low Stock" ? "bg-amber-500 w-1/4" : "bg-green-500 w-3/4")} />
                      </div>
                      <span className="text-xs text-on-surface-variant w-8 text-right">{product.stockLevel}</span>
                    </div>
                  </Td>
                  <Td><StatusBadge status={product.status} /></Td>
                  <Td>
                    <button onClick={() => setAdjustProduct(product)} className="flex items-center gap-1 text-[11px] font-bold text-primary border border-primary/30 px-2.5 py-1 rounded-lg hover:bg-primary/5 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">tune</span>
                      Adjust
                    </button>
                  </Td>
                </TableRow>
              ))}
              {filtered.length === 0 && <EmptyState icon="inventory_2" message="No products match the filter." colSpan={7} />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <FAB label="Add Product" onClick={() => setShowCreateModal(true)} />

      {showCreateModal && (
        <Modal title="Add New Product" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="SKU"><input className={inputCls} value={newSku} onChange={(e) => setNewSku(e.target.value)} /></FormField>
              <FormField label="Category"><input className={inputCls} value={newCategory} onChange={(e) => setNewCategory(e.target.value)} /></FormField>
            </div>
            <FormField label="Product Name"><input className={inputCls} required placeholder="e.g. Widget Pro X" value={newName} onChange={(e) => setNewName(e.target.value)} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Unit Price (₹)"><input type="number" step="0.01" required placeholder="0.00" className={inputCls} value={newPrice} onChange={(e) => setNewPrice(e.target.value)} /></FormField>
              <FormField label="Stock Level"><input type="number" placeholder="0" className={inputCls} value={newStock} onChange={(e) => setNewStock(e.target.value)} /></FormField>
            </div>
            <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Add Product</button>
            </div>
          </form>
        </Modal>
      )}

      {adjustProduct && (
        <Modal title={`Adjust Stock: ${adjustProduct.name}`} onClose={() => setAdjustProduct(null)}>
          <form onSubmit={handleAdjust} className="p-6 space-y-4">
            <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant">Current Stock</span>
              <span className="font-bold text-on-surface">{adjustProduct.stockLevel} units</span>
            </div>
            <FormField label="New Stock Quantity">
              <input type="number" required min={0} placeholder="Enter new stock quantity" className={inputCls} value={newStockQty} onChange={(e) => setNewStockQty(e.target.value)} />
            </FormField>
            <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
              <button type="button" onClick={() => setAdjustProduct(null)} className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">Update Stock</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

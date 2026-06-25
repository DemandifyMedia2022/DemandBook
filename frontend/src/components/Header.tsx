"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const routeTitles: Record<string, { title: string; icon: string }> = {
  "/": { title: "Accounting Overview", icon: "dashboard" },
  "/customers": { title: "Customers", icon: "person" },
  "/vendors": { title: "Vendors", icon: "storefront" },
  "/products": { title: "Products & Services", icon: "inventory_2" },
  "/invoices": { title: "Invoices", icon: "description" },
  "/bills": { title: "Bills", icon: "receipt_long" },
  "/purchase-orders": { title: "Purchase Orders", icon: "shopping_cart" },
  "/expenses": { title: "Expenses", icon: "payments" },
  "/inventory": { title: "Inventory Dashboard", icon: "inventory" },
  "/profit-loss": { title: "Profit & Loss", icon: "assessment" },
  "/tax-reports": { title: "Tax & Reports", icon: "receipt" },
  "/gst-dashboard": { title: "GST Dashboard", icon: "account_balance" },
  "/reports-analytics": { title: "Reports & Analytics", icon: "analytics" },
  "/users": { title: "User Management", icon: "group" },
  "/settings": { title: "Settings", icon: "settings" },
};

export default function Header() {
  const pathname = usePathname();
  const current = routeTitles[pathname] ?? { title: "DemandBooks", icon: "dashboard" };
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <header className="flex items-center justify-between w-full h-14 px-4 bg-card border-b border-border shrink-0 z-40 sticky top-0">
      {/* Left: Mobile Menu + Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile trigger */}
        <button className="p-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors md:hidden text-muted-foreground">
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Separator — visible on md+ */}
        <div className="hidden md:block w-px h-4 bg-border" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-[16px] text-muted-foreground"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {current.icon}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {current.title}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground relative group">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground relative"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {/* Unread Badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-card" />
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-foreground">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Notifications</p>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">2 new</span>
              </div>
              <div className="divide-y divide-border max-h-64 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-destructive/15 rounded-lg mt-0.5 shrink-0">
                      <span className="material-symbols-outlined text-[14px] text-destructive">warning</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">GSTR-3B Due Soon</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Deadline: 20 Oct 2023 — 3 days remaining</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-muted rounded-lg mt-0.5 shrink-0">
                      <span className="material-symbols-outlined text-[14px] text-foreground">payments</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Invoice #INV-2023-083 Overdue</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Cyberdyne Systems — ₹3,812.50 pending</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2.5 border-t border-border bg-card">
                <button className="text-[11px] font-semibold text-primary hover:underline w-full text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border" />

        {/* Quick Create */}
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Quick Create
        </button>

        {/* User Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu((v) => !v);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-primary/20">
              {initials}
            </div>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-foreground">
              {/* User Info */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email || ''}</p>
                  <p className="text-[10px] text-primary font-semibold mt-0.5">{user?.role || 'Guest'}</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                {[
                  { label: "Profile", icon: "person" },
                  { label: "Notifications", icon: "notifications" },
                  { label: "Keyboard Shortcuts", icon: "keyboard" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[18px] text-muted-foreground">{item.icon}</span>
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-border py-1">
                {[
                  { label: "Plan & Billing", icon: "credit_card" },
                  { label: "Seller Help", icon: "help", className: "text-muted-foreground" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                  >
                    <span className={cn("material-symbols-outlined text-[18px]", item.className ?? "text-muted-foreground")}>{item.icon}</span>
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-border py-1">
                <button 
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-destructive/10 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px] text-destructive">logout</span>
                  <span className="text-xs font-semibold text-destructive">Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click-outside overlay to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}

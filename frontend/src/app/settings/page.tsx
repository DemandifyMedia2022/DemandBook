"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building,
  Users,
  ShieldCheck,
  Wrench,
  Paintbrush,
  Zap,
  Sliders,
  CreditCard,
  ShoppingCart,
  ShoppingBag,
  Boxes,
  Globe,
  Store,
  Database,
  Search,
  X,
  Sparkles,
  Info
} from "lucide-react";

interface SettingItem {
  label: string;
  href?: string;
  badge?: string;
}

interface SettingCategory {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  accentBg: string;
  accentText: string;
  accentBorderLeft: string;
  accentDot: string;
  items: SettingItem[];
}

const CATEGORIES: SettingCategory[] = [
  {
    id: "organization",
    title: "Organization",
    icon: Building,
    accentBg: "bg-emerald-50/70 hover:bg-emerald-50",
    accentText: "text-emerald-800",
    accentBorderLeft: "border-l-emerald-500",
    accentDot: "bg-emerald-500",
    items: [
      { label: "Profile", href: "/settings/organization" },
      { label: "Branding" },
      { label: "Custom Domain" },
      { label: "Locations" },
      { label: "AI Integration" },
      { label: "Approvals" },
      { label: "Manage Subscription" }
    ]
  },
  {
    id: "users_roles",
    title: "Users & Roles",
    icon: Users,
    accentBg: "bg-rose-50/70 hover:bg-rose-50",
    accentText: "text-rose-800",
    accentBorderLeft: "border-l-rose-500",
    accentDot: "bg-rose-500",
    items: [
      { label: "Users", href: "/users" },
      { label: "Roles" },
      { label: "User Preferences" }
    ]
  },
  {
    id: "taxes_compliance",
    title: "Taxes & Compliance",
    icon: ShieldCheck,
    accentBg: "bg-blue-50/70 hover:bg-blue-50",
    accentText: "text-blue-800",
    accentBorderLeft: "border-l-blue-500",
    accentDot: "bg-blue-500",
    items: [
      { label: "Taxes" },
      { label: "Direct Taxes" },
      { label: "e-Way Bills", href: "/eway-bills" },
      { label: "e-Invoicing" },
      { label: "MSME Settings" }
    ]
  },
  {
    id: "setup_configs",
    title: "Setup & Configurations",
    icon: Wrench,
    accentBg: "bg-orange-50/70 hover:bg-orange-50",
    accentText: "text-orange-800",
    accentBorderLeft: "border-l-orange-500",
    accentDot: "bg-orange-500",
    items: [
      { label: "General" },
      { label: "Currencies", href: "/currency-adjustments" },
      { label: "Payment Terms", badge: "NEW" },
      { label: "Opening Balances" },
      { label: "Reminders" },
      { label: "Customer Portal" },
      { label: "Vendor Portal" }
    ]
  },
  {
    id: "customization",
    title: "Customization",
    icon: Paintbrush,
    accentBg: "bg-indigo-50/70 hover:bg-indigo-50",
    accentText: "text-indigo-800",
    accentBorderLeft: "border-l-indigo-500",
    accentDot: "bg-indigo-500",
    items: [
      { label: "Transaction Number Series" },
      { label: "PDF Templates" },
      { label: "Email Notifications" },
      { label: "SMS Notifications" },
      { label: "Reporting Tags" },
      { label: "Web Tabs" },
      { label: "Digital Signature" }
    ]
  },
  {
    id: "automation",
    title: "Automation",
    icon: Zap,
    accentBg: "bg-teal-50/70 hover:bg-teal-50",
    accentText: "text-teal-800",
    accentBorderLeft: "border-l-teal-500",
    accentDot: "bg-teal-500",
    items: [
      { label: "Workflow Rules" },
      { label: "Workflow Actions" },
      { label: "Workflow Logs" },
      { label: "Schedules" }
    ]
  },
  {
    id: "module_settings",
    title: "Module Settings",
    icon: Sliders,
    accentBg: "bg-zinc-100/70 hover:bg-zinc-100",
    accentText: "text-zinc-800",
    accentBorderLeft: "border-l-zinc-500",
    accentDot: "bg-zinc-500",
    items: [
      { label: "General" },
      { label: "Customers and Vendors" },
      { label: "Items" },
      { label: "Accountant" },
      { label: "Projects" },
      { label: "Timesheet" },
      { label: "Inventory" },
      { label: "Inventory Adjustments" }
    ]
  },
  {
    id: "online_payments",
    title: "Online Payments",
    icon: CreditCard,
    accentBg: "bg-cyan-50/70 hover:bg-cyan-50",
    accentText: "text-cyan-800",
    accentBorderLeft: "border-l-cyan-500",
    accentDot: "bg-cyan-500",
    items: [
      { label: "Online Payments" },
      { label: "Customer Payments" },
      { label: "Vendor Payments" }
    ]
  },
  {
    id: "sales",
    title: "Sales",
    icon: ShoppingCart,
    accentBg: "bg-amber-50/70 hover:bg-amber-50",
    accentText: "text-amber-800",
    accentBorderLeft: "border-l-amber-500",
    accentDot: "bg-amber-500",
    items: [
      { label: "Quotes", href: "/quotes" },
      { label: "Sales Orders", href: "/sales-orders" },
      { label: "Delivery Challans", href: "/delivery-challans" },
      { label: "Invoices", href: "/settings/invoice" },
      { label: "Recurring Invoices", href: "/recurring-invoices" },
      { label: "Payments Received", href: "/payments-received" },
      { label: "Credit Notes", href: "/credit-notes" },
      { label: "Delivery Notes" },
      { label: "Packing Slips" }
    ]
  },
  {
    id: "purchases",
    title: "Purchases",
    icon: ShoppingBag,
    accentBg: "bg-lime-50/70 hover:bg-lime-50",
    accentText: "text-lime-800",
    accentBorderLeft: "border-l-lime-500",
    accentDot: "bg-lime-500",
    items: [
      { label: "Expenses", href: "/expenses" },
      { label: "Recurring Expenses", href: "/recurring-expenses" },
      { label: "Purchase Orders", href: "/purchase-orders" },
      { label: "Bills", href: "/bills" },
      { label: "Recurring Bills", href: "/recurring-bills" },
      { label: "Payments Made", href: "/payments-made" },
      { label: "Vendor Credits", href: "/vendor-credits" }
    ]
  },
  {
    id: "custom_modules",
    title: "Custom Modules",
    icon: Boxes,
    accentBg: "bg-fuchsia-50/70 hover:bg-fuchsia-50",
    accentText: "text-fuchsia-800",
    accentBorderLeft: "border-l-fuchsia-500",
    accentDot: "bg-fuchsia-500",
    items: [
      { label: "Overview" },
      { label: "Extension and Developer Data" }
    ]
  },
  {
    id: "integrations_marketplace",
    title: "Integrations",
    icon: Globe,
    accentBg: "bg-sky-50/70 hover:bg-sky-50",
    accentText: "text-sky-800",
    accentBorderLeft: "border-l-sky-500",
    accentDot: "bg-sky-500",
    items: [
      { label: "Zoho Apps" },
      { label: "WhatsApp" },
      { label: "SMS Integrations" },
      { label: "Bharat Connect" },
      { label: "Uber for Business" },
      { label: "Other Apps" }
    ]
  },
  {
    id: "marketplace",
    title: "Marketplace",
    icon: Store,
    accentBg: "bg-violet-50/70 hover:bg-violet-50",
    accentText: "text-violet-800",
    accentBorderLeft: "border-l-violet-500",
    accentDot: "bg-violet-500",
    items: [
      { label: "Developer Data" },
      { label: "Widgets" },
      { label: "Incoming Webhooks" },
      { label: "Connections" },
      { label: "API Usage" },
      { label: "Signals" }
    ]
  },
  {
    id: "data_management",
    title: "Data Management",
    icon: Database,
    accentBg: "bg-purple-50/70 hover:bg-purple-50",
    accentText: "text-purple-800",
    accentBorderLeft: "border-l-purple-500",
    accentDot: "bg-purple-500",
    items: [
      { label: "Deluge Components Usage" },
      { label: "Web Forms" }
    ]
  }
];

export default function RedesignedSettings() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Setup keyboard shortcut (/) to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter Categories and Items
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return CATEGORIES;

    return CATEGORIES.map(category => {
      // Check if category title matches
      const categoryMatches = category.title.toLowerCase().includes(query);

      // Filter items that match the search query
      const matchingItems = category.items.filter(item =>
        item.label.toLowerCase().includes(query)
      );

      if (categoryMatches) {
        // If category title matches, show all items
        return category;
      } else if (matchingItems.length > 0) {
        // Otherwise, show only matching items
        return {
          ...category,
          items: matchingItems
        };
      }
      return null;
    }).filter(Boolean) as SettingCategory[];
  }, [searchQuery]);

  const handleLinkClick = (e: React.MouseEvent, item: SettingItem, categoryTitle: string) => {
    if (!item.href) {
      e.preventDefault();
      setToastMessage(`${item.label} (${categoryTitle}) configuration option is coming soon!`);
    }
  };

  // Toast Auto-hide timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-800 flex flex-col">
      {/* Top Header bar */}
      <header className="sticky top-0 bg-white border-b border-zinc-200/80 px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm border border-blue-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-extrabold text-zinc-950 tracking-tight flex items-center gap-1.5">
              All Settings
            </h1>
            <p className="text-[11px] font-semibold text-zinc-400">
              Demand Tech (Vikarah Tech Private Limited)
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative w-full max-w-lg">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search settings ( / )"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-zinc-800 placeholder:text-zinc-400 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1 px-3 py-2 bg-rose-50 border border-rose-200/50 hover:bg-rose-100 hover:border-rose-300 text-rose-700 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            Close Settings
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner info */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-4 flex items-center justify-between gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-[12.5px] text-zinc-600 font-medium">
              Configure system parameters. Unimplemented settings are clearly indicated and will navigate to their pages once active.
            </p>
          </div>
        </div>

        {/* Grid of Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="bg-white border border-zinc-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all overflow-hidden flex flex-col group hover:-translate-y-0.5 duration-200"
              >
                {/* Category Header */}
                <div className={cn("px-4 py-3.5 border-b border-zinc-100 flex items-center gap-2.5 border-l-4", category.accentBg, category.accentBorderLeft)}>
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white bg-white/10 shadow-inner")}>
                    <Icon className={cn("w-4 h-4", category.accentText)} />
                  </div>
                  <h3 className={cn("text-[13.5px] font-extrabold tracking-tight", category.accentText)}>
                    {category.title}
                  </h3>
                  <div className={cn("w-1.5 h-1.5 rounded-full ml-auto", category.accentDot)} />
                </div>

                {/* Category Items List */}
                <div className="p-2 flex-1 flex flex-col divide-y divide-zinc-50">
                  {category.items.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href || "#"}
                      onClick={(e) => handleLinkClick(e, item, category.title)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-[12.5px] rounded-lg transition-colors font-medium select-none text-zinc-600 hover:text-blue-600 hover:bg-zinc-50/50",
                        item.href ? "text-zinc-800" : ""
                      )}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded animate-pulse shadow-sm border border-rose-600/10">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="col-span-full bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-400 text-[13px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <Sliders className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              No settings match your search term. Try typing another keyword!
            </div>
          )}
        </div>
      </main>

      {/* Slide-in Toast Alert Container */}
      <div
        className={cn(
          "fixed bottom-5 right-5 bg-zinc-950 border border-zinc-800 text-zinc-150 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm transition-all duration-300 z-50 transform",
          toastMessage ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
        )}
      >
        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span className="text-[12px] font-semibold text-zinc-200">{toastMessage}</span>
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

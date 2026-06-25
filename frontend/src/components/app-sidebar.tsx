"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import {
  Home,
  Package,
  Layers,
  ShoppingCart,
  ShoppingBag,
  Clock,
  Landmark,
  Percent,
  Calculator,
  BarChart3,
  Folder,
  Settings,
  ChevronRight,
  Plus,
  Search,
  Sparkles,
  MoreVertical
} from "lucide-react"

interface NavItem {
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  subItems?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Home", icon: Home, href: "/" },
  {
    label: "Items",
    icon: Package,
    subItems: [
      { label: "Products", href: "/products" },
    ]
  },
  {
    label: "Inventory",
    icon: Layers,
    subItems: [
      { label: "Inventory", href: "/inventory" },
    ]
  },
  {
    label: "Sales",
    icon: ShoppingCart,
    subItems: [
      { label: "Customers", href: "/customers" },
      { label: "Quotes", href: "/quotes" },
      { label: "Sales Orders", href: "/sales-orders" },
      { label: "Invoices", href: "/invoices" },
      { label: "Recurring Invoices", href: "/recurring-invoices" },
      { label: "Delivery Challans", href: "/delivery-challans" },
      { label: "Payments Received", href: "/payments-received" },
      { label: "Credit Notes", href: "/credit-notes" },
      { label: "e-Way Bills", href: "/eway-bills" },
    ]
  },
  {
    label: "Purchases",
    icon: ShoppingBag,
    subItems: [
      { label: "Vendors", href: "/vendors" },
      { label: "Expenses", href: "/expenses" },
      { label: "Recurring Expenses", href: "/recurring-expenses" },
      { label: "Purchase Orders", href: "/purchase-orders" },
      { label: "Bills", href: "/bills" },
      { label: "Recurring Bills", href: "/recurring-bills" },
      { label: "Payments Made", href: "/payments-made" },
      { label: "Vendor Credits", href: "/vendor-credits" },
    ]
  },
  {
    label: "Time Tracking",
    icon: Clock,
    subItems: [
      { label: "Timesheets", href: "/timesheets" },
      { label: "Projects", href: "/projects" },
    ]
  },
  {
    label: "Banking",
    icon: Landmark,
    href: "/banking"
  },
  {
    label: "Filing & Compliance",
    icon: Percent,
    subItems: [
      { label: "GST Filing", href: "/gst-filing" },
      { label: "TDS Liabilities", href: "/tds-liabilities" },
      { label: "TDS Challans", href: "/tds-challans" },
    ]
  },
  {
    label: "Accountant",
    icon: Calculator,
    subItems: [
      { label: "Manual Journals", href: "/manual-journals" },
      { label: "Bulk Update", href: "/bulk-update" },
      { label: "Currency Adjustments", href: "/currency-adjustments" },
      { label: "Chart of Accounts", href: "/chart-of-accounts" },
      { label: "Budgets", href: "/budgets" },
      { label: "Transaction Locking", href: "/transaction-locking" },
    ]
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/reports-analytics"
  },
  {
    label: "Documents",
    icon: Folder,
    href: "/documents"
  }
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sm">DemandBooks</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Quick Action Group from Dashboard block styles */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                tooltip="Quick Create"
              >
                <Plus className="size-4" />
                <span>Quick Create</span>
              </SidebarMenuButton>
              <Button
                aria-label="Search items"
                className="size-8 group-data-[collapsible=icon]:opacity-0 bg-transparent text-muted-foreground border-sidebar-border hover:bg-sidebar-accent"
                size="icon"
                variant="outline"
              >
                <Search className="size-4" />
                <span className="sr-only">Search</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.subItems) {
                const isActive = item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href + "/"));
                return (
                  <Collapsible key={item.label} defaultOpen={isActive} render={<SidebarMenuItem />} className="group/collapsible">
                    <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.label} isActive={isActive} />}>
                      <Icon className="size-4 text-muted-foreground group-data-[active=true]:text-primary" />
                      <span className="font-medium text-sm">{item.label}</span>
                      <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + "/");
                          return (
                            <SidebarMenuSubItem key={subItem.label}>
                              <SidebarMenuSubButton render={<Link href={subItem.href} />} isActive={isSubActive}>
                                <span className="text-xs">{subItem.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              // Simple link
              const isActive = item.href ? (item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/")) : false;
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton render={<Link href={item.href!} />} tooltip={item.label} isActive={isActive}>
                    <Icon className="size-4 text-muted-foreground group-data-[active=true]:text-primary" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/settings" />} tooltip="Settings" isActive={pathname === "/settings" || pathname.startsWith("/settings/")}>
              <Settings className="size-4 text-muted-foreground group-data-[active=true]:text-primary" />
              <span className="font-medium text-sm">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="mt-1">
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                SA
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-xs">Sanjog Adhav</span>
                <span className="truncate text-[10px] text-muted-foreground">Store Owner</span>
              </div>
              <MoreVertical className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

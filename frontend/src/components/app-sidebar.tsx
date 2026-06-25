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

interface NavItem {
  label: string;
  icon: string;
  href?: string;
  subItems?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Home", icon: "home", href: "/" },
  {
    label: "Items",
    icon: "work_outline",
    subItems: [
      { label: "Products", href: "/products" },
    ]
  },
  {
    label: "Inventory",
    icon: "inventory_2",
    subItems: [
      { label: "Inventory", href: "/inventory" },
    ]
  },
  {
    label: "Sales",
    icon: "shopping_cart",
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
    icon: "local_mall",
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
    icon: "schedule",
    subItems: [
      { label: "Timesheets", href: "/timesheets" },
      { label: "Projects", href: "/projects" },
    ]
  },
  {
    label: "Banking",
    icon: "account_balance",
    href: "/banking"
  },
  {
    label: "Filing & Compliance",
    icon: "request_quote",
    subItems: [
      { label: "GST Filing", href: "/gst-filing" },
      { label: "TDS Liabilities", href: "/tds-liabilities" },
      { label: "TDS Challans", href: "/tds-challans" },
    ]
  },
  {
    label: "Accountant",
    icon: "manage_accounts",
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
    icon: "bar_chart",
    href: "/reports-analytics"
  },
  {
    label: "Documents",
    icon: "folder",
    href: "/documents"
  }
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sm">DemandBooks</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              if (item.subItems) {
                const isActive = item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href + "/"));
                return (
                  <Collapsible key={item.label} defaultOpen={isActive} render={<SidebarMenuItem />} className="group/collapsible">
                    <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.label} isActive={isActive} />}>
                      <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                      <span>{item.label}</span>
                      <span className="material-symbols-outlined ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90 text-[16px]">
                        chevron_right
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + "/");
                          return (
                            <SidebarMenuSubItem key={subItem.label}>
                              <SidebarMenuSubButton render={<Link href={subItem.href} />} isActive={isSubActive}>
                                <span>{subItem.label}</span>
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
                    <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/settings" />} tooltip="Settings" isActive={pathname === "/settings" || pathname.startsWith("/settings/")}>
              <span className="material-symbols-outlined text-[19px]">settings</span>
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                SA
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Sanjog Adhav</span>
                <span className="truncate text-xs">Store Owner</span>
              </div>
              <span className="material-symbols-outlined ml-auto text-[16px]">more_vert</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

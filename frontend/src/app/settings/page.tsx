"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SectionCard, FormField, inputCls, selectCls } from "@/components/ui/page-shell";

export default function Settings() {
  // We will fetch real data later, but for now we remove the old modal state
  const [companyName] = useState("Demand Tech");
  const [taxId] = useState("U73100PN2026PTC250192");
  const [email] = useState("admin@demand-tech.com");

  return (
    <div className="p-8 max-w-[1024px] mx-auto space-y-8 flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div>
        <h1 className="font-headline-md text-headline-md text-foreground mb-1 font-bold">
          System Settings
        </h1>
        <p className="font-body-md text-muted-foreground">
          Manage your company preferences, team access, and financial compliance.
        </p>
      </div>

      {/* Company Profile Highlight (Bento Style) */}
      <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Company Logo */}
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-card-container flex items-center justify-center overflow-hidden border-2 border-primary/10 relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg8vUEO52RTc5MYp6yi8zDx42B-PdvhVFIxIRzInoel6yOhkLiqi_Y5dK6zAIEodPE2e7mceD77tYuUCLonU4UpU-F1QdinC7eYaROv7S2p9NemOZbeSm9FYuTe0fSMBRMhfocgT6TzbuK-edVYPUtbtAjt_9e-QCE6pHwE4amPVr4UyZYqBj3e8zLDcDFcMXefRDdu7RWN6lOdiDGkP8Lt8V5_zaGQnFUaNrUlnDJzE_-wRWPBNcmDTlXaeQGkFWIH5wl5gS-Je0"
                alt="Company Logo"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <Link
              href="/settings/organization"
              className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full shadow-lg active:scale-95 transition-transform inline-flex"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </Link>
          </div>

          {/* Company Details */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-foreground font-bold">
                  {companyName}
                </h2>
                <p className="text-body-md text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  San Francisco, CA • Headquarters
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-label-md rounded-full border border-primary/20 text-xs font-semibold">
                Verified Business
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card-container-lowest p-3 border border-border rounded-lg shadow-sm">
                <p className="text-label-md text-muted-foreground mb-1 font-bold text-xs uppercase">
                  Tax ID
                </p>
                <p className="font-mono-data text-foreground text-sm font-bold">{taxId}</p>
              </div>
              <div className="bg-card-container-lowest p-3 border border-border rounded-lg shadow-sm">
                <p className="text-label-md text-muted-foreground mb-1 font-bold text-xs uppercase">
                  Primary Email
                </p>
                <p className="font-mono-data text-foreground text-sm font-bold truncate">{email}</p>
              </div>
              <div className="bg-card-container-lowest p-3 border border-border rounded-lg shadow-sm">
                <p className="text-label-md text-muted-foreground mb-1 font-bold text-xs uppercase">
                  Fiscal Year
                </p>
                <p className="font-mono-data text-foreground text-sm font-bold">Jan - Dec</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card-container-low px-6 py-3 border-t border-border flex justify-end">
          <Link
            href="/settings/organization"
            className="text-primary font-semibold text-body-sm flex items-center gap-0.5 hover:underline"
          >
            Edit Company Profile{" "}
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>
      </section>

      {/* Settings Categories List */}
      <div className="grid grid-cols-1 gap-4">
        {/* Category Item: User Management */}
        <Link
          href="/users"
          className="flex items-center text-left p-4 bg-card border border-border rounded-xl hover:bg-card-container-low transition-all active:scale-[0.99] group shadow-sm"
        >
          <div className="w-12 h-12 flex-shrink-0 bg-secondary rounded-lg flex items-center justify-center text-secondary-foreground-fixed mr-4 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">person</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-body-lg text-foreground group-hover:text-primary transition-colors">
              User Management &amp; Roles
            </h3>
            <p className="text-body-sm text-muted-foreground">
              Control who can access your books and define their permissions.
            </p>
          </div>
          <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">
            chevron_right
          </span>
        </Link>

        {/* Category Item: Taxes & Compliance */}
        <Link
          href="/tax-reports"
          className="flex items-center text-left p-4 bg-card border border-border rounded-xl hover:bg-card-container-low transition-all active:scale-[0.99] group shadow-sm"
        >
          <div className="w-12 h-12 flex-shrink-0 bg-tertiary-fixed rounded-lg flex items-center justify-center text-on-tertiary-fixed mr-4 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">account_balance</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-body-lg text-foreground group-hover:text-primary transition-colors">
              Taxes &amp; Compliance
            </h3>
            <p className="text-body-sm text-muted-foreground">
              Configure GST/VAT settings, tax rates, and regulatory reporting.
            </p>
          </div>
          <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">
            chevron_right
          </span>
        </Link>

        {/* Category Item: Invoice Templates */}
        <button
          onClick={() => alert("Invoice styling settings coming soon.")}
          className="flex items-center text-left p-4 bg-card border border-border rounded-xl hover:bg-card-container-low transition-all active:scale-[0.99] group shadow-sm"
        >
          <div className="w-12 h-12 flex-shrink-0 bg-primary rounded-lg flex items-center justify-center text-primary-foreground-fixed mr-4 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">palette</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-body-lg text-foreground">Invoice Templates</h3>
            <p className="text-body-sm text-muted-foreground">
              Customize the look and feel of your outbound financial documents.
            </p>
          </div>
          <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">
            chevron_right
          </span>
        </button>

        {/* Category Item: Email Notifications */}
        <button
          onClick={() => alert("Email automation settings coming soon.")}
          className="flex items-center text-left p-4 bg-card border border-border rounded-xl hover:bg-card-container-low transition-all active:scale-[0.99] group shadow-sm"
        >
          <div className="w-12 h-12 flex-shrink-0 bg-card-container-highest rounded-lg flex items-center justify-center text-primary mr-4 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">mail</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-body-lg text-foreground">Email Notifications</h3>
            <p className="text-body-sm text-muted-foreground">
              Set up automated reminders, payment receipts, and staff alerts.
            </p>
          </div>
          <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">
            chevron_right
          </span>
        </button>

        {/* Category Item: Audit Logs */}
        <button
          onClick={() => alert("Redirecting to system audit logs...")}
          className="flex items-center text-left p-4 bg-card border border-border rounded-xl hover:bg-card-container-low transition-all active:scale-[0.99] group shadow-sm"
        >
          <div className="w-12 h-12 flex-shrink-0 bg-destructive/15 rounded-lg flex items-center justify-center text-destructive mr-4 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">history_edu</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-body-lg text-foreground">Audit Logs</h3>
            <p className="text-body-sm text-muted-foreground">
              Track every change made to your books for security and accountability.
            </p>
          </div>
          <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">
            chevron_right
          </span>
        </button>
      </div>

      {/* Billing Danger Zone */}
      <div className="pt-6 border-t border-border">
        <div className="bg-destructive/15/20 border border-error/20 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <h4 className="font-semibold text-body-md text-destructive font-bold">
              Subscription &amp; Billing
            </h4>
            <p className="text-body-sm text-muted-foreground mt-0.5">
              Manage your Professional Plan subscription billing preferences.
            </p>
          </div>
          <button
            onClick={() => alert("Billing management is locked.")}
            className="px-4 py-2 bg-white border border-error/30 text-destructive font-semibold text-label-md rounded-lg hover:bg-destructive/15/30 transition-colors text-xs"
          >
            Upgrade Plan
          </button>
        </div>
      </div>


    </div>
  );
}

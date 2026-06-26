"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PageHeader, StatCard, SectionCard, StatusBadge,
  SearchBar, FilterSelect, FAB, EmptyState
} from "@/components/ui/page-shell";

interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  type: string;
  balance: number;
  status: string;
  imageUrl?: string;
  iconName?: string;
  email?: string;
  phone?: string;
}

const initialVendors: Vendor[] = [
  { id: "VND-001", name: "Global Logistics Co.", contactPerson: "Sarah Jenkins", type: "Business", balance: 12450.0, status: "Active", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTQmFLuaum4bXhnKJYAFHOpfwFYh4PpdbQy-lEGIh-l4CYsP7DLih2POZP7l6aKyVtY4rDUG3FiCVBGTof_VobzSx8e6goWdnNVNTEci1nSr6LNvELBBANzImnb4rioOsLgQo2VT__GKb_ycSJ7Wvs0DuK-400Z3HA7atENn01Ma6cs5uO4QyfYgYrhQbXNyo9TZtz5RCpqy_irFwKcRtmMUcvm4qlnXTZJT4_CrZvYvlJydytEGfFnXEQeLhboVxxpWOwIOH1WNo", email: "sarah@globallogistics.com", phone: "+91 98765 12345" },
  { id: "VND-002", name: "TechSystems Inc.", contactPerson: "Marcus Thorne", type: "Business", balance: 4200.5, status: "Active", iconName: "apartment", email: "billing@techsystems.com", phone: "+91 98765 54321" },
  { id: "VND-003", name: "Creative Solutions", contactPerson: "Elena Rossi", type: "Business", balance: 0.0, status: "Inactive", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYYLlYJEe7QtN14co-vFOOV8E-oE4R9s7r-oZR8suX31-6TBy6Krwa-LbgmiA8U6FqrE3oMxoN45Xtj2vG4-OZC5W0tfQ5u_VhcCGDxIB793Z8glWK8AqPfZwPh4rBFTVDwJqTVYiBKyt1dw9AWzhOmP2-VcTLJp__6LlrD_GDis_6bVqzOhiz9EMUtIFc1YVFSqc3yHX8_Qtn31nnjoiVSS2Sd-O0la8BJRCVRDOsgep4iIrTTBYjVzSNzi963pJkEIE7pyU9XNg", email: "elena@creative.it", phone: "+39 02 123456" },
  { id: "VND-004", name: "Swift Delivery LLC", contactPerson: "Jason Bourne", type: "Business", balance: 8900.0, status: "Active", iconName: "local_shipping", email: "jason@swiftdelivery.com", phone: "+1 800 555 0199" },
  { id: "VND-005", name: "Cloud Services Ltd.", contactPerson: "Anita Desai", type: "Business", balance: 1250.0, status: "Inactive", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCdItTQ2abMon1tzQSgEbt1YwIXVUTBSRKIdl1_PjXaHk_BrlJ7jV7ZNEITxWXJ5VfDTmiTeGdXAh-O7gs3K-iYouL1pUEPdlNA_BTV6xZdeAcoZWEVz6z9D3s5bEqriqsXEt7NvUat4J3IxFjF_93lBwmqfsLofNb26FHreuHHixNIFCLLjenfeRlUc2vbbmCeyLkWqxDldTT_1CH-g4DNjwkaCOeYoVbnkT0E8U5JKV_4J47TxKnAfVnd9NGC7iFVbvmwUsHlLY", email: "anita@cloudservices.in", phone: "+91 80 4321 8765" },
];

export default function Vendors() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8888/api/client/list?type=vendor", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const res = await response.json();
        if (res.success && res.clients) {
          if (res.clients.length > 0) {
            const mapped: Vendor[] = res.clients.map((c: any) => ({
              id: c.custom_id,
              name: c.name,
              contactPerson: c.primary_contact_first_name 
                ? `${c.primary_contact_salutation || ""} ${c.primary_contact_first_name} ${c.primary_contact_last_name || ""}`.trim()
                : c.name,
              type: c.customer_type || "Business",
              balance: parseFloat(c.balance) || 0,
              status: c.status || "Active",
              iconName: "storefront",
              email: c.email.includes("no-email") ? "" : c.email,
              phone: c.phone === "—" ? "" : c.phone
            }));
            setVendors(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch vendors from API:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  const filtered = vendors.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      v.name.toLowerCase().includes(q) || 
      v.contactPerson.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      (v.email && v.email.toLowerCase().includes(q));

    const matchesStatus = 
      selectedStatus === "All" || 
      v.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPayables = vendors.reduce((s, v) => s + v.balance, 0);
  const activeCount = vendors.filter((v) => v.status === "Active" || v.status === "Paid").length;

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <PageHeader
        title="Vendors"
        subtitle="Manage supplier relationships, track payables, and monitor vendor portal accounts."
        actions={
          <button
            onClick={() => router.push("/vendors/new")}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            New Vendor
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Vendors" value={String(vendors.length)} icon="storefront" trend={{ label: "Active relationships", up: true }} />
        <StatCard label="Total Payables" value={`₹${totalPayables.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} icon="payments" trend={{ label: "Across all vendors", up: null }} />
        <StatCard label="Active Vendors" value={String(activeCount)} icon="autorenew" iconColor="text-primary" trend={{ label: "Status Active", up: true }} />
      </div>

      {/* Vendor Grid */}
      <SectionCard
        title="Vendor Directory"
        subtitle={loading ? "Loading vendors..." : `${filtered.length} vendors`}
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search vendors..." />
            <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={["All", "Active", "Inactive"]} />
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((vendor) => (
            <div
              key={vendor.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card-container-lowest hover:bg-card-container-low hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-card-container-high flex items-center justify-center relative shrink-0">
                  {vendor.imageUrl ? (
                    <Image src={vendor.imageUrl} alt={vendor.name} fill sizes="40px" className="object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {vendor.iconName || "storefront"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{vendor.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {vendor.contactPerson} &bull;{" "}
                    <span className="font-semibold text-primary">
                      {vendor.type}
                    </span>
                  </p>
                  {vendor.email && <p className="text-[10px] text-muted-foreground">{vendor.email}</p>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-sm text-foreground font-mono">
                  ₹{vendor.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <StatusBadge status={vendor.status} />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 py-16 text-center text-muted-foreground">
              <span className="material-symbols-outlined text-[40px] block mb-2 opacity-30">storefront</span>
              <p className="text-sm font-semibold">No vendors match your filters.</p>
            </div>
          )}
        </div>
      </SectionCard>

      <FAB label="New Vendor" onClick={() => router.push("/vendors/new")} />
    </div>
  );
}
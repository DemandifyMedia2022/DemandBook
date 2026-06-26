"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  ArrowLeft,
  Phone,
  Smartphone,
  ExternalLink,
  UploadCloud,
  X,
  FileText,
  Building2,
  User,
  Save,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Shared local UI (matches the Delivery Challan page's conventions)
// ---------------------------------------------------------------------------
function SectionCard({
  title,
  children,
  icon,
  noPadding,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
        {icon && <span className="text-zinc-400">{icon}</span>}
        <h2 className="text-[14px] font-semibold text-zinc-900">{title}</h2>
      </div>
      <div className={noPadding ? "" : "px-6 py-5"}>{children}</div>
    </div>
  );
}

function Label({
  children,
  required,
  className,
}: {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("block text-[12px] font-medium text-zinc-600 mb-1.5", className)}>
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2 text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B5FEF]/20 focus:border-[#5B5FEF]/40 focus:bg-white transition-colors placeholder:text-zinc-400";

const selectCls = cn(inputCls, "appearance-none cursor-pointer");

const radioCls = "accent-[#5B5FEF]";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const indianStates: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
  "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
  "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "29": "Karnataka",
  "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
  "35": "Andaman & Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function NewCustomer() {
  const router = useRouter();

  // Basic Details
  const [gstin, setGstin] = useState("");
  const [customerType, setCustomerType] = useState("Business");

  // Primary Contact
  const [salutation, setSalutation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Contact Info
  const [email, setEmail] = useState("");
  const [workPhone, setWorkPhone] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [customerLanguage, setCustomerLanguage] = useState("English");

  // Tax Details
  const [gstTreatment, setGstTreatment] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [pan, setPan] = useState("");
  const [taxPreference, setTaxPreference] = useState("Taxable");
  const [currency, setCurrency] = useState("INR");

  // Financial
  const [openingBalance, setOpeningBalance] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Due on Receipt");

  // Preferences
  const [enablePortal, setEnablePortal] = useState(false);

  // Other details tabs
  const [activeTab, setActiveTab] = useState("Address");

  // Documents
  const [documents, setDocuments] = useState<File[]>([]);

  const handleFetchGSTIN = () => {
    if (!gstin) return alert("Please enter GSTIN first");

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!gstRegex.test(gstin)) {
      alert("Invalid GSTIN format. Please check the entered GSTIN.");
      return;
    }

    // Auto-detect PAN and State
    const extractedPan = gstin.substring(2, 12).toUpperCase();
    const stateCode = gstin.substring(0, 2);
    const stateName = indianStates[stateCode] || "";

    setPan(extractedPan);
    setTaxPreference("Taxable");
    setGstTreatment("Registered Business - Regular");
    if (stateName) {
      setPlaceOfSupply(`${stateCode}-${stateName}`);
    } else {
      setPlaceOfSupply(stateCode);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (documents.length + newFiles.length > 10) {
        alert("You can upload a maximum of 10 files");
        return;
      }
      setDocuments([...documents, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setDocuments((docs) => docs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName) {
      alert("Error: Enter the Display Name of your customer.");
      return;
    }

    try {
      // Create a unique ID for the new customer
      const custom_id = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        custom_id,
        name: displayName,
        email: email || `no-email-${Date.now()}@example.com`,
        phone: mobilePhone || workPhone || "—",
        type: "customer",
        status: "Active",
        balance: openingBalance || 0,
        gstin,
        customer_type: customerType,
        primary_contact_salutation: salutation,
        primary_contact_first_name: firstName,
        primary_contact_last_name: lastName,
        company_name: companyName,
        display_name: displayName,
        work_phone: workPhone,
        mobile_phone: mobilePhone,
        customer_language: customerLanguage,
        gst_treatment: gstTreatment,
        place_of_supply: placeOfSupply,
        pan,
        tax_preference: taxPreference,
        currency,
        payment_terms: paymentTerms,
        enable_portal: enablePortal,
      };

      const response = await fetch(`http://localhost:8888/api/client/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const res = await response.json();
      if (res.success) {
        alert("Customer created successfully!");
        router.push("/customers");
      } else {
        alert(res.message || "Failed to create customer");
      }
    } catch (error) {
      console.error("Failed to submit", error);
      alert("Error submitting form");
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans antialiased">
      <div className="max-w-[1000px] mx-auto px-8 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/customers")}
              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
                New Customer
              </h1>
              <p className="text-[13px] text-zinc-500 mt-0.5">
                Create a new customer profile and manage their details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/customers")}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              form="new-customer-form"
              type="submit"
              className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Customer
            </button>
          </div>
        </div>

        <form id="new-customer-form" onSubmit={handleSubmit} className="space-y-5">

          {/* GSTIN Prefill */}
          <SectionCard title="Prefill Details" icon={<FileText className="w-4 h-4" />}>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <Label>GSTIN</Label>
                <input
                  className={inputCls}
                  placeholder="e.g. 27ABCDE1234F1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  maxLength={15}
                />
              </div>
              <button
                type="button"
                onClick={handleFetchGSTIN}
                disabled={!gstin}
                className="px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                Auto-fill PAN &amp; State
              </button>
              <a
                href="https://services.gst.gov.in/services/searchtp"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                Verify on Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </SectionCard>

          {/* Basic Info */}
          <SectionCard title="Basic Information" icon={<User className="w-4 h-4" />}>
            <div className="space-y-5">
              <div className="flex items-center gap-6">
                <label className="text-[13px] font-medium text-zinc-600 w-32 shrink-0">
                  Customer Type
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-[13px] text-zinc-700">
                    <input
                      type="radio"
                      name="custType"
                      checked={customerType === "Business"}
                      onChange={() => setCustomerType("Business")}
                      className={radioCls}
                    />
                    Business
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[13px] text-zinc-700">
                    <input
                      type="radio"
                      name="custType"
                      checked={customerType === "Individual"}
                      onChange={() => setCustomerType("Individual")}
                      className={radioCls}
                    />
                    Individual
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <label className="text-[13px] font-medium text-zinc-600 w-32 shrink-0 pt-2">
                  Primary Contact
                </label>
                <div className="flex gap-2 flex-1">
                  <select
                    className={cn(selectCls, "w-24")}
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                  >
                    <option value="">Salutation</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                  <input
                    className={cn(inputCls, "flex-1")}
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <input
                    className={cn(inputCls, "flex-1")}
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="text-[13px] font-medium text-zinc-600 w-32 shrink-0">
                  Company Name
                </label>
                <div className="flex-1">
                  <input
                    className={inputCls}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="text-[13px] font-medium text-red-500 w-32 shrink-0">
                  Display Name *
                </label>
                <div className="flex-1">
                  <input
                    required
                    className={cn(inputCls, !displayName && "border-red-300")}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Select or type to add"
                  />
                  {!displayName && (
                    <p className="text-[11px] text-red-500 mt-1">
                      Error: Enter the Display Name of your customer.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="text-[13px] font-medium text-zinc-600 w-32 shrink-0">
                  Email Address
                </label>
                <div className="flex-1">
                  <input
                    type="email"
                    className={inputCls}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-start gap-6">
                <label className="text-[13px] font-medium text-zinc-600 w-32 shrink-0 pt-2">
                  Phone
                </label>
                <div className="flex gap-4 flex-1">
                  <div className="flex-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <input
                      className={inputCls}
                      placeholder="Work Phone"
                      value={workPhone}
                      onChange={(e) => setWorkPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-zinc-400" />
                    <input
                      className={inputCls}
                      placeholder="Mobile"
                      value={mobilePhone}
                      onChange={(e) => setMobilePhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="text-[13px] font-medium text-zinc-600 w-32 shrink-0">
                  Customer Language
                </label>
                <div className="max-w-[200px] w-full">
                  <select
                    className={selectCls}
                    value={customerLanguage}
                    onChange={(e) => setCustomerLanguage(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Other Details Tabs */}
          <SectionCard title="Other Details" icon={<Building2 className="w-4 h-4" />} noPadding>
            <div className="border-b border-zinc-100 px-6 pt-4 flex gap-6 overflow-x-auto">
              {["Address", "Contact Persons", "Custom Fields", "Reporting Tags", "Remarks"].map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "pb-3 text-[13px] font-medium transition-colors border-b-2 whitespace-nowrap",
                      activeTab === tab
                        ? "border-[#5B5FEF] text-[#5B5FEF]"
                        : "border-transparent text-zinc-500 hover:text-zinc-700"
                    )}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
            <div className="px-6 py-5">
              {activeTab === "Address" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-3 text-[13px] text-zinc-900">
                        Billing Address
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Attention</Label>
                          <input className={inputCls} placeholder="Attention" />
                        </div>
                        <div>
                          <Label>Country/Region</Label>
                          <select className={selectCls}>
                            <option value="India">India</option>
                            <option value="USA">United States</option>
                          </select>
                        </div>
                        <div>
                          <Label>Address</Label>
                          <textarea
                            className={cn(inputCls, "h-16 resize-none mb-2")}
                            placeholder="Street 1"
                          />
                          <textarea
                            className={cn(inputCls, "h-16 resize-none")}
                            placeholder="Street 2"
                          />
                        </div>
                        <div>
                          <Label>City</Label>
                          <input className={inputCls} placeholder="City" />
                        </div>
                        <div>
                          <Label>State</Label>
                          <input className={inputCls} placeholder="Select or type to add" />
                        </div>
                        <div>
                          <Label>Pin Code</Label>
                          <input className={inputCls} placeholder="Pin Code" />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <input className={inputCls} placeholder="Phone" />
                        </div>
                        <div>
                          <Label>Fax Number</Label>
                          <input className={inputCls} placeholder="Fax Number" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-semibold text-[13px] text-zinc-900">
                          Shipping Address
                        </h4>
                        <button
                          type="button"
                          className="text-[#5B5FEF] text-[12px] font-medium hover:underline"
                        >
                          (Copy Billing Address)
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label>Attention</Label>
                          <input className={inputCls} placeholder="Attention" />
                        </div>
                        <div>
                          <Label>Country/Region</Label>
                          <select className={selectCls}>
                            <option value="India">India</option>
                            <option value="USA">United States</option>
                          </select>
                        </div>
                        <div>
                          <Label>Address</Label>
                          <textarea
                            className={cn(inputCls, "h-16 resize-none mb-2")}
                            placeholder="Street 1"
                          />
                          <textarea
                            className={cn(inputCls, "h-16 resize-none")}
                            placeholder="Street 2"
                          />
                        </div>
                        <div>
                          <Label>City</Label>
                          <input className={inputCls} placeholder="City" />
                        </div>
                        <div>
                          <Label>State</Label>
                          <input className={inputCls} placeholder="Select or type to add" />
                        </div>
                        <div>
                          <Label>Pin Code</Label>
                          <input className={inputCls} placeholder="Pin Code" />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <input className={inputCls} placeholder="Phone" />
                        </div>
                        <div>
                          <Label>Fax Number</Label>
                          <input className={inputCls} placeholder="Fax Number" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-[12px] text-zinc-500">
                    <strong className="text-zinc-700">Note:</strong> Add and manage additional
                    addresses from this Customers and Vendors details section. You can customise
                    how customers&apos; addresses are displayed in transaction PDFs. To do this, go
                    to Settings &gt; Preferences &gt; Customers and Vendors, and navigate to the
                    Address Format sections.
                  </div>
                </div>
              )}
              {activeTab === "Remarks" && (
                <textarea
                  className={cn(inputCls, "h-32 resize-none")}
                  placeholder="Add notes about this customer..."
                />
              )}
              {["Contact Persons", "Custom Fields", "Reporting Tags"].includes(activeTab) && (
                <div className="text-center py-10 text-zinc-400 text-[13px]">
                  This section can be configured later.
                </div>
              )}
            </div>
          </SectionCard>

          {/* Financial & Tax Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="Tax Details">
              <div className="space-y-4">
                <div>
                  <Label>GST Treatment</Label>
                  <select
                    className={selectCls}
                    value={gstTreatment}
                    onChange={(e) => setGstTreatment(e.target.value)}
                  >
                    <option value="">Select Treatment</option>
                    <option value="Registered Business - Regular">
                      Registered Business - Regular
                    </option>
                    <option value="Registered Business - Composition">
                      Registered Business - Composition
                    </option>
                    <option value="Unregistered Business">Unregistered Business</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Overseas">Overseas</option>
                  </select>
                </div>
                <div>
                  <Label>Place of Supply</Label>
                  <input
                    className={inputCls}
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    placeholder="e.g. MH-027"
                  />
                </div>
                <div>
                  <Label>PAN</Label>
                  <input
                    className={inputCls}
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    placeholder="ABCDE1234F"
                  />
                </div>
                <div className="pt-2">
                  <Label className="mb-2">Tax Preference</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] text-zinc-700">
                      <input
                        type="radio"
                        name="taxPref"
                        checked={taxPreference === "Taxable"}
                        onChange={() => setTaxPreference("Taxable")}
                        className={radioCls}
                      />
                      Taxable
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] text-zinc-700">
                      <input
                        type="radio"
                        name="taxPref"
                        checked={taxPreference === "Tax Exempt"}
                        onChange={() => setTaxPreference("Tax Exempt")}
                        className={radioCls}
                      />
                      Tax Exempt
                    </label>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Financial Details">
              <div className="space-y-4">
                <div>
                  <Label>Currency</Label>
                  <select
                    className={selectCls}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
                <div className="pt-2 pb-1 border-b border-zinc-100">
                  <h4 className="font-semibold text-[13px] text-zinc-900 mb-1">
                    Accounts Receivable
                  </h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Opening Balance</Label>
                    <input
                      type="number"
                      step="0.01"
                      className={inputCls}
                      value={openingBalance}
                      onChange={(e) => setOpeningBalance(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="mt-5 text-zinc-400 text-[13px] font-medium">{currency}</div>
                </div>
                <div>
                  <Label>Payment Terms</Label>
                  <select
                    className={selectCls}
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Portal Access */}
          <SectionCard title="Portal Configuration">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[13px] text-zinc-900">Enable Portal?</p>
                <p className="text-[12px] text-zinc-500">
                  Allow portal access for this customer
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={enablePortal}
                  onChange={(e) => setEnablePortal(e.target.checked)}
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B5FEF]"></div>
              </label>
            </div>
          </SectionCard>

          {/* Documents */}
          <SectionCard title="Documents">
            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center hover:bg-zinc-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-7 h-7 text-[#5B5FEF] mx-auto mb-2" />
              <p className="font-medium text-[13px] text-zinc-900">
                Click to upload files or drag and drop
              </p>
              <p className="text-[12px] text-zinc-400 mt-1">
                You can upload a maximum of 10 files, 10MB each
              </p>
            </div>

            {documents.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {documents.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-zinc-50 p-2 rounded-lg border border-zinc-200"
                  >
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-medium text-zinc-900 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Customer Owner */}
          <SectionCard title="Additional Details">
            <div className="space-y-3">
              <h4 className="font-semibold text-[13px] text-zinc-900">Customer Owner</h4>
              <p className="text-[12px] text-zinc-500">
                Assign a user as the customer owner to provide access only to the data of this
                customer.
              </p>
              <select className={cn(selectCls, "max-w-[300px]")}>
                <option value="">Select Owner</option>
                <option value="1">John Admin</option>
                <option value="2">Jane Sales</option>
              </select>
            </div>
          </SectionCard>

          {/* Bottom actions */}
          <div className="flex items-center justify-end gap-2 pb-8">
            <button
              type="button"
              onClick={() => router.push("/customers")}
              className="text-[13px] font-medium text-zinc-500 hover:text-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
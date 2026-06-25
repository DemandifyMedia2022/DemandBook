"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageHeader, SectionCard, FormField, inputCls, selectCls } from "@/components/ui/page-shell";

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

  const indianStates: Record<string, string> = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
    "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
    "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
    "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
    "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
    "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "29": "Karnataka",
    "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
    "35": "Andaman & Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh"
  };

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
    setDocuments(docs => docs.filter((_, i) => i !== index));
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
        enable_portal: enablePortal
      };

      const response = await fetch(`http://localhost:8888/api/client/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
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
    <div className="p-6 max-w-[1000px] mx-auto space-y-6">
      <PageHeader
        title="New Customer"
        subtitle="Create a new customer profile and manage their details."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GSTIN Prefill Section */}
        <SectionCard title="Prefill Details">
          <div className="flex flex-wrap items-end gap-4 max-w-3xl">
            <div className="flex-1 min-w-[200px]">
              <FormField label="GSTIN">
                <input 
                  className={inputCls} 
                  placeholder="e.g. 27ABCDE1234F1Z5" 
                  value={gstin} 
                  onChange={(e) => setGstin(e.target.value.toUpperCase())} 
                  maxLength={15}
                />
              </FormField>
            </div>
            <button 
              type="button" 
              onClick={handleFetchGSTIN} 
              disabled={!gstin}
              className="px-4 py-2 bg-card-container border border-border rounded-lg text-sm font-semibold hover:bg-card-container-high transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              Auto-fill PAN & State
            </button>
            <a 
              href="https://services.gst.gov.in/services/searchtp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-card-container border border-border rounded-lg text-sm font-semibold hover:bg-card-container-high transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              Verify on Portal <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        </SectionCard>

        {/* Basic Info */}
        <SectionCard title="Basic Information">
          <div className="space-y-5">
            <div className="flex items-center gap-6">
              <label className="text-sm font-semibold text-foreground w-32 shrink-0">Customer Type</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="custType" checked={customerType === "Business"} onChange={() => setCustomerType("Business")} className="accent-primary" />
                  Business
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="custType" checked={customerType === "Individual"} onChange={() => setCustomerType("Individual")} className="accent-primary" />
                  Individual
                </label>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <label className="text-sm font-semibold text-foreground w-32 shrink-0 pt-2">Primary Contact</label>
              <div className="flex gap-2 flex-1">
                <select className={cn(selectCls, "w-24")} value={salutation} onChange={(e) => setSalutation(e.target.value)}>
                  <option value="">Salutation</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                </select>
                <input className={cn(inputCls, "flex-1")} placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <input className={cn(inputCls, "flex-1")} placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="text-sm font-semibold text-foreground w-32 shrink-0">Company Name</label>
              <div className="flex-1">
                <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="text-sm font-semibold text-destructive w-32 shrink-0">Display Name *</label>
              <div className="flex-1">
                <input required className={cn(inputCls, !displayName && "border-error")} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Select or type to add" />
                {!displayName && <p className="text-[11px] text-destructive mt-1">Error: Enter the Display Name of your customer.</p>}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="text-sm font-semibold text-foreground w-32 shrink-0">Email Address</label>
              <div className="flex-1">
                <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="flex items-start gap-6">
              <label className="text-sm font-semibold text-foreground w-32 shrink-0 pt-2">Phone</label>
              <div className="flex gap-4 flex-1">
                <div className="flex-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-muted-foreground">phone</span>
                  <input className={inputCls} placeholder="Work Phone" value={workPhone} onChange={(e) => setWorkPhone(e.target.value)} />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-muted-foreground">smartphone</span>
                  <input className={inputCls} placeholder="Mobile" value={mobilePhone} onChange={(e) => setMobilePhone(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="text-sm font-semibold text-foreground w-32 shrink-0">Customer Language</label>
              <div className="max-w-[200px] w-full">
                <select className={selectCls} value={customerLanguage} onChange={(e) => setCustomerLanguage(e.target.value)}>
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
        <SectionCard title="Other Details" noPadding>
          <div className="border-b border-border px-4 pt-4 flex gap-6 overflow-x-auto">
            {["Address", "Contact Persons", "Custom Fields", "Reporting Tags", "Remarks"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap",
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "Address" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold mb-3 text-sm">Billing Address</h4>
                    <div className="space-y-3">
                      <FormField label="Attention">
                        <input className={inputCls} placeholder="Attention" />
                      </FormField>
                      <FormField label="Country/Region">
                        <select className={selectCls}>
                          <option value="India">India</option>
                          <option value="USA">United States</option>
                        </select>
                      </FormField>
                      <FormField label="Address">
                        <textarea className={cn(inputCls, "h-16 resize-none mb-2")} placeholder="Street 1" />
                        <textarea className={cn(inputCls, "h-16 resize-none")} placeholder="Street 2" />
                      </FormField>
                      <FormField label="City">
                        <input className={inputCls} placeholder="City" />
                      </FormField>
                      <FormField label="State">
                        <input className={inputCls} placeholder="Select or type to add" />
                      </FormField>
                      <FormField label="Pin Code">
                        <input className={inputCls} placeholder="Pin Code" />
                      </FormField>
                      <FormField label="Phone">
                        <input className={inputCls} placeholder="Phone" />
                      </FormField>
                      <FormField label="Fax Number">
                        <input className={inputCls} placeholder="Fax Number" />
                      </FormField>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-bold text-sm">Shipping Address</h4>
                      <button type="button" className="text-primary text-xs font-semibold hover:underline">(Copy Billing Address)</button>
                    </div>
                    <div className="space-y-3">
                      <FormField label="Attention">
                        <input className={inputCls} placeholder="Attention" />
                      </FormField>
                      <FormField label="Country/Region">
                        <select className={selectCls}>
                          <option value="India">India</option>
                          <option value="USA">United States</option>
                        </select>
                      </FormField>
                      <FormField label="Address">
                        <textarea className={cn(inputCls, "h-16 resize-none mb-2")} placeholder="Street 1" />
                        <textarea className={cn(inputCls, "h-16 resize-none")} placeholder="Street 2" />
                      </FormField>
                      <FormField label="City">
                        <input className={inputCls} placeholder="City" />
                      </FormField>
                      <FormField label="State">
                        <input className={inputCls} placeholder="Select or type to add" />
                      </FormField>
                      <FormField label="Pin Code">
                        <input className={inputCls} placeholder="Pin Code" />
                      </FormField>
                      <FormField label="Phone">
                        <input className={inputCls} placeholder="Phone" />
                      </FormField>
                      <FormField label="Fax Number">
                        <input className={inputCls} placeholder="Fax Number" />
                      </FormField>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-card-container rounded-lg border border-border text-sm text-muted-foreground">
                  <strong>Note:</strong> Add and manage additional addresses from this Customers and Vendors details section.
                  You can customise how customers' addresses are displayed in transaction PDFs. To do this, go to Settings &gt; Preferences &gt; Customers and Vendors, and navigate to the Address Format sections.
                </div>
              </div>
            )}
            {activeTab === "Remarks" && (
              <textarea className={cn(inputCls, "h-32")} placeholder="Add notes about this customer..." />
            )}
            {["Contact Persons", "Custom Fields", "Reporting Tags"].includes(activeTab) && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                This section can be configured later.
              </div>
            )}
          </div>
        </SectionCard>

        {/* Financial & Tax Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Tax Details">
            <div className="space-y-4">
              <FormField label="GST Treatment">
                <select className={selectCls} value={gstTreatment} onChange={(e) => setGstTreatment(e.target.value)}>
                  <option value="">Select Treatment</option>
                  <option value="Registered Business - Regular">Registered Business - Regular</option>
                  <option value="Registered Business - Composition">Registered Business - Composition</option>
                  <option value="Unregistered Business">Unregistered Business</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Overseas">Overseas</option>
                </select>
              </FormField>
              <FormField label="Place of Supply">
                <input className={inputCls} value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} placeholder="e.g. MH-027" />
              </FormField>
              <FormField label="PAN">
                <input className={inputCls} value={pan} onChange={(e) => setPan(e.target.value)} placeholder="ABCDE1234F" />
              </FormField>
              <div className="pt-2">
                <label className="text-sm font-semibold text-foreground block mb-2">Tax Preference</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="taxPref" checked={taxPreference === "Taxable"} onChange={() => setTaxPreference("Taxable")} className="accent-primary" />
                    Taxable
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="taxPref" checked={taxPreference === "Tax Exempt"} onChange={() => setTaxPreference("Tax Exempt")} className="accent-primary" />
                    Tax Exempt
                  </label>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Financial Details">
            <div className="space-y-4">
              <FormField label="Currency">
                <select className={selectCls} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </FormField>
              <div className="pt-2 pb-1 border-b border-border">
                <h4 className="font-semibold text-sm mb-1">Accounts Receivable</h4>
              </div>
              <div className="flex items-center gap-4">
                <FormField label="Opening Balance">
                  <input type="number" step="0.01" className={inputCls} value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} placeholder="0.00" />
                </FormField>
                <div className="mt-6 text-muted-foreground font-medium">{currency}</div>
              </div>
              <FormField label="Payment Terms">
                <select className={selectCls} value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </FormField>
            </div>
          </SectionCard>
        </div>

        {/* Portal Access */}
        <SectionCard title="Portal Configuration">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Enable Portal?</p>
              <p className="text-xs text-muted-foreground">Allow portal access for this customer</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={enablePortal} onChange={(e) => setEnablePortal(e.target.checked)} />
              <div className="w-11 h-6 bg-card-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </SectionCard>

        {/* Documents Section */}
        <SectionCard title="Documents">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-card-container transition-colors cursor-pointer relative">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="material-symbols-outlined text-[32px] text-primary mb-2">upload_file</span>
            <p className="font-semibold text-sm">Click to upload files or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">You can upload a maximum of 10 files, 10MB each</p>
          </div>

          {documents.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {documents.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-card-container p-2 rounded-lg border border-border">
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-semibold truncate" title={file.name}>{file.name}</p>
                    <p className="text-[9px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={() => handleRemoveFile(i)} className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Add more details (Customer Owner) */}
        <SectionCard title="Additional Details">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Customer Owner</h4>
            <p className="text-xs text-muted-foreground mb-2">Assign a user as the customer owner to provide access only to the data of this customer.</p>
            <select className={cn(selectCls, "max-w-[300px]")}>
              <option value="">Select Owner</option>
              <option value="1">John Admin</option>
              <option value="2">Jane Sales</option>
            </select>
          </div>
        </SectionCard>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4 pb-10">
          <button type="button" onClick={() => router.push("/customers")} className="px-6 py-2.5 rounded-lg font-bold text-sm text-muted-foreground border border-border hover:bg-card-container transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2.5 rounded-lg font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm active:scale-95">
            Save Customer
          </button>
        </div>
      </form>
    </div>
  );
}

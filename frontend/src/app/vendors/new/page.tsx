"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageHeader, SectionCard, FormField, inputCls, selectCls } from "@/components/ui/page-shell";

export default function NewVendor() {
  const router = useRouter();

  // Basic Details & Prefill
  const [gstin, setGstin] = useState("");
  const [vendorType, setVendorType] = useState("Business");

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
  const [vendorLanguage, setVendorLanguage] = useState("English");

  // Tax Details
  const [gstTreatment, setGstTreatment] = useState("");
  const [sourceOfSupply, setSourceOfSupply] = useState("");
  const [pan, setPan] = useState("");

  // MSME
  const [msmeRegistered, setMsmeRegistered] = useState(false);

  // Financial (Accounts Payable)
  const [currency, setCurrency] = useState("INR");
  const [openingBalance, setOpeningBalance] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Due on Receipt");
  const [tds, setTds] = useState("No TDS");

  // Portal Access
  const [enablePortal, setEnablePortal] = useState(false);

  // Documents
  const [documents, setDocuments] = useState<File[]>([]);

  // Other Details Tabs
  const [activeTab, setActiveTab] = useState("Address");

  // Other details: Address
  const [billingAttention, setBillingAttention] = useState("");
  const [billingCountry, setBillingCountry] = useState("India");
  const [billingStreet1, setBillingStreet1] = useState("");
  const [billingStreet2, setBillingStreet2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPin, setBillingPin] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [billingFax, setBillingFax] = useState("");

  const [shippingAttention, setShippingAttention] = useState("");
  const [shippingCountry, setShippingCountry] = useState("India");
  const [shippingStreet1, setShippingStreet1] = useState("");
  const [shippingStreet2, setShippingStreet2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPin, setShippingPin] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingFax, setShippingFax] = useState("");

  // Other details: Contact Persons
  const [contactPersons, setContactPersons] = useState([
    { salutation: "", firstName: "", lastName: "", email: "", phone: "", mobile: "" }
  ]);

  // Other details: Bank Details
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankBranch, setBankBranch] = useState("");

  // Other details: Custom Fields, Reporting Tags, Remarks
  const [customFields, setCustomFields] = useState<Record<string, string>>({
    "Registration Type": "",
    "Preferred Carrier": ""
  });
  const [reportingTags, setReportingTags] = useState("");
  const [remarks, setRemarks] = useState("");

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

  const handleFetchGSTIN = async () => {
    if (!gstin) return alert("Please enter GSTIN first");
    
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstin)) {
      alert("Invalid GSTIN format. Please check the entered GSTIN.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8888/api/client/gstin/${gstin}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success && result.data) {
        const d = result.data;
        setCompanyName(d.company_name || "");
        setDisplayName(d.display_name || "");
        setPan(d.pan || "");
        setGstTreatment(d.gst_treatment || "Registered Business - Regular");
        setSourceOfSupply(d.place_of_supply || "");
        setSalutation(d.primary_contact_salutation || "");
        setFirstName(d.primary_contact_first_name || "");
        setLastName(d.primary_contact_last_name || "");
        setEmail(d.email || "");
        setWorkPhone(d.work_phone || "");
        setMobilePhone(d.mobile_phone || "");
        setVendorLanguage(d.vendor_language || "English");
        setCurrency(d.currency || "INR");
        setPaymentTerms(d.payment_terms || "Net 30");
        
        if (d.address && d.address.billing) {
          const b = d.address.billing;
          setBillingAttention(b.attention || "");
          setBillingCountry(b.country || "India");
          setBillingStreet1(b.street1 || "");
          setBillingStreet2(b.street2 || "");
          setBillingCity(b.city || "");
          setBillingState(b.state || "");
          setBillingPin(b.pin_code || "");
          setBillingPhone(b.phone || "");
          setBillingFax(b.fax || "");
        }

        if (d.address && d.address.shipping) {
          const s = d.address.shipping;
          setShippingAttention(s.attention || "");
          setShippingCountry(s.country || "India");
          setShippingStreet1(s.street1 || "");
          setShippingStreet2(s.street2 || "");
          setShippingCity(s.city || "");
          setShippingState(s.state || "");
          setShippingPin(s.pin_code || "");
          setShippingPhone(s.phone || "");
          setShippingFax(s.fax || "");
        }

        if (d.bank_details) {
          const bd = d.bank_details;
          setBankName(bd.bank_name || "");
          setAccountNumber(bd.account_number || "");
          setIfscCode(bd.ifsc_code || "");
          setBankBranch(bd.branch || "");
        }

        setMsmeRegistered(!!d.msme_registered);
        setTds(d.tds || "No TDS");

        alert("Vendor details successfully prefilled from GST portal!");
      } else {
        alert(result.message || "Failed to retrieve GSTIN details.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting GST Prefill service. Falling back to local parse.");
      // Fallback local parsing
      const extractedPan = gstin.substring(2, 12).toUpperCase();
      const stateCode = gstin.substring(0, 2);
      const stateName = indianStates[stateCode] || "";
      setPan(extractedPan);
      setGstTreatment("Registered Business - Regular");
      if (stateName) {
        setSourceOfSupply(`${stateCode}-${stateName}`);
      } else {
        setSourceOfSupply(stateCode);
      }
    }
  };

  const handleCopyBillingAddress = () => {
    setShippingAttention(billingAttention);
    setShippingCountry(billingCountry);
    setShippingStreet1(billingStreet1);
    setShippingStreet2(billingStreet2);
    setShippingCity(billingCity);
    setShippingState(billingState);
    setShippingPin(billingPin);
    setShippingPhone(billingPhone);
    setShippingFax(billingFax);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (documents.length + newFiles.length > 10) {
        alert("You can upload a maximum of 10 files");
        return;
      }
      for (const file of newFiles) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" exceeds the 10MB limit.`);
          return;
        }
      }
      setDocuments([...documents, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setDocuments(docs => docs.filter((_, i) => i !== index));
  };

  const handleAddContactPerson = () => {
    setContactPersons([
      ...contactPersons,
      { salutation: "", firstName: "", lastName: "", email: "", phone: "", mobile: "" }
    ]);
  };

  const handleRemoveContactPerson = (idx: number) => {
    setContactPersons(contactPersons.filter((_, i) => i !== idx));
  };

  const updateContactPerson = (idx: number, field: string, val: string) => {
    const updated = [...contactPersons];
    updated[idx] = { ...updated[idx], [field]: val };
    setContactPersons(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName) {
      alert("Error: Enter the Display Name of your vendor.");
      return;
    }

    try {
      const custom_id = `VEND-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        custom_id,
        name: displayName,
        email: email || `no-email-${Date.now()}@example.com`,
        phone: mobilePhone || workPhone || "—",
        type: "vendor",
        status: "Active",
        balance: openingBalance || 0,
        gstin,
        customer_type: vendorType,
        primary_contact_salutation: salutation,
        primary_contact_first_name: firstName,
        primary_contact_last_name: lastName,
        company_name: companyName,
        display_name: displayName,
        work_phone: workPhone,
        mobile_phone: mobilePhone,
        customer_language: vendorLanguage, // store in customer_language column
        gst_treatment: gstTreatment,
        place_of_supply: sourceOfSupply, // store in place_of_supply column
        pan,
        tax_preference: "Taxable",
        currency,
        payment_terms: paymentTerms,
        enable_portal: enablePortal,
        other_details: {
          msme_registered: msmeRegistered,
          tds_rate: tds,
          bank_details: {
            bank_name: bankName,
            account_number: accountNumber,
            ifsc_code: ifscCode,
            branch: bankBranch
          },
          billing_address: {
            attention: billingAttention,
            country: billingCountry,
            street1: billingStreet1,
            street2: billingStreet2,
            city: billingCity,
            state: billingState,
            pin_code: billingPin,
            phone: billingPhone,
            fax: billingFax
          },
          shipping_address: {
            attention: shippingAttention,
            country: shippingCountry,
            street1: shippingStreet1,
            street2: shippingStreet2,
            city: shippingCity,
            state: shippingState,
            pin_code: shippingPin,
            phone: shippingPhone,
            fax: shippingFax
          },
          contact_persons: contactPersons,
          custom_fields: customFields,
          reporting_tags: reportingTags,
          remarks: remarks
        }
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
        alert("Vendor created successfully!");
        router.push("/vendors");
      } else {
        alert(res.message || "Failed to create vendor");
      }
    } catch (error) {
      console.error("Failed to submit", error);
      alert("Error submitting form");
    }
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6">
      <PageHeader
        title="New Vendor"
        subtitle="Create a new vendor profile and configure portal access, tax treatments, and financial details."
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
              Prefill details from the GST portal
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
        <SectionCard title="Primary Contact">
          <div className="space-y-5">
            <div className="flex items-center gap-6">
              <label className="text-sm font-semibold text-foreground w-32 shrink-0">Vendor Type</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="vendType" checked={vendorType === "Business"} onChange={() => setVendorType("Business")} className="accent-primary" />
                  Business
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="vendType" checked={vendorType === "Individual"} onChange={() => setVendorType("Individual")} className="accent-primary" />
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
                {!displayName && <p className="text-[11px] text-destructive mt-1">Error: Enter the Display Name of your vendor.</p>}
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
              <label className="text-sm font-semibold text-foreground w-32 shrink-0">Vendor Language</label>
              <div className="max-w-[200px] w-full">
                <select className={selectCls} value={vendorLanguage} onChange={(e) => setVendorLanguage(e.target.value)}>
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
            {["Address", "Contact Persons", "Bank Details", "Custom Fields", "Reporting Tags", "Remarks"].map((tab) => (
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
                        <input className={inputCls} placeholder="Attention" value={billingAttention} onChange={(e) => setBillingAttention(e.target.value)} />
                      </FormField>
                      <FormField label="Country/Region">
                        <select className={selectCls} value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)}>
                          <option value="India">India</option>
                          <option value="USA">United States</option>
                        </select>
                      </FormField>
                      <FormField label="Address">
                        <textarea className={cn(inputCls, "h-16 resize-none mb-2")} placeholder="Street 1" value={billingStreet1} onChange={(e) => setBillingStreet1(e.target.value)} />
                        <textarea className={cn(inputCls, "h-16 resize-none")} placeholder="Street 2" value={billingStreet2} onChange={(e) => setBillingStreet2(e.target.value)} />
                      </FormField>
                      <FormField label="City">
                        <input className={inputCls} placeholder="City" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} />
                      </FormField>
                      <FormField label="State">
                        <input className={inputCls} placeholder="Select or type to add" value={billingState} onChange={(e) => setBillingState(e.target.value)} />
                      </FormField>
                      <FormField label="Pin Code">
                        <input className={inputCls} placeholder="Pin Code" value={billingPin} onChange={(e) => setBillingPin(e.target.value)} />
                      </FormField>
                      <FormField label="Phone">
                        <input className={inputCls} placeholder="Phone" value={billingPhone} onChange={(e) => setBillingPhone(e.target.value)} />
                      </FormField>
                      <FormField label="Fax Number">
                        <input className={inputCls} placeholder="Fax Number" value={billingFax} onChange={(e) => setBillingFax(e.target.value)} />
                      </FormField>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-bold text-sm">Shipping Address</h4>
                      <button type="button" onClick={handleCopyBillingAddress} className="text-primary text-xs font-semibold hover:underline">(Copy Billing Address)</button>
                    </div>
                    <div className="space-y-3">
                      <FormField label="Attention">
                        <input className={inputCls} placeholder="Attention" value={shippingAttention} onChange={(e) => setShippingAttention(e.target.value)} />
                      </FormField>
                      <FormField label="Country/Region">
                        <select className={selectCls} value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)}>
                          <option value="India">India</option>
                          <option value="USA">United States</option>
                        </select>
                      </FormField>
                      <FormField label="Address">
                        <textarea className={cn(inputCls, "h-16 resize-none mb-2")} placeholder="Street 1" value={shippingStreet1} onChange={(e) => setShippingStreet1(e.target.value)} />
                        <textarea className={cn(inputCls, "h-16 resize-none")} placeholder="Street 2" value={shippingStreet2} onChange={(e) => setShippingStreet2(e.target.value)} />
                      </FormField>
                      <FormField label="City">
                        <input className={inputCls} placeholder="City" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} />
                      </FormField>
                      <FormField label="State">
                        <input className={inputCls} placeholder="Select or type to add" value={shippingState} onChange={(e) => setShippingState(e.target.value)} />
                      </FormField>
                      <FormField label="Pin Code">
                        <input className={inputCls} placeholder="Pin Code" value={shippingPin} onChange={(e) => setShippingPin(e.target.value)} />
                      </FormField>
                      <FormField label="Phone">
                        <input className={inputCls} placeholder="Phone" value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} />
                      </FormField>
                      <FormField label="Fax Number">
                        <input className={inputCls} placeholder="Fax Number" value={shippingFax} onChange={(e) => setShippingFax(e.target.value)} />
                      </FormField>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Contact Persons" && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm">Contact Persons</h4>
                {contactPersons.map((cp, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-xl bg-card-container-lowest space-y-3 relative">
                    <button type="button" onClick={() => handleRemoveContactPerson(idx)} className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <div className="grid grid-cols-3 gap-2">
                      <select className={selectCls} value={cp.salutation} onChange={(e) => updateContactPerson(idx, "salutation", e.target.value)}>
                        <option value="">Salutation</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                      </select>
                      <input className={inputCls} placeholder="First Name" value={cp.firstName} onChange={(e) => updateContactPerson(idx, "firstName", e.target.value)} />
                      <input className={inputCls} placeholder="Last Name" value={cp.lastName} onChange={(e) => updateContactPerson(idx, "lastName", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input className={inputCls} type="email" placeholder="Email Address" value={cp.email} onChange={(e) => updateContactPerson(idx, "email", e.target.value)} />
                      <input className={inputCls} placeholder="Work Phone" value={cp.phone} onChange={(e) => updateContactPerson(idx, "phone", e.target.value)} />
                      <input className={inputCls} placeholder="Mobile" value={cp.mobile} onChange={(e) => updateContactPerson(idx, "mobile", e.target.value)} />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddContactPerson} className="px-3 py-1.5 border border-primary text-primary hover:bg-primary/5 rounded-lg font-semibold text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">add</span> Add Contact Person
                </button>
              </div>
            )}

            {activeTab === "Bank Details" && (
              <div className="space-y-4 max-w-xl">
                <h4 className="font-bold text-sm">Vendor Bank Details</h4>
                <FormField label="Bank Name">
                  <input className={inputCls} placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                </FormField>
                <FormField label="Account Number">
                  <input className={inputCls} placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                </FormField>
                <FormField label="IFSC Code">
                  <input className={inputCls} placeholder="IFSC Code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} maxLength={11} />
                </FormField>
                <FormField label="Branch">
                  <input className={inputCls} placeholder="Branch" value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} />
                </FormField>
              </div>
            )}

            {activeTab === "Custom Fields" && (
              <div className="space-y-4 max-w-xl">
                <h4 className="font-bold text-sm">Custom Fields</h4>
                {Object.keys(customFields).map((field) => (
                  <FormField key={field} label={field}>
                    <input 
                      className={inputCls} 
                      value={customFields[field]} 
                      onChange={(e) => setCustomFields({ ...customFields, [field]: e.target.value })} 
                    />
                  </FormField>
                ))}
              </div>
            )}

            {activeTab === "Reporting Tags" && (
              <div className="space-y-4 max-w-xl">
                <h4 className="font-bold text-sm">Reporting Tags</h4>
                <FormField label="Tags">
                  <input className={inputCls} placeholder="Add tag codes separated by commas" value={reportingTags} onChange={(e) => setReportingTags(e.target.value)} />
                </FormField>
              </div>
            )}

            {activeTab === "Remarks" && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm">Remarks</h4>
                <textarea className={cn(inputCls, "h-32")} placeholder="Add notes or internal remarks about this vendor..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              </div>
            )}
          </div>
        </SectionCard>

        {/* Tax and Financials */}
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
              <FormField label="Source of Supply">
                <input className={inputCls} value={sourceOfSupply} onChange={(e) => setSourceOfSupply(e.target.value)} placeholder="e.g. 27-Maharashtra" />
              </FormField>
              <FormField label="PAN">
                <input className={inputCls} value={pan} onChange={(e) => setPan(e.target.value)} placeholder="ABCDE1234F" />
              </FormField>
              
              <div className="pt-2 border-t border-border">
                <p className="font-semibold text-sm mb-1">MSME Registered?</p>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="checkbox" 
                    checked={msmeRegistered} 
                    onChange={(e) => setMsmeRegistered(e.target.checked)} 
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4" 
                  />
                  <span>This vendor is MSME registered</span>
                </label>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Financial Details (Accounts Payable)">
            <div className="space-y-4">
              <FormField label="Currency">
                <select className={selectCls} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </FormField>
              
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

              <FormField label="TDS (Tax Deducted at Source)">
                <select className={selectCls} value={tds} onChange={(e) => setTds(e.target.value)}>
                  <option value="No TDS">No TDS</option>
                  <option value="TDS-194C (1.0%)">TDS-194C (1.0%)</option>
                  <option value="TDS-194I (2.0%)">TDS-194I (2.0%)</option>
                  <option value="TDS-194J (10.0%)">TDS-194J (10.0%)</option>
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
              <p className="text-xs text-muted-foreground">Allow portal access for this vendor</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={enablePortal} onChange={(e) => setEnablePortal(e.target.checked)} />
              <div className="w-11 h-6 bg-card-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </SectionCard>

        {/* Documents */}
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

        {/* Submit Actions */}
        <div className="flex justify-end gap-4 pb-10">
          <button type="button" onClick={() => router.push("/vendors")} className="px-6 py-2.5 rounded-lg font-bold text-sm text-muted-foreground border border-border hover:bg-card-container transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2.5 rounded-lg font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm active:scale-95">
            Save Vendor
          </button>
        </div>
      </form>
    </div>
  );
}

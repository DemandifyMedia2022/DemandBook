"use client";

import Logo from "@/components/logo";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  Palette,
  Eye,
  Sliders,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Building,
  FileText,
  User,
  CreditCard,
  PenTool,
  Info
} from "lucide-react";

// Presets for the customizer colors
const PRIMARY_PRESETS = [
  { name: "Slate", value: "#1e293b" },
  { name: "Blue", value: "#2563eb" },
  { name: "Emerald", value: "#059669" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Rose", value: "#e11d48" },
  { name: "Orange", value: "#ea580c" },
  { name: "Violet", value: "#7c3aed" }
];

const FIELD = "w-full px-3 py-1.5 text-[12.5px] bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-zinc-800 placeholder:text-zinc-400 shadow-sm";
const LABEL = "block text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider mb-1";
const ACCORDION_HEADER = "w-full flex items-center justify-between p-3.5 text-left bg-zinc-50/50 hover:bg-zinc-50 transition-colors border-b border-zinc-100 select-none cursor-pointer";

interface LineItem {
  id: number;
  description: string;
  hsnSac: string;
  qty: number;
  rate: number;
  igst: number;
}

// Convert numbers to words in Indian Rupees format (e.g. Ten Lakh Fifteen Thousand Sixty Only)
function numberToIndianWords(amount: number): string {
  const words = {
    0: '', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
    10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen',
    17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty', 30: 'Thirty', 40: 'Forty', 50: 'Fifty',
    60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
  };

  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return '';
    let str = '';
    if (n >= 100) {
      str += words[Math.floor(n / 100) as keyof typeof words] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        str += words[n as keyof typeof words] + ' ';
      } else {
        str += words[Math.floor(n / 10) * 10 as keyof typeof words] + ' ';
        if (n % 10 > 0) {
          str += words[n % 10 as keyof typeof words] + ' ';
        }
      }
    }
    return str.trim();
  };

  let num = Math.floor(amount);
  if (num === 0) return 'Indian Rupee Zero Only';

  let result = '';
  
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  
  const remaining = num;

  if (crore > 0) {
    result += convertLessThanOneThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertLessThanOneThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertLessThanOneThousand(thousand) + ' Thousand ';
  }
  if (remaining > 0) {
    result += convertLessThanOneThousand(remaining) + ' ';
  }

  result = result.trim();
  return `Indian Rupee ${result} Only`;
}

// Fallback handwriting signature logo in SVG
const DefaultSignatureSVG = () => (
  <svg viewBox="0 0 200 60" className="w-40 h-12 text-blue-900/90 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 35 C 35 15, 60 5, 75 22 C 90 40, 55 52, 50 45 C 45 38, 90 12, 115 18 C 140 24, 145 48, 155 42 C 165 36, 175 25, 190 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M40 42 L 180 25" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
  </svg>
);

export default function InvoiceSettings() {
  // Accordion active section
  const [activeSection, setActiveSection] = useState<string>("branding");

  // State Definitions with Reference Invoice Image Defaults
  const [companyName, setCompanyName] = useState("Demand Tech (Vikarah Tech Private Limited)");
  const [companyAddress, setCompanyAddress] = useState("4th, Office No.15, Nyati Empress, Viman Nagar Road, Viman Nagar, Pune Maharashtra 411014 India");
  const [companyGSTIN, setCompanyGSTIN] = useState("27AALCV7396Q1Z0");
  const [companyID, setCompanyID] = useState("U73100PN2026PTC250192");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  const [invoiceTitle, setInvoiceTitle] = useState("TAX INVOICE");
  const [prefix, setPrefix] = useState("INV-");
  const [nextNumber, setNextNumber] = useState("000003");
  const [invoiceDate, setInvoiceDate] = useState("2026-06-29");
  const [paymentTerms, setPaymentTerms] = useState("Due on Receipt");
  const [dueDate, setDueDate] = useState("2026-06-29");
  const [placeOfSupply, setPlaceOfSupply] = useState("Karnataka (29)");

  const [billToName, setBillToName] = useState("Adjetter Media Network Pvt Ltd");
  const [billToAddress, setBillToAddress] = useState("B-9, 11th Floor, Brigade Summit, ITPL Main Rd, Brigade Metropolis, Garudachar Palya, Mahadevapura, Bengaluru, 560048 Karnataka India");
  const [billToGSTIN, setBillToGSTIN] = useState("29AAJCA2137Q2Z5");

  const [showShippingAddress, setShowShippingAddress] = useState(true);
  const [shipToName, setShipToName] = useState("Adjetter Media Network Pvt Ltd");
  const [shipToAddress, setShipToAddress] = useState("B-9, 11th Floor, Brigade Summit, ITPL Main Rd, Brigade Metropolis, Garudachar Palya, Mahadevapura, Bengaluru, 560048 Karnataka India");

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: 1,
      description: "Lead Nurture Program",
      hsnSac: "998361",
      qty: 100.00,
      rate: 8602.20,
      igst: 18
    }
  ]);

  const [bankName, setBankName] = useState("ICICI Bank");
  const [bankAccountNo, setBankAccountNo] = useState("091505010600");
  const [bankIFSC, setBankIFSC] = useState("ICIC0000915");

  const [customerNotes, setCustomerNotes] = useState("Thank you for the payment. You just made our day.");
  const [termsAndConditions, setTermsAndConditions] = useState("As per agreed contract.\nAll disputes to be resolved in the court of Pune, Maharashtra.");
  const [signatoryCompany, setSignatoryCompany] = useState("VIKARAH TECH PRIVATE LIMITED");
  const [signatoryName, setSignatoryName] = useState("Authorized Signatory");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  const [primaryColor, setPrimaryColor] = useState("#1e293b");

  // Feedback State
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLogo = localStorage.getItem("inv_logo");
      const savedCompanyName = localStorage.getItem("inv_company_name");
      const savedCompanyAddress = localStorage.getItem("inv_company_address");
      const savedCompanyGSTIN = localStorage.getItem("inv_company_gstin");
      const savedCompanyID = localStorage.getItem("inv_company_id");

      const savedTitle = localStorage.getItem("inv_title");
      const savedPrefix = localStorage.getItem("inv_prefix");
      const savedNumber = localStorage.getItem("inv_number");
      const savedDate = localStorage.getItem("inv_date");
      const savedTerms = localStorage.getItem("inv_terms");
      const savedDueDate = localStorage.getItem("inv_due_date");
      const savedPlaceSupply = localStorage.getItem("inv_place_supply");

      const savedBillToName = localStorage.getItem("inv_bill_to_name");
      const savedBillToAddress = localStorage.getItem("inv_bill_to_address");
      const savedBillToGSTIN = localStorage.getItem("inv_bill_to_gstin");

      const savedShowShip = localStorage.getItem("inv_show_ship");
      const savedShipToName = localStorage.getItem("inv_ship_to_name");
      const savedShipToAddress = localStorage.getItem("inv_ship_to_address");

      const savedItems = localStorage.getItem("inv_items");

      const savedBankName = localStorage.getItem("inv_bank_name");
      const savedBankAcc = localStorage.getItem("inv_bank_acc");
      const savedBankIFSC = localStorage.getItem("inv_bank_ifsc");

      const savedNotes = localStorage.getItem("inv_notes");
      const savedTermsCond = localStorage.getItem("inv_terms_cond");
      const savedSigCompany = localStorage.getItem("inv_signatory_company");
      const savedSigName = localStorage.getItem("inv_signatory_name");
      const savedSignature = localStorage.getItem("inv_signature");

      const savedPrimary = localStorage.getItem("inv_primary");

      if (savedLogo) setCompanyLogo(savedLogo);
      if (savedCompanyName) setCompanyName(savedCompanyName);
      if (savedCompanyAddress) setCompanyAddress(savedCompanyAddress);
      if (savedCompanyGSTIN) setCompanyGSTIN(savedCompanyGSTIN);
      if (savedCompanyID) setCompanyID(savedCompanyID);

      if (savedTitle) setInvoiceTitle(savedTitle);
      if (savedPrefix) setPrefix(savedPrefix);
      if (savedNumber) setNextNumber(savedNumber);
      if (savedDate) setInvoiceDate(savedDate);
      if (savedTerms) setPaymentTerms(savedTerms);
      if (savedDueDate) setDueDate(savedDueDate);
      if (savedPlaceSupply) setPlaceOfSupply(savedPlaceSupply);

      if (savedBillToName) setBillToName(savedBillToName);
      if (savedBillToAddress) setBillToAddress(savedBillToAddress);
      if (savedBillToGSTIN) setBillToGSTIN(savedBillToGSTIN);

      if (savedShowShip) setShowShippingAddress(savedShowShip === "true");
      if (savedShipToName) setShipToName(savedShipToName);
      if (savedShipToAddress) setShipToAddress(savedShipToAddress);

      if (savedItems) {
        try {
          setLineItems(JSON.parse(savedItems));
        } catch (e) {
          console.error("Failed to parse saved line items", e);
        }
      }

      if (savedBankName) setBankName(savedBankName);
      if (savedBankAcc) setBankAccountNo(savedBankAcc);
      if (savedBankIFSC) setBankIFSC(savedBankIFSC);

      if (savedNotes) setCustomerNotes(savedNotes);
      if (savedTermsCond) setTermsAndConditions(savedTermsCond);
      if (savedSigCompany) setSignatoryCompany(savedSigCompany);
      if (savedSigName) setSignatoryName(savedSigName);
      if (savedSignature) setSignatureImage(savedSignature);

      if (savedPrimary) setPrimaryColor(savedPrimary);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "signature") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size is too large. Max size is 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "logo") {
          setCompanyLogo(reader.result as string);
        } else {
          setSignatureImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (typeof window !== "undefined") {
      if (companyLogo) localStorage.setItem("inv_logo", companyLogo);
      else localStorage.removeItem("inv_logo");

      localStorage.setItem("inv_company_name", companyName);
      localStorage.setItem("inv_company_address", companyAddress);
      localStorage.setItem("inv_company_gstin", companyGSTIN);
      localStorage.setItem("inv_company_id", companyID);

      localStorage.setItem("inv_title", invoiceTitle);
      localStorage.setItem("inv_prefix", prefix);
      localStorage.setItem("inv_number", nextNumber);
      localStorage.setItem("inv_date", invoiceDate);
      localStorage.setItem("inv_terms", paymentTerms);
      localStorage.setItem("inv_due_date", dueDate);
      localStorage.setItem("inv_place_supply", placeOfSupply);

      localStorage.setItem("inv_bill_to_name", billToName);
      localStorage.setItem("inv_bill_to_address", billToAddress);
      localStorage.setItem("inv_bill_to_gstin", billToGSTIN);

      localStorage.setItem("inv_show_ship", String(showShippingAddress));
      localStorage.setItem("inv_ship_to_name", shipToName);
      localStorage.setItem("inv_ship_to_address", shipToAddress);

      localStorage.setItem("inv_items", JSON.stringify(lineItems));

      localStorage.setItem("inv_bank_name", bankName);
      localStorage.setItem("inv_bank_acc", bankAccountNo);
      localStorage.setItem("inv_bank_ifsc", bankIFSC);

      localStorage.setItem("inv_notes", customerNotes);
      localStorage.setItem("inv_terms_cond", termsAndConditions);
      localStorage.setItem("inv_signatory_company", signatoryCompany);
      localStorage.setItem("inv_signatory_name", signatoryName);

      if (signatureImage) localStorage.setItem("inv_signature", signatureImage);
      else localStorage.removeItem("inv_signature");

      localStorage.setItem("inv_primary", primaryColor);
    }

    setTimeout(() => {
      setSaving(false);
      setToastMessage("Tax Invoice Customization saved successfully!");
    }, 800);
  };

  // Toast Auto-hide timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Format Dates for rendering: e.g. "2026-06-29" -> "29/06/2026"
  const formatDateString = (dateStr: string) => {
    if (!dateStr) return "";
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Line Items calculations
  const subTotal = lineItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const totalIgst = lineItems.reduce((acc, item) => {
    const itemAmount = item.qty * item.rate;
    const itemTax = (itemAmount * (item.igst || 0)) / 100;
    return acc + itemTax;
  }, 0);

  const rawTotal = subTotal + totalIgst;
  const roundedTotal = Math.round(rawTotal);
  const rounding = parseFloat((roundedTotal - rawTotal).toFixed(2));
  const balanceDue = roundedTotal;

  // Add Item to Line Items list
  const handleAddItem = () => {
    const newId = lineItems.length > 0 ? Math.max(...lineItems.map(i => i.id)) + 1 : 1;
    setLineItems([
      ...lineItems,
      {
        id: newId,
        description: "New Item or Description",
        hsnSac: "",
        qty: 1,
        rate: 0,
        igst: 18
      }
    ]);
  };

  // Update specific Line Item field
  const handleUpdateItem = (id: number, field: keyof LineItem, value: any) => {
    setLineItems(
      lineItems.map(item => {
        if (item.id === id) {
          let val = value;
          if (field === "qty" || field === "rate" || field === "igst") {
            val = value === "" ? 0 : parseFloat(value);
          }
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  // Remove Item
  const handleRemoveItem = (id: number) => {
    if (lineItems.length === 1) {
      alert("At least one line item is required.");
      return;
    }
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  // Accordion toggle helper
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors text-[13px] font-semibold mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          <h1 className="text-[23px] font-bold text-zinc-900 tracking-tight">Invoice Customization settings</h1>
          <p className="text-[13px] text-zinc-500">Configure parameters and instantly preview the resulting Tax Invoice layout</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4.5 py-2 text-[13px] font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customized Form Panel */}
        <div className="lg:col-span-5 space-y-4 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 p-4 border-b border-zinc-100 bg-zinc-50/50">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-[14px] font-bold text-zinc-900">Customizer Controls</h2>
          </div>

          <div className="divide-y divide-zinc-100">
            {/* SECTION 1: Seller Details & branding */}
            <div>
              <div className={ACCORDION_HEADER} onClick={() => toggleSection("branding")}>
                <div className="flex items-center gap-2 text-zinc-700">
                  <Building className="w-4 h-4 text-zinc-500" />
                  <span className="text-[13px] font-bold">Company &amp; Branding</span>
                </div>
                {activeSection === "branding" ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </div>
              
              {activeSection === "branding" && (
                <div className="p-4 space-y-4 bg-white">
                  {/* Logo upload */}
                  <div className="space-y-2">
                    <label className={LABEL}>Company Logo (Circular Preview)</label>
                    {companyLogo ? (
                      <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-xl bg-zinc-50/30">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 border border-zinc-200 bg-white rounded-full overflow-hidden flex items-center justify-center">
                            <img src={companyLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
                          </div>
                          <span className="text-[11.5px] text-zinc-500 font-medium">Custom logo uploaded</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCompanyLogo(null)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                          title="Remove Logo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border border-dashed border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-300 transition-colors relative cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "logo")}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                        <p className="text-[12px] font-medium text-zinc-700">Upload logo image</p>
                        <p className="text-[10px] text-zinc-400">PNG/JPG, max 2MB</p>
                      </div>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className={LABEL}>Company Name</label>
                    <input
                      type="text"
                      className={FIELD}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  {/* Company Address */}
                  <div>
                    <label className={LABEL}>Company Address</label>
                    <textarea
                      rows={3}
                      className={FIELD}
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                    />
                  </div>

                  {/* GSTIN & Company ID */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>GSTIN</label>
                      <input
                        type="text"
                        className={FIELD}
                        value={companyGSTIN}
                        onChange={(e) => setCompanyGSTIN(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Company ID / CIN</label>
                      <input
                        type="text"
                        className={FIELD}
                        value={companyID}
                        onChange={(e) => setCompanyID(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Invoice metadata details */}
            <div>
              <div className={ACCORDION_HEADER} onClick={() => toggleSection("metadata")}>
                <div className="flex items-center gap-2 text-zinc-700">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <span className="text-[13px] font-bold">Invoice Metadata &amp; Details</span>
                </div>
                {activeSection === "metadata" ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </div>

              {activeSection === "metadata" && (
                <div className="p-4 space-y-4 bg-white">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Invoice Title</label>
                      <input
                        type="text"
                        className={FIELD}
                        value={invoiceTitle}
                        onChange={(e) => setInvoiceTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Place of Supply</label>
                      <input
                        type="text"
                        className={FIELD}
                        value={placeOfSupply}
                        onChange={(e) => setPlaceOfSupply(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Invoice Prefix</label>
                      <input
                        type="text"
                        className={FIELD}
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Next Number</label>
                      <input
                        type="text"
                        className={FIELD}
                        value={nextNumber}
                        onChange={(e) => setNextNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Invoice Date</label>
                      <input
                        type="date"
                        className={FIELD}
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Due Date</label>
                      <input
                        type="date"
                        className={FIELD}
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Terms</label>
                    <input
                      type="text"
                      className={FIELD}
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Bill To & Ship To */}
            <div>
              <div className={ACCORDION_HEADER} onClick={() => toggleSection("billing")}>
                <div className="flex items-center gap-2 text-zinc-700">
                  <User className="w-4 h-4 text-zinc-500" />
                  <span className="text-[13px] font-bold">Billing &amp; Shipping Addresses</span>
                </div>
                {activeSection === "billing" ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </div>

              {activeSection === "billing" && (
                <div className="p-4 space-y-4 bg-white">
                  {/* Bill To */}
                  <div className="space-y-3 pb-3 border-b border-zinc-100">
                    <span className="block text-[11px] font-bold text-zinc-900 border-l-2 border-blue-500 pl-1.5">Bill To Details</span>
                    <div>
                      <label className={LABEL}>Client Company Name</label>
                      <input
                        type="text"
                        className={FIELD}
                        value={billToName}
                        onChange={(e) => setBillToName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Billing Address</label>
                      <textarea
                        rows={3}
                        className={FIELD}
                        value={billToAddress}
                        onChange={(e) => setBillToAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Client GSTIN</label>
                      <input
                        type="text"
                        className={FIELD}
                        value={billToGSTIN}
                        onChange={(e) => setBillToGSTIN(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Ship To Checkbox Toggle */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="block text-[11px] font-bold text-zinc-900 border-l-2 border-green-500 pl-1.5">Ship To Details</span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[12px] font-semibold text-zinc-600">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 text-blue-600 border-zinc-300 rounded"
                          checked={showShippingAddress}
                          onChange={(e) => setShowShippingAddress(e.target.checked)}
                        />
                        Separate Shipping
                      </label>
                    </div>

                    {showShippingAddress && (
                      <div className="space-y-3 pt-1">
                        <div>
                          <label className={LABEL}>Shipping Recipient Name</label>
                          <input
                            type="text"
                            className={FIELD}
                            value={shipToName}
                            onChange={(e) => setShipToName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={LABEL}>Shipping Address</label>
                          <textarea
                            rows={3}
                            className={FIELD}
                            value={shipToAddress}
                            onChange={(e) => setShipToAddress(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: Line items details */}
            <div>
              <div className={ACCORDION_HEADER} onClick={() => toggleSection("items")}>
                <div className="flex items-center gap-2 text-zinc-700">
                  <Sliders className="w-4 h-4 text-zinc-500" />
                  <span className="text-[13px] font-bold flex-1">Invoice Line Items</span>
                  <span className="bg-zinc-100 text-zinc-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{lineItems.length}</span>
                </div>
                {activeSection === "items" ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </div>

              {activeSection === "items" && (
                <div className="p-4 space-y-4 bg-white">
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {lineItems.map((item, idx) => (
                      <div key={item.id} className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50 space-y-2 relative">
                        <div className="flex justify-between items-center pb-1.5 border-b border-zinc-100">
                          <span className="text-[11.5px] font-bold text-zinc-700">Item #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className={LABEL}>Description</label>
                            <input
                              type="text"
                              className={FIELD}
                              value={item.description}
                              onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            <div className="col-span-2">
                              <label className={LABEL}>HSN/SAC</label>
                              <input
                                type="text"
                                className={FIELD}
                                value={item.hsnSac}
                                onChange={(e) => handleUpdateItem(item.id, "hsnSac", e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <label className={LABEL}>IGST (%)</label>
                              <input
                                type="number"
                                className={FIELD}
                                value={item.igst}
                                onChange={(e) => handleUpdateItem(item.id, "igst", e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className={LABEL}>Quantity</label>
                              <input
                                type="number"
                                step="any"
                                className={FIELD}
                                value={item.qty}
                                onChange={(e) => handleUpdateItem(item.id, "qty", e.target.value)}
                              />
                            </div>
                            <div>
                              <label className={LABEL}>Rate (₹)</label>
                              <input
                                type="number"
                                step="any"
                                className={FIELD}
                                value={item.rate}
                                onChange={(e) => handleUpdateItem(item.id, "rate", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full flex items-center justify-center gap-1 py-2 text-[12px] font-bold text-zinc-700 border border-dashed border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Line Item
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 5: Bank details */}
            <div>
              <div className={ACCORDION_HEADER} onClick={() => toggleSection("bank")}>
                <div className="flex items-center gap-2 text-zinc-700">
                  <CreditCard className="w-4 h-4 text-zinc-500" />
                  <span className="text-[13px] font-bold">Bank &amp; Payment Details</span>
                </div>
                {activeSection === "bank" ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </div>

              {activeSection === "bank" && (
                <div className="p-4 space-y-3 bg-white">
                  <div>
                    <label className={LABEL}>Bank Name</label>
                    <input
                      type="text"
                      className={FIELD}
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Account Number</label>
                    <input
                      type="text"
                      className={FIELD}
                      value={bankAccountNo}
                      onChange={(e) => setBankAccountNo(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>IFSC Code</label>
                    <input
                      type="text"
                      className={FIELD}
                      value={bankIFSC}
                      onChange={(e) => setBankIFSC(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 6: Notes, Terms & Signatory */}
            <div>
              <div className={ACCORDION_HEADER} onClick={() => toggleSection("footer")}>
                <div className="flex items-center gap-2 text-zinc-700">
                  <PenTool className="w-4 h-4 text-zinc-500" />
                  <span className="text-[13px] font-bold">Notes, Signatory &amp; Accent</span>
                </div>
                {activeSection === "footer" ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </div>

              {activeSection === "footer" && (
                <div className="p-4 space-y-4 bg-white">
                  <div>
                    <label className={LABEL}>Customer Notes</label>
                    <textarea
                      rows={2}
                      className={FIELD}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Terms &amp; Conditions</label>
                    <textarea
                      rows={2.5}
                      className={FIELD}
                      value={termsAndConditions}
                      onChange={(e) => setTermsAndConditions(e.target.value)}
                    />
                  </div>

                  <div className="pb-3 border-b border-zinc-100">
                    <label className={LABEL}>Authorized Signatory Company Name</label>
                    <input
                      type="text"
                      className={FIELD}
                      value={signatoryCompany}
                      onChange={(e) => setSignatoryCompany(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-zinc-100">
                    <div>
                      <label className={LABEL}>Signatory Label</label>
                      <input
                        type="text"
                        className={FIELD}
                        value={signatoryName}
                        onChange={(e) => setSignatoryName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className={LABEL}>Upload Signature Scan</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "signature")}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 rounded-lg text-[12.5px] font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload File
                        </button>
                      </div>
                      {signatureImage && (
                        <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-500 pl-1">
                          <span>Signature loaded</span>
                          <button onClick={() => setSignatureImage(null)} className="text-red-500 font-bold hover:underline">Clear</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accent Color picker */}
                  <div>
                    <label className={`${LABEL} flex items-center gap-1`}>
                      <Palette className="w-3.5 h-3.5 text-zinc-400" />
                      Invoice Styling Accent Color
                    </label>
                    <div className="flex flex-wrap gap-2 items-center mt-1.5">
                      {PRIMARY_PRESETS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setPrimaryColor(color.value)}
                          className={cn(
                            "w-6 h-6 rounded-full border border-zinc-200 relative transition-transform hover:scale-105 active:scale-95",
                            primaryColor === color.value ? "ring-2 ring-blue-500 ring-offset-2 scale-105" : ""
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                      <input
                        type="color"
                        className="w-6 h-6 rounded-full overflow-hidden border border-zinc-300 cursor-pointer shadow-sm relative"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        title="Custom Color"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic interactive TAX INVOICE preview */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-zinc-500 bg-zinc-100 border border-zinc-200/50 rounded-lg max-w-max">
            <Eye className="w-4 h-4 text-zinc-400" />
            <span>Tax Invoice Live Preview</span>
          </div>

          {/* Interactive invoice box - Mimics the exact UI of the user's reference image */}
          <div className="bg-white border border-zinc-300 rounded-xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] text-[12px] leading-relaxed text-zinc-800 font-sans select-none min-h-[850px] flex flex-col justify-between">
            <div className="space-y-6">
              {/* TOP HEADER SECTION */}
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-start max-w-[65%]">
                  {/* Logo Container */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-full border border-zinc-200 flex items-center justify-center bg-white shadow-sm overflow-hidden p-1">
                    {companyLogo ? (
                      <img src={companyLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-white">
                        <Logo className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  
                  {/* Seller Info details */}
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-[14px] text-zinc-900 leading-snug">{companyName}</h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">{companyAddress}</p>
                    <div className="text-[10px] text-zinc-600 font-bold space-y-0.5 pt-0.5">
                      {companyGSTIN && <p>GSTIN: <span className="text-zinc-900 uppercase font-mono">{companyGSTIN}</span></p>}
                      {companyID && <p>Company ID / CIN: <span className="text-zinc-900 uppercase font-mono">{companyID}</span></p>}
                    </div>
                  </div>
                </div>

                {/* Right aligned Tax Invoice Title */}
                <div className="text-right">
                  <h1 className="text-[24px] font-black tracking-widest text-zinc-900 leading-none" style={{ color: primaryColor }}>
                    {invoiceTitle}
                  </h1>
                </div>
              </div>

              {/* INVOICE METADATA ROW TABLE */}
              <div className="border border-zinc-300 grid grid-cols-2 rounded overflow-hidden">
                {/* Columns block */}
                <div className="p-3 border-r border-zinc-300 grid grid-cols-2 gap-y-1 gap-x-2 text-[10.5px]">
                  <span className="text-zinc-400 font-semibold">Invoice No</span>
                  <span className="font-bold text-zinc-900 font-mono">: {prefix}{nextNumber}</span>

                  <span className="text-zinc-400 font-semibold">Invoice Date</span>
                  <span className="font-bold text-zinc-900">: {formatDateString(invoiceDate)}</span>

                  <span className="text-zinc-400 font-semibold">Terms</span>
                  <span className="font-bold text-zinc-900">: {paymentTerms}</span>

                  <span className="text-zinc-400 font-semibold">Due Date</span>
                  <span className="font-bold text-zinc-900">: {formatDateString(dueDate)}</span>
                </div>
                
                {/* Place of supply */}
                <div className="p-3 text-[10.5px] flex items-start gap-2">
                  <span className="text-zinc-400 font-semibold">Place Of Supply</span>
                  <span className="font-bold text-zinc-900">: {placeOfSupply}</span>
                </div>
              </div>

              {/* BILL TO & SHIP TO SECTION */}
              <div className="border border-zinc-300 grid grid-cols-2 rounded overflow-hidden">
                {/* Bill To Column */}
                <div className="border-r border-zinc-300 flex flex-col">
                  <div className="bg-zinc-50 border-b border-zinc-300 px-3 py-1.5 font-extrabold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Bill To
                  </div>
                  <div className="p-3 space-y-1 text-[11px] flex-1">
                    <p className="font-black text-zinc-900">{billToName}</p>
                    <p className="text-zinc-500 leading-relaxed font-medium whitespace-pre-line">{billToAddress}</p>
                    {billToGSTIN && (
                      <p className="font-bold text-[10.5px] pt-1 text-zinc-700">
                        GSTIN: <span className="font-mono text-zinc-900 uppercase">{billToGSTIN}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Ship To Column */}
                <div className="flex flex-col">
                  <div className="bg-zinc-50 border-b border-zinc-300 px-3 py-1.5 font-extrabold text-[10px] text-zinc-500 uppercase tracking-wider">
                    Ship To
                  </div>
                  <div className="p-3 space-y-1 text-[11px] flex-1">
                    {showShippingAddress ? (
                      <>
                        <p className="font-black text-zinc-900">{shipToName}</p>
                        <p className="text-zinc-500 leading-relaxed font-medium whitespace-pre-line">{shipToAddress}</p>
                      </>
                    ) : (
                      <p className="text-zinc-400 italic">Same as billing address</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ITEMS DETAILS TABLE */}
              <div className="border border-zinc-300 rounded overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-300 text-zinc-500 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="px-3 py-2 border-r border-zinc-300 w-10 text-center">#</th>
                      <th className="px-3 py-2 border-r border-zinc-300">Item &amp; Description</th>
                      <th className="px-3 py-2 border-r border-zinc-300 text-center w-24">HSN/SAC</th>
                      <th className="px-3 py-2 border-r border-zinc-300 text-right w-16">Qty</th>
                      <th className="px-3 py-2 border-r border-zinc-300 text-right w-24">Rate</th>
                      <th className="px-3 py-2 border-r border-zinc-300 text-right w-16">IGST</th>
                      <th className="px-3 py-2 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {lineItems.map((item, idx) => {
                      const amount = item.qty * item.rate;
                      return (
                        <tr key={item.id} className="text-zinc-800">
                          <td className="px-3 py-2.5 border-r border-zinc-200 text-center font-bold text-zinc-500 tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2.5 border-r border-zinc-200">
                            <span className="font-black text-zinc-900 block" style={{ color: primaryColor }}>
                              {item.description}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 border-r border-zinc-200 text-center font-mono font-medium text-zinc-600">
                            {item.hsnSac || "—"}
                          </td>
                          <td className="px-3 py-2.5 border-r border-zinc-200 text-right font-mono tabular-nums">
                            {item.qty.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 border-r border-zinc-200 text-right font-mono tabular-nums">
                            {item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2.5 border-r border-zinc-200 text-right font-mono font-semibold text-zinc-500 tabular-nums">
                            {item.igst}%
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-zinc-900 tabular-nums">
                            {amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* CALCULATION AND FOOTER BLOCKS */}
              <div className="grid grid-cols-12 border border-zinc-300 rounded overflow-hidden">
                {/* Left block (total in words, bank details, notes) */}
                <div className="col-span-7 p-4 border-r border-zinc-300 space-y-4">
                  {/* Total in words */}
                  <div className="pb-2 border-b border-zinc-100">
                    <span className="block text-[8.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Total In Words</span>
                    <p className="text-[11px] font-black text-zinc-900 italic mt-0.5">
                      {numberToIndianWords(roundedTotal)}
                    </p>
                  </div>

                  {/* Customer Notes */}
                  {customerNotes && (
                    <div>
                      <span className="block text-[8.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Notes</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-semibold whitespace-pre-line">{customerNotes}</p>
                    </div>
                  )}

                  {/* Bank Details */}
                  <div className="text-[10px] space-y-0.5 pt-1.5 border-t border-zinc-100">
                    <p className="font-bold text-zinc-700">Bank Account Number: <span className="font-mono text-zinc-950 font-black">{bankAccountNo}</span></p>
                    <p className="font-bold text-zinc-700">IFSC Code: <span className="font-mono text-zinc-950 font-black uppercase">{bankIFSC}</span></p>
                    <p className="font-bold text-zinc-700">Bank Name: <span className="text-zinc-950 font-black">{bankName}</span></p>
                  </div>

                  {/* Terms & Conditions */}
                  {termsAndConditions && (
                    <div className="pt-2 border-t border-zinc-100">
                      <span className="block text-[8.5px] font-extrabold text-zinc-400 uppercase tracking-wider">Terms &amp; Conditions</span>
                      <p className="text-[9.5px] text-zinc-400 leading-snug mt-0.5 whitespace-pre-line font-medium">{termsAndConditions}</p>
                    </div>
                  )}
                </div>

                {/* Right block (amounts, signature) */}
                <div className="col-span-5 flex flex-col justify-between bg-zinc-50/20">
                  {/* Calculation rows */}
                  <div className="p-4 space-y-2 text-[11px] border-b border-zinc-300 font-bold text-zinc-600">
                    <div className="flex justify-between">
                      <span>Sub Total</span>
                      <span className="font-mono text-zinc-800 tabular-nums">
                        {subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>IGST ({lineItems[0]?.igst || 18}%)</span>
                      <span className="font-mono text-zinc-800 tabular-nums">
                        {totalIgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-zinc-400 font-medium">
                      <span>Rounding</span>
                      <span className="font-mono tabular-nums">
                        {rounding >= 0 ? `+${rounding.toFixed(2)}` : rounding.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[13px] font-black text-zinc-950 border-t border-dashed border-zinc-200 pt-2" style={{ color: primaryColor }}>
                      <span>Total</span>
                      <span className="font-mono tabular-nums">
                        ₹{roundedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-[13px] font-black text-zinc-950 border-t border-zinc-300 pt-1.5">
                      <span>Balance Due</span>
                      <span className="font-mono tabular-nums">
                        ₹{balanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Authorized Signatory signature container */}
                  <div className="p-4 flex flex-col items-center justify-between min-h-[140px] text-center">
                    <span className="block text-[8.5px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">
                      {signatoryCompany}
                    </span>
                    
                    {/* Handwritten signature visual mock */}
                    <div className="w-full h-14 flex items-center justify-center overflow-hidden">
                      {signatureImage ? (
                        <img src={signatureImage} alt="Signature scan" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <DefaultSignatureSVG />
                      )}
                    </div>

                    <span className="block text-[10px] font-bold text-zinc-500 border-t border-zinc-200 pt-1 w-32 mt-1">
                      {signatoryName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Success Toast alert banner */}
      <div
        className={cn(
          "fixed bottom-5 right-5 bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm transition-all duration-300 z-50 transform",
          toastMessage ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
        )}
      >
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <span className="text-[12.5px] font-semibold">{toastMessage}</span>
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

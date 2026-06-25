"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SectionCard, FormField, inputCls, selectCls } from "@/components/ui/page-shell";

export default function OrganizationProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    logo_url: "",
    organization_name: "",
    industry: "Technology",
    address_street: "",
    address_city: "",
    address_state: "",
    address_zip: "",
    address_country: "India",
    phone: "",
    fax: "",
    website_url: "",
    different_payment_address: false,
    primary_contact_name: "",
    primary_contact_email: "",
    base_currency: "INR",
    fiscal_year: "Jan - Dec",
    report_basis: "Accrual",
    organization_language: "English",
    communication_languages: "English",
    time_zone: "(GMT+05:30) India Standard Time",
    date_format: "DD/MM/YYYY",
    company_id: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8888/api/settings/organization");
      const data = await res.json();
      if (data.success && data.profile && Object.keys(data.profile).length > 0) {
        setFormData(prev => ({ ...prev, ...data.profile }));
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:8888/api/settings/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Organization profile updated successfully.' });
        // Optionally update top level state if using a context
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setSaving(false);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="p-8 max-w-[900px] mx-auto space-y-8 flex flex-col pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-outline-variant pb-6">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Organization Profile</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Manage your company identity, location, and regional settings.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 \${message.type === 'success' ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-error'}`}>
          <span className="material-symbols-outlined">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-semibold text-body-md">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Profile Details */}
        <SectionCard title="Organization Details" subtitle="Basic details of your organization">
          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="w-32 h-32 bg-surface-container border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center text-on-surface-variant relative overflow-hidden group cursor-pointer hover:bg-surface-container-high transition-colors">
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[32px] mb-2">add_photo_alternate</span>
                    <span className="text-label-sm font-semibold">Upload Logo</span>
                  </>
                )}
                {/* Simulated file input - in reality this would upload to S3/backend and set logo_url */}
                <input 
                  type="text" 
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Logo URL"
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-body-sm text-on-surface-variant">
                  This logo will be displayed in transaction PDFs and email notifications.
                </p>
                <p className="text-label-sm text-on-surface-variant font-mono">
                  Preferred Image Dimensions: 240 x 240 pixels @ 72 DPI<br/>
                  Maximum File Size: 1MB
                </p>
                <div className="mt-2">
                  <label className="text-label-sm font-semibold mb-1 block">Logo URL (Simulation)</label>
                  <input type="text" name="logo_url" value={formData.logo_url} onChange={handleChange} placeholder="https://example.com/logo.png" className={inputCls} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant">
              <FormField label="Organization Name *">
                <input required type="text" name="organization_name" value={formData.organization_name} onChange={handleChange} className={inputCls} />
              </FormField>

              <FormField label="Industry">
                <select name="industry" value={formData.industry} onChange={handleChange} className={selectCls}>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Retail (E-Commerce and Offline)">Retail (E-Commerce and Offline)</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>

              <FormField label="Company ID">
                <input type="text" name="company_id" value={formData.company_id || ''} onChange={handleChange} className={inputCls} placeholder="e.g. U73100PN2026PTC250192" />
              </FormField>
            </div>
          </div>
        </SectionCard>

        {/* Location */}
        <SectionCard title="Organization Location" subtitle="The primary operating address of your business">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormField label="Street Address">
                <input type="text" name="address_street" value={formData.address_street || ''} onChange={handleChange} className={inputCls} placeholder="Street 1, Office Number" />
              </FormField>
            </div>
            
            <FormField label="City">
              <input type="text" name="address_city" value={formData.address_city || ''} onChange={handleChange} className={inputCls} />
            </FormField>
            
            <FormField label="State / Province">
              <input type="text" name="address_state" value={formData.address_state || ''} onChange={handleChange} className={inputCls} />
            </FormField>

            <FormField label="Zip / Postal Code">
              <input type="text" name="address_zip" value={formData.address_zip || ''} onChange={handleChange} className={inputCls} />
            </FormField>

            <FormField label="Country">
              <input type="text" name="address_country" value={formData.address_country || ''} onChange={handleChange} className={inputCls} />
            </FormField>

            <FormField label="Phone Number">
              <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className={inputCls} />
            </FormField>

            <FormField label="Fax Number">
              <input type="text" name="fax" value={formData.fax || ''} onChange={handleChange} className={inputCls} />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Website URL">
                <input type="url" name="website_url" value={formData.website_url || ''} onChange={handleChange} className={inputCls} placeholder="https://www.demand-tech.com" />
              </FormField>
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                id="different_payment_address" 
                name="different_payment_address" 
                checked={formData.different_payment_address} 
                onChange={handleChange}
                className="w-5 h-5 text-primary rounded border-outline-variant focus:ring-primary"
              />
              <label htmlFor="different_payment_address" className="text-body-md text-on-surface font-medium cursor-pointer">
                Would you like to add a different address for payment stubs?
              </label>
            </div>
          </div>
        </SectionCard>

        {/* Primary Contact */}
        <SectionCard title="Primary Contact" subtitle="Default sender details for outgoing emails">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Sender Name">
              <input type="text" name="primary_contact_name" value={formData.primary_contact_name || ''} onChange={handleChange} className={inputCls} placeholder="e.g. Ashlesha Walunj" />
            </FormField>

            <FormField label="Sender Email">
              <input type="email" name="primary_contact_email" value={formData.primary_contact_email || ''} onChange={handleChange} className={inputCls} placeholder="finance@demand-tech.com" />
            </FormField>
          </div>
          <div className="mt-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">info</span>
            <p className="text-body-sm text-on-surface-variant">
              Emails will be sent through the system's default sender service to prevent them from landing in Spam. Domain authentication is required to send directly from your domain.
            </p>
          </div>
        </SectionCard>

        {/* Regional Settings */}
        <SectionCard title="Regional Settings" subtitle="Currency, timezone, and formatting preferences">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Base Currency">
              <select name="base_currency" value={formData.base_currency || 'INR'} onChange={handleChange} className={selectCls}>
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </FormField>

            <FormField label="Fiscal Year">
              <select name="fiscal_year" value={formData.fiscal_year || 'Jan - Dec'} onChange={handleChange} className={selectCls}>
                <option value="Jan - Dec">January - December</option>
                <option value="Apr - Mar">April - March</option>
                <option value="Jul - Jun">July - June</option>
              </select>
            </FormField>

            <FormField label="Report Basis">
              <select name="report_basis" value={formData.report_basis || 'Accrual'} onChange={handleChange} className={selectCls}>
                <option value="Accrual">Accrual • You owe tax as of invoice date</option>
                <option value="Cash">Cash • You owe tax upon payment receipt</option>
              </select>
            </FormField>

            <FormField label="Organization Language">
              <select name="organization_language" value={formData.organization_language || 'English'} onChange={handleChange} className={selectCls}>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </FormField>

            <FormField label="Time Zone">
              <select name="time_zone" value={formData.time_zone || '(GMT+05:30) India Standard Time'} onChange={handleChange} className={selectCls}>
                <option value="(GMT+05:30) India Standard Time">(GMT+05:30) India Standard Time</option>
                <option value="(GMT-08:00) Pacific Time">(GMT-08:00) Pacific Time</option>
                <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
              </select>
            </FormField>

            <FormField label="Date Format">
              <select name="date_format" value={formData.date_format || 'DD/MM/YYYY'} onChange={handleChange} className={selectCls}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </FormField>
          </div>
        </SectionCard>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
          <div className="max-w-[900px] mx-auto flex justify-end gap-4">
            <Link 
              href="/settings"
              className="px-6 py-2 border border-outline-variant rounded-full text-label-lg font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-primary text-on-primary rounded-full text-label-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                  Saving...
                </>
              ) : 'Save Preferences'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

"use client";

export function ExportGst() {
  return (
    <div className="bg-primary text-on-primary rounded-xl p-6 shadow-sm relative overflow-hidden">
      <h4 className="font-headline-sm text-headline-sm mb-1 text-white">Export GST Data</h4>
      <p className="text-surface-variant text-xs mb-6 opacity-90">
        Ready for GSTR-1 &amp; GSTR-3B Excel formats
      </p>
      <div className="space-y-3">
        <button
          onClick={() => alert("Downloading GSTR-1...")}
          className="w-full py-2.5 bg-white text-primary rounded-lg font-bold flex items-center justify-center gap-1.5 hover:bg-opacity-90 transition-all text-xs"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Download GSTR-1
        </button>
        <button
          onClick={() => alert("Downloading GSTR-9 Annual Summary...")}
          className="w-full py-2.5 bg-primary-container text-white border border-white/20 rounded-lg font-bold flex items-center justify-center gap-1.5 hover:bg-white/10 transition-all text-xs"
        >
          <span className="material-symbols-outlined text-[16px]">description</span>
          GSTR-9 Annual Summary
        </button>
      </div>
    </div>
  );
}

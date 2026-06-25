"use client";

export function ReturnFilingStatus() {
  return (
    <div className="md:col-span-2 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">
          Return Filing Status
        </h3>
        <span className="bg-surface-container-high px-2 py-0.5 rounded text-body-sm font-semibold">
          FY 2023-24
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 border border-outline-variant rounded-lg bg-surface-container-low">
          <p className="text-[10px] uppercase font-bold text-on-surface-variant">GSTR-1</p>
          <p className="text-body-md font-bold mt-1">Filed</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-on-secondary-container bg-secondary-container px-1.5 py-0.5 rounded w-fit">
            <span className="material-symbols-outlined text-xs">check_circle</span> 11 Oct
          </div>
        </div>
        <div className="p-4 border border-outline-variant rounded-lg bg-surface-container-low">
          <p className="text-[10px] uppercase font-bold text-on-surface-variant">GSTR-3B</p>
          <p className="text-body-md font-bold mt-1">Due</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-on-error-container bg-error-container px-1.5 py-0.5 rounded w-fit animate-pulse">
            <span className="material-symbols-outlined text-xs">schedule</span> 20 Oct
          </div>
        </div>
        <div className="p-4 border border-outline-variant rounded-lg bg-surface-container-low">
          <p className="text-[10px] uppercase font-bold text-on-surface-variant">GSTR-2B</p>
          <p className="text-body-md font-bold mt-1">Auto-Gen</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-on-surface-variant bg-surface-variant px-1.5 py-0.5 rounded w-fit">
            <span className="material-symbols-outlined text-xs">info</span> 14 Oct
          </div>
        </div>
        <div className="p-4 border border-outline-variant rounded-lg bg-surface-container-low">
          <p className="text-[10px] uppercase font-bold text-on-surface-variant">TDS Return</p>
          <p className="text-body-md font-bold mt-1">Pending</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-on-surface-variant bg-surface-variant px-1.5 py-0.5 rounded w-fit">
            <span className="material-symbols-outlined text-xs">pending</span> Quarterly
          </div>
        </div>
      </div>
    </div>
  );
}

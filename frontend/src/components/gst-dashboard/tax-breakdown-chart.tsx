"use client";

export function TaxBreakdownChart() {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-headline-sm text-headline-sm text-on-surface">
          Tax Liability Breakdown
        </h4>
        <div className="flex gap-4 text-xs text-on-surface-variant">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span>IGST</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-secondary"></div>
            <span>CGST</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-surface-dim"></div>
            <span>SGST</span>
          </div>
        </div>
      </div>
      <div className="flex items-end gap-6 h-48 px-6 border-b border-outline-variant/30 pb-2">
        <div className="flex-1 flex flex-col gap-1 h-full justify-end group cursor-pointer">
          <div className="bg-primary w-full h-[60%] rounded-t-sm group-hover:opacity-80 transition-opacity"></div>
          <div className="bg-secondary w-full h-[20%] group-hover:opacity-80 transition-opacity"></div>
          <div className="bg-surface-dim w-full h-[20%] rounded-b-sm group-hover:opacity-80 transition-opacity"></div>
          <p className="text-center text-[10px] mt-2 font-mono-data text-on-surface-variant">
            Mar
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-1 h-full justify-end group cursor-pointer">
          <div className="bg-primary w-full h-[45%] rounded-t-sm group-hover:opacity-80 transition-opacity"></div>
          <div className="bg-secondary w-full h-[27%] group-hover:opacity-80 transition-opacity"></div>
          <div className="bg-surface-dim w-full h-[28%] rounded-b-sm group-hover:opacity-80 transition-opacity"></div>
          <p className="text-center text-[10px] mt-2 font-mono-data text-on-surface-variant">
            Apr
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-1 h-full justify-end group cursor-pointer">
          <div className="bg-primary w-full h-[70%] rounded-t-sm group-hover:opacity-80 transition-opacity"></div>
          <div className="bg-secondary w-full h-[15%] group-hover:opacity-80 transition-opacity"></div>
          <div className="bg-surface-dim w-full h-[15%] rounded-b-sm group-hover:opacity-80 transition-opacity"></div>
          <p className="text-center text-[10px] mt-2 font-mono-data text-on-surface-variant">
            May
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-1 h-full justify-end group cursor-pointer">
          <div className="bg-primary w-full h-[55%] rounded-t-sm group-hover:opacity-80 transition-opacity"></div>
          <div className="bg-secondary w-full h-[22%] group-hover:opacity-80 transition-opacity"></div>
          <div className="bg-surface-dim w-full h-[23%] rounded-b-sm group-hover:opacity-80 transition-opacity"></div>
          <p className="text-center text-[10px] mt-2 font-mono-data text-on-surface-variant">
            Jun
          </p>
        </div>
      </div>
    </div>
  );
}

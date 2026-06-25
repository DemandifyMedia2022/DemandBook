"use client";

export interface HsnCode {
  code: string;
  description: string;
  gstRate: string;
}

interface HsnCodesTabProps {
  hsnCodes: HsnCode[];
  onAddHsnCode: (newCode: HsnCode) => void;
}

export function HsnCodesTab({ hsnCodes, onAddHsnCode }: HsnCodesTabProps) {
  const handleLinkHsnCode = () => {
    const code = prompt("Enter HSN/SAC Code:");
    const desc = prompt("Enter Description:");
    const rate = prompt("Enter GST Rate (e.g. 18% GST):");
    if (code && desc && rate) {
      onAddHsnCode({ code, description: desc, gstRate: rate });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hsnCodes.map((hc, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 border border-border rounded-lg bg-card-container-low hover:bg-card-container transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10/10 p-2 rounded text-primary">
                <span className="material-symbols-outlined text-lg">inventory_2</span>
              </div>
              <div>
                <p className="font-bold text-body-md text-foreground">{hc.code}</p>
                <p className="text-xs text-muted-foreground">{hc.description}</p>
              </div>
            </div>
            <span className="text-mono-data font-mono-data font-bold bg-white px-2.5 py-1 rounded border border-border">
              {hc.gstRate}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={handleLinkHsnCode}
        className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1 cursor-pointer"
      >
        <span className="material-symbols-outlined">add_circle</span>
        <span className="font-label-md text-xs font-semibold">Link New HSN Code</span>
      </button>
    </div>
  );
}

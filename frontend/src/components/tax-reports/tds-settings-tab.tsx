"use client";

export interface TdsThreshold {
  section: string;
  rate: number;
  threshold: number;
  used: number;
}

interface TdsSettingsTabProps {
  tdsThresholds: TdsThreshold[];
}

export function TdsSettingsTab({ tdsThresholds }: TdsSettingsTabProps) {
  return (
    <div className="p-6 space-y-4 bg-card-container-lowest">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tdsThresholds.map((tds, idx) => {
          const percent = Math.min((tds.used / tds.threshold) * 100, 100);
          return (
            <div key={idx} className="flex flex-col p-4 border border-border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-body-md text-foreground">{tds.section}</p>
                <span className="bg-card-container-high px-2 py-0.5 rounded text-mono-data font-bold text-xs">
                  {tds.rate}%
                </span>
              </div>
              <div className="w-full bg-border h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-primary h-full"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-semibold">
                <span>Threshold: ₹{tds.threshold.toLocaleString()}</span>
                <span>Used: ₹{tds.used.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

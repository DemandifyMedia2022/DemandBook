"use client";

import React, { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";

interface ExpensePoint {
  day: string;
  amount: number;
}

const expenseDaily: ExpensePoint[] = [
  { day: "Mon", amount: 8500 },
  { day: "Tue", amount: 12100 },
  { day: "Wed", amount: 9200 },
  { day: "Thu", amount: 14800 },
  { day: "Fri", amount: 7400 },
  { day: "Sat", amount: 5200 },
  { day: "Sun", amount: 11900 },
];

export function ExpenseTrendChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // SVG dimensions
  const width = 400;
  const height = 180;
  const padding = { top: 15, right: 15, bottom: 25, left: 40 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Min and Max values for scale
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    expenseDaily.forEach((d) => {
      if (d.amount < min) min = d.amount;
      if (d.amount > max) max = d.amount;
    });
    const diff = max - min || 1000;
    return {
      minVal: Math.max(0, min - diff * 0.1),
      maxVal: max + diff * 0.1,
    };
  }, []);

  // Coordinates
  const points = useMemo(() => {
    return expenseDaily.map((item, index) => {
      const x = padding.left + (index / (expenseDaily.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((item.amount - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y, data: item };
    });
  }, [minVal, maxVal, chartWidth, chartHeight, padding.left, padding.top]);

  // Construct SVG path for line
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [points]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaleX = width / rect.width;
    const internalX = mouseX * scaleX;

    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - internalX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoveredIdx(closestIdx);

    const pt = points[closestIdx];
    const clientX = (pt.x / width) * rect.width;
    const clientY = (pt.y / height) * rect.height;

    setTooltipPos({ x: clientX, y: clientY - 10 });
  };

  return (
    <Card className="md:col-span-2 relative group hover:shadow-md transition-all">
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-2">
        <div className="space-y-0.5">
          <CardTitle className="text-on-surface">Expense Trend</CardTitle>
          <CardDescription className="text-on-surface-variant">Daily operating costs (last 7 days)</CardDescription>
        </div>
        <div className="text-left sm:text-right mt-1 sm:mt-0">
          <p className="font-bold text-headline-sm text-on-surface">$9,870 avg</p>
          <p className="text-xs text-on-surface-variant">per day</p>
        </div>
      </CardHeader>

      <CardContent className="pt-2 relative">
        <div className="w-full h-40">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full cursor-crosshair overflow-visible select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              setHoveredIdx(null);
              setTooltipPos(null);
            }}
          >
            {/* Grid Line */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight * 0.5}
              x2={width - padding.right}
              y2={padding.top + chartHeight * 0.5}
              className="stroke-outline-variant/30"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <line
              x1={padding.left}
              y1={padding.top + chartHeight}
              x2={width - padding.right}
              y2={padding.top + chartHeight}
              className="stroke-outline-variant"
              strokeWidth={1}
            />

            {/* Y Axis Label */}
            <text
              x={padding.left - 8}
              y={padding.top + 4}
              textAnchor="end"
              className="fill-on-surface-variant font-semibold text-[9px]"
            >
              ${Math.round(maxVal).toLocaleString()}
            </text>
            <text
              x={padding.left - 8}
              y={padding.top + chartHeight + 4}
              textAnchor="end"
              className="fill-on-surface-variant font-semibold text-[9px]"
            >
              ${Math.round(minVal).toLocaleString()}
            </text>

            {/* Line Path */}
            <path
              d={linePath}
              className="stroke-error"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />

            {/* Hover State */}
            {hoveredIdx !== null && points[hoveredIdx] && (
              <>
                <line
                  x1={points[hoveredIdx].x}
                  y1={padding.top}
                  x2={points[hoveredIdx].x}
                  y2={padding.top + chartHeight}
                  className="stroke-error/30"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
                <circle
                  cx={points[hoveredIdx].x}
                  cy={points[hoveredIdx].y}
                  r={4.5}
                  className="fill-error stroke-white"
                  strokeWidth={1.5}
                />
              </>
            )}

            {/* X Axis Labels */}
            {points.map((p, idx) => (
              <text
                key={idx}
                x={p.x}
                y={height - 5}
                textAnchor="middle"
                className="fill-on-surface-variant text-[9px] font-semibold"
              >
                {p.data.day}
              </text>
            ))}
          </svg>

          {/* Tooltip HTML */}
          {tooltipPos && hoveredIdx !== null && points[hoveredIdx] && (
            <div
              className="absolute bg-on-background text-background p-2 rounded text-xs shadow-lg pointer-events-none z-10 flex flex-col"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: "translate(-50%, -100%)",
                transition: "left 0.05s ease-out, top 0.05s ease-out",
              }}
            >
              <span className="font-bold text-[9px] uppercase text-slate-400">
                {points[hoveredIdx].data.day} Expense
              </span>
              <span className="font-bold text-sm text-error-container">
                ${points[hoveredIdx].data.amount.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-outline-variant/30 pt-3 text-xs text-on-surface-variant">
        <div className="flex items-center gap-1">
          <Delta value={4.2} variant="badge">
            <DeltaIcon variant="trend" />
            <DeltaValue />
          </Delta>
          <span>vs last week</span>
        </div>
      </CardFooter>
    </Card>
  );
}

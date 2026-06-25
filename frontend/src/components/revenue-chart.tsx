"use client";

import React, { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";
import { revenueChartDemo } from "./revenue-chart-data";
import { formatChartTooltipDate } from "@/lib/formater";

type PeriodDays = 7 | 14 | 30 | 60 | 90;

export function RevenueChart() {
  const [periodDays, setPeriodDays] = useState<PeriodDays>(30);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const chartRows = useMemo(() => {
    return revenueChartDemo.slice(-periodDays);
  }, [periodDays]);

  // Calculations for SVG dimensions
  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Min and Max values for scale
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    chartRows.forEach((r) => {
      if (r.revenue < min) min = r.revenue;
      if (r.revenue > max) max = r.revenue;
    });
    // Add some padding to min and max
    const diff = max - min || 100;
    return {
      minVal: Math.max(0, min - diff * 0.1),
      maxVal: max + diff * 0.1,
    };
  }, [chartRows]);

  // Generate SVG coordinates for each point
  const points = useMemo(() => {
    return chartRows.map((item, index) => {
      const x = padding.left + (index / (chartRows.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((item.revenue - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y, data: item };
    });
  }, [chartRows, minVal, maxVal, chartWidth, chartHeight, padding.left, padding.top]);

  // Construct SVG path strings
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    const bottomY = padding.top + chartHeight;
    return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [points, linePath, padding.top, chartHeight]);

  // Growth percentage calculation
  const growthPct = useMemo(() => {
    const first = chartRows[0]?.revenue ?? 0;
    const last = chartRows[chartRows.length - 1]?.revenue ?? first;
    if (!first) return 0;
    return ((last - first) / first) * 100;
  }, [chartRows]);

  // Mouse move handler for interactive tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Scale factor to map client mouseX to SVG internal viewBox coords
    const scaleX = width / rect.width;
    const internalX = mouseX * scaleX;

    // Find the closest point index by X coordinate
    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - internalX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);

    // Calculate tooltip coordinates relative to client container
    const pt = points[closestIdx];
    // Map internal coordinates to client bounding box percentages
    const clientX = (pt.x / width) * rect.width;
    const clientY = (pt.y / height) * rect.height;

    setTooltipPos({
      x: clientX,
      y: clientY - 10,
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltipPos(null);
  };

  return (
    <Card className="md:col-span-2 lg:col-span-4 relative group">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div>
          <CardTitle className="text-on-surface">Revenue Trend</CardTitle>
          <p className="text-xs text-on-surface-variant">Daily sales breakdown over time</p>
        </div>
        <select
          onChange={(e) => {
            setPeriodDays(Number(e.target.value) as PeriodDays);
            setHoveredIndex(null);
            setTooltipPos(null);
          }}
          value={periodDays}
          className="px-3 py-1.5 border border-outline-variant rounded-md text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="60">Last 60 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </CardHeader>
      
      <CardContent className="pt-2 relative">
        {/* SVG Chart Wrapper */}
        <div className="w-full h-60 relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full cursor-crosshair overflow-visible select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid Lines */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={width - padding.right}
              y2={padding.top}
              className="stroke-outline-variant/30"
              strokeWidth={1}
            />
            <line
              x1={padding.left}
              y1={padding.top + chartHeight * 0.5}
              x2={width - padding.right}
              y2={padding.top + chartHeight * 0.5}
              className="stroke-outline-variant/30"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <line
              x1={padding.left}
              y1={padding.top + chartHeight}
              x2={width - padding.right}
              y2={padding.top + chartHeight}
              className="stroke-outline-variant"
              strokeWidth={1}
            />

            {/* Y-Axis Labels */}
            <text
              x={padding.left - 10}
              y={padding.top + 4}
              textAnchor="end"
              className="fill-on-surface-variant font-semibold text-[10px]"
            >
              ${Math.round(maxVal).toLocaleString()}
            </text>
            <text
              x={padding.left - 10}
              y={padding.top + chartHeight * 0.5 + 4}
              textAnchor="end"
              className="fill-on-surface-variant font-semibold text-[10px]"
            >
              ${Math.round((maxVal + minVal) / 2).toLocaleString()}
            </text>
            <text
              x={padding.left - 10}
              y={padding.top + chartHeight + 4}
              textAnchor="end"
              className="fill-on-surface-variant font-semibold text-[10px]"
            >
              ${Math.round(minVal).toLocaleString()}
            </text>

            {/* Area Path */}
            <path
              d={areaPath}
              className="fill-primary/10"
            />

            {/* Line Path */}
            <path
              d={linePath}
              className="stroke-primary"
              strokeWidth={2}
              fill="none"
            />

            {/* Hover vertical line and circles */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <>
                <line
                  x1={points[hoveredIndex].x}
                  y1={padding.top}
                  x2={points[hoveredIndex].x}
                  y2={padding.top + chartHeight}
                  className="stroke-primary/40"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                />
                <circle
                  cx={points[hoveredIndex].x}
                  cy={points[hoveredIndex].y}
                  r={5}
                  className="fill-primary stroke-white"
                  strokeWidth={1.5}
                />
                <circle
                  cx={points[hoveredIndex].x}
                  cy={points[hoveredIndex].y}
                  r={10}
                  className="fill-primary/20 animate-ping"
                />
              </>
            )}

            {/* Date Tick Marks */}
            {points.length > 0 && (
              <>
                {/* First Day */}
                <text
                  x={points[0].x}
                  y={height - 10}
                  textAnchor="start"
                  className="fill-on-surface-variant text-[10px] font-medium"
                >
                  {points[0].data.date.substring(5)}
                </text>
                {/* Middle Day */}
                <text
                  x={points[Math.floor(points.length / 2)].x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-on-surface-variant text-[10px] font-medium"
                >
                  {points[Math.floor(points.length / 2)].data.date.substring(5)}
                </text>
                {/* Last Day */}
                <text
                  x={points[points.length - 1].x}
                  y={height - 10}
                  textAnchor="end"
                  className="fill-on-surface-variant text-[10px] font-medium"
                >
                  {points[points.length - 1].data.date.substring(5)}
                </text>
              </>
            )}
          </svg>

          {/* HTML Floating Tooltip */}
          {tooltipPos && hoveredIndex !== null && points[hoveredIndex] && (
            <div
              className="absolute bg-on-background text-background p-2.5 rounded-lg text-xs shadow-xl pointer-events-none z-10 flex flex-col gap-0.5"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: "translate(-50%, -100%)",
                transition: "left 0.1s ease-out, top 0.1s ease-out",
              }}
            >
              <span className="font-semibold text-[10px] text-slate-400">
                {formatChartTooltipDate(points[hoveredIndex].data.date, "long")}
              </span>
              <span className="font-bold text-sm">
                ${points[hoveredIndex].data.revenue.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
          <Delta value={growthPct} variant="badge">
            <DeltaIcon variant="trend" />
            <DeltaValue />
          </Delta>
          <span>vs start of range (last {periodDays} days)</span>
        </div>
      </CardFooter>
    </Card>
  );
}

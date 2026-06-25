"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ShareItem {
  category: string;
  share: number; // Percentage (0-100)
  colorClass: string;
  hexColor: string;
}

const initialData: ShareItem[] = [
  { category: "SaaS Subscriptions", share: 45, colorClass: "bg-primary", hexColor: "#2a14b4" },
  { category: "Consulting Services", share: 25, colorClass: "bg-secondary", hexColor: "#006591" },
  { category: "Hardware Sales", share: 18, colorClass: "bg-tertiary-container text-on-tertiary-container", hexColor: "#744800" },
  { category: "Support & Custom", share: 12, colorClass: "bg-surface-variant text-on-surface-variant", hexColor: "#d3e4fe" },
];

export function RevenueShareChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Donut coordinates calculations
  const radius = 55;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~345.57

  // Calculate cumulative shares to determine offsets
  let accumulatedPercent = 0;
  const segments = initialData.map((item, idx) => {
    const percentage = item.share;
    const strokeLength = (percentage / 100) * circumference;
    const strokeOffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percentage;

    return {
      ...item,
      strokeLength,
      strokeOffset,
      index: idx,
    };
  });

  const activeCategory = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader>
        <CardTitle className="text-on-surface">Revenue Share</CardTitle>
        <CardDescription className="text-on-surface-variant">Breakdown by category (this quarter)</CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center justify-center pt-2">
        {/* SVG Donut Chart */}
        <div className="relative w-44 h-44 flex items-center justify-center mb-6">
          <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90 overflow-visible">
            {segments.map((seg) => {
              const isHovered = hoveredIdx === seg.index;
              return (
                <circle
                  key={seg.category}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke={seg.hexColor}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${seg.strokeLength} ${circumference}`}
                  strokeDashoffset={seg.strokeOffset}
                  className="transition-all duration-300 cursor-pointer"
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredIdx(seg.index)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>
          
          {/* Centered Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              {activeCategory ? activeCategory.category.split(" ")[0] : "Total Share"}
            </span>
            <span className="text-xl font-bold text-on-surface mt-0.5">
              {activeCategory ? `${activeCategory.share}%` : "100%"}
            </span>
          </div>
        </div>

        {/* Legend Grid */}
        <div className="w-full space-y-2">
          {segments.map((seg) => (
            <div
              key={seg.category}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
                hoveredIdx === seg.index ? "bg-surface-container" : "hover:bg-surface-container-low"
              }`}
              onMouseEnter={() => setHoveredIdx(seg.index)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full inline-block`} style={{ backgroundColor: seg.hexColor }} />
                <span className="text-xs font-semibold text-on-surface-variant">{seg.category}</span>
              </div>
              <span className="text-xs font-bold text-on-surface font-mono-data">
                {seg.share}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

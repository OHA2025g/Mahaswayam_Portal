import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const HEAT_COLORS = [
  '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80',
  '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
];

function getHeatColor(value, min, max) {
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const index = Math.min(HEAT_COLORS.length - 1, Math.floor(normalized * HEAT_COLORS.length));
  return HEAT_COLORS[index];
}

export function HeatmapChart({ data, rowLabels, colLabels, title, height = 400 }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const allValues = data.flat();
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);

  return (
    <TooltipProvider delayDuration={0}>
      <div style={{ minHeight: height }} data-testid="heatmap-chart">
        {/* Column headers */}
        <div className="flex mb-1" style={{ paddingLeft: 80 }}>
          {colLabels.map((col, ci) => (
            <div
              key={ci}
              className="flex-1 text-center text-[10px] font-medium text-slate-500 truncate px-0.5"
            >
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-0.5">
          {rowLabels.map((row, ri) => (
            <div key={ri} className="flex items-center">
              <div className="w-[80px] shrink-0 text-right pr-2 text-xs font-medium text-slate-600 truncate">
                {row}
              </div>
              <div className="flex-1 flex gap-0.5">
                {colLabels.map((col, ci) => {
                  const val = data[ri]?.[ci] ?? 0;
                  const isHovered = hoveredCell?.r === ri && hoveredCell?.c === ci;
                  return (
                    <Tooltip key={ci}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex-1 rounded-sm transition-all duration-150 cursor-crosshair"
                          style={{
                            backgroundColor: getHeatColor(val, min, max),
                            minHeight: 28,
                            outline: isHovered ? '2px solid #1e3a8a' : 'none',
                            outlineOffset: -1,
                          }}
                          onMouseEnter={() => setHoveredCell({ r: ri, c: ci })}
                          onMouseLeave={() => setHoveredCell(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-semibold">{row} - {col}</p>
                        <p className="text-slate-500">Value: <span className="font-bold text-slate-900">{val}</span></p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center mt-4 gap-2">
          <span className="text-[10px] text-slate-500 font-medium">Low</span>
          <div className="flex h-3 rounded-sm overflow-hidden">
            {HEAT_COLORS.map((c, i) => (
              <div key={i} className="w-5" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">High</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

export function generateHeatmapData(rows, cols) {
  return rows.map(() => cols.map(() => Math.round(Math.random() * 100)));
}

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus, MapPin, Calendar, BarChart3 } from 'lucide-react';
import { MiniLine, MiniBar, DonutChart } from '@/components/charts/ChartComponents';
import { genTimeSeries, genBarData, genPieData, DISTRICTS, SECTORS } from '@/data/mockGenerators';

function generateDrilldownData(label) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const baseValue = Math.random() * 80 + 20;

  return {
    historicalTrend: months.map((m, i) => ({
      name: m,
      value: Math.round(baseValue + Math.random() * 20 + i * 2),
    })),
    districtBreakdown: genBarData(DISTRICTS.slice(0, 8), 30, 95),
    categoryBreakdown: genPieData(SECTORS.slice(0, 5)),
    relatedMetrics: [
      { label: 'Quarter Average', value: `${(baseValue + Math.random() * 10).toFixed(1)}` },
      { label: 'Best Month', value: months[Math.floor(Math.random() * 12)] },
      { label: 'Worst Month', value: months[Math.floor(Math.random() * 12)] },
      { label: 'Variance', value: `${(Math.random() * 15).toFixed(1)}%` },
      { label: 'Target Achievement', value: `${(70 + Math.random() * 25).toFixed(0)}%` },
      { label: 'National Average', value: `${(baseValue - 5 + Math.random() * 10).toFixed(1)}` },
    ],
  };
}

export default function DrilldownModal({ open, onClose, kpi }) {
  const data = useMemo(() => kpi ? generateDrilldownData(kpi.label) : null, [kpi]);

  if (!kpi || !data) return null;

  const trendDir = kpi.trend > 0 ? 'up' : kpi.trend < 0 ? 'down' : 'neutral';
  const TrendIcon = trendDir === 'up' ? TrendingUp : trendDir === 'down' ? TrendingDown : Minus;
  const trendColor = trendDir === 'up' ? 'text-emerald-600 bg-emerald-50' : trendDir === 'down' ? 'text-red-500 bg-red-50' : 'text-slate-400 bg-slate-50';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto" data-testid="drilldown-modal">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="font-heading text-xl font-bold text-slate-900">{kpi.label}</DialogTitle>
              <p className="text-sm text-slate-500 mt-1">Detailed breakdown and historical analysis</p>
            </div>
          </div>
        </DialogHeader>

        {/* Top Summary */}
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Current Value</p>
            <p className="font-heading font-bold text-3xl text-slate-900 tabular-nums">
              {kpi.value}{kpi.suffix && <span className="text-lg text-slate-500 ml-0.5">{kpi.suffix}</span>}
            </p>
          </div>
          {kpi.trend !== undefined && kpi.trend !== null && (
            <Badge className={`${trendColor} border-0 px-3 py-1.5 text-sm font-medium`}>
              <TrendIcon className="w-4 h-4 mr-1" />
              {kpi.trend > 0 ? '+' : ''}{kpi.trend}% vs last period
            </Badge>
          )}
        </div>

        <Separator className="my-4" />

        {/* Historical Trend */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-heading text-sm font-semibold text-slate-800">12-Month Historical Trend</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <MiniLine data={data.historicalTrend} color="#2563EB" height={220} />
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h3 className="font-heading text-sm font-semibold text-slate-800">District Breakdown</h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <MiniBar data={data.districtBreakdown} color="#6366F1" height={220} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-heading text-sm font-semibold text-slate-800">Category Distribution</h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <DonutChart data={data.categoryBreakdown} height={220} />
            </div>
          </div>
        </div>

        {/* Related Metrics */}
        <div className="mt-4">
          <h3 className="font-heading text-sm font-semibold text-slate-800 mb-3">Related Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.relatedMetrics.map((m, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3" data-testid={`related-metric-${i}`}>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{m.label}</p>
                <p className="font-heading font-bold text-lg text-slate-900 mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

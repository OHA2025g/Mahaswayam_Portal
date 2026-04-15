import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info, Download, FileText, FileSpreadsheet, Maximize2, RefreshCw } from 'lucide-react';
import { MiniBar, MiniLine, DonutChart, GaugeChart, GroupedBar, MiniArea, HorizontalBar, MultiLine } from '@/components/charts/ChartComponents';
import { HeatmapChart } from '@/components/charts/HeatmapChart';
import { SankeyChart } from '@/components/charts/SankeyChart';
import DateRangePicker from '@/components/DateRangePicker';
import DrilldownModal from '@/components/DrilldownModal';
import { exportToPDF, exportToCSV, collectTabData } from '@/components/ExportTools';

function KPICard({ label, value, trend, suffix = '', icon: Icon, color, onClick }) {
  const trendDir = trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';
  const TrendIcon = trendDir === 'up' ? TrendingUp : trendDir === 'down' ? TrendingDown : Minus;
  const trendColor = trendDir === 'up' ? 'text-emerald-600' : trendDir === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <div
      className="kpi-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-5 flex flex-col cursor-pointer group hover:border-blue-300 dark:hover:border-blue-600"
      data-testid={`kpi-${label.toLowerCase().replace(/[\s()%\/]/g, '-')}`}
      onClick={() => onClick?.({ label, value, trend, suffix })}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight">{label}</p>
        <Maximize2 className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
      <p className="font-heading font-bold text-2xl text-slate-900 dark:text-slate-100 tabular-nums">
        {value}{suffix && <span className="text-base font-medium text-slate-500 dark:text-slate-400 ml-0.5">{suffix}</span>}
      </p>
      {trend !== undefined && trend !== null && (
        <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{trend > 0 ? '+' : ''}{trend}%</span>
          <span className="text-xs text-slate-400 ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
}

function AlertCard({ label, value, severity = 'warning' }) {
  const colors = {
    warning: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400',
    danger: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400',
    info: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400',
  };
  const IconComp = severity === 'info' ? Info : AlertTriangle;
  return (
    <div className={`border rounded-lg p-4 flex items-center gap-3 ${colors[severity]}`} data-testid={`alert-${label.toLowerCase().replace(/[\s()%\/]/g, '-')}`}>
      <IconComp className="w-5 h-5 shrink-0" />
      <div>
        <p className="text-xs font-medium opacity-80">{label}</p>
        <p className="font-heading font-bold text-lg">{value}</p>
      </div>
    </div>
  );
}

function ProgressCard({ label, value, max = 100 }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-5" data-testid={`progress-${label.toLowerCase().replace(/[\s()%\/]/g, '-')}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{pct}%</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}

function ChartCard({ title, children, span = 1 }) {
  const spanClass = span === 2 ? 'md:col-span-2' : span === 3 ? 'md:col-span-3' : '';
  return (
    <Card className={`border-slate-200 dark:border-slate-700 dark:bg-slate-900 shadow-sm ${spanClass}`} data-testid={`chart-${title.toLowerCase().replace(/[\s()%\/]/g, '-')}`}>
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="font-heading text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        {children}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" data-testid="dashboard-loading">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-5 h-28">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-5 h-72">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
            <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardTemplate({ title, subtitle, level, tabs, loading, error, onDateChange, dateRange, onRefresh }) {
  const [drilldownKPI, setDrilldownKPI] = useState(null);
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.id || '');
  const [exporting, setExporting] = useState(false);

  const firstTabId = tabs?.[0]?.id;
  if (firstTabId && !tabs.find(t => t.id === activeTab)) {
    setActiveTab(firstTabId);
  }

  const handleExportPDF = useCallback(async () => {
    setExporting(true);
    try { await exportToPDF('dashboard-content', title); } finally { setExporting(false); }
  }, [title]);

  const handleExportCSV = useCallback(() => {
    const currentTab = tabs?.find(t => t.id === activeTab);
    if (!currentTab) return;
    const rows = collectTabData(currentTab);
    if (rows.length > 0) exportToCSV(rows, `${title}_${currentTab.label}`);
  }, [tabs, activeTab, title]);

  const handleExportAllCSV = useCallback(() => {
    const allRows = (tabs || []).flatMap(tab => collectTabData(tab));
    if (allRows.length > 0) exportToCSV(allRows, `${title}_All_Data`);
  }, [tabs, title]);

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-fade-in" data-testid={`dashboard-${title.toLowerCase().replace(/[\s()%\/]/g, '-')}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider dark:border-slate-600 dark:text-slate-400">{level}</Badge>
              {loading && <span className="flex items-center text-xs text-blue-600 dark:text-blue-400"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Loading...</span>}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} className="h-9 px-3 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300" data-testid="refresh-btn" disabled={loading}>
                <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            )}
            {onDateChange && <DateRangePicker dateRange={dateRange} onDateChange={onDateChange} />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300" disabled={exporting} data-testid="export-menu-trigger">
                  <Download className="w-3.5 h-3.5 mr-2 text-slate-500" />{exporting ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={handleExportPDF} data-testid="export-pdf-btn"><FileText className="w-4 h-4 mr-2 text-red-500" />Export as PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV} data-testid="export-csv-tab-btn"><FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />Export Current Tab (CSV)</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportAllCSV} data-testid="export-csv-all-btn"><FileSpreadsheet className="w-4 h-4 mr-2 text-blue-600" />Export All Tabs (CSV)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400" data-testid="dashboard-error">
          Failed to load data: {error}
        </div>
      )}

      {loading && !tabs?.length ? <LoadingSkeleton /> : (
        <div id="dashboard-content">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg" data-testid="dashboard-tabs">
              {(tabs || []).map(t => (
                <TabsTrigger key={t.id} value={t.id} className="text-xs font-medium px-3 py-1.5 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm" data-testid={`tab-${t.id}`}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {(tabs || []).map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0 space-y-6">
                {tab.metrics?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {tab.metrics.map((m, i) => <KPICard key={i} {...m} onClick={setDrilldownKPI} />)}
                  </div>
                )}
                {tab.alerts?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {tab.alerts.map((a, i) => <AlertCard key={i} {...a} />)}
                  </div>
                )}
                {tab.progress?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {tab.progress.map((p, i) => <ProgressCard key={i} {...p} />)}
                  </div>
                )}
                {tab.charts?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tab.charts.map((chart, i) => (
                      <ChartCard key={i} title={chart.title} span={chart.span}>
                        {chart.type === 'bar' && <MiniBar data={chart.data} color={chart.color} height={chart.height || 280} />}
                        {chart.type === 'line' && <MiniLine data={chart.data} color={chart.color} height={chart.height || 280} />}
                        {chart.type === 'area' && <MiniArea data={chart.data} color={chart.color} height={chart.height || 280} />}
                        {chart.type === 'pie' && <DonutChart data={chart.data} height={chart.height || 280} />}
                        {chart.type === 'gauge' && <GaugeChart value={chart.value} label={chart.gaugeLabel} color={chart.color} height={chart.height || 200} />}
                        {chart.type === 'grouped' && <GroupedBar data={chart.data} keys={chart.keys} stacked={chart.stacked} height={chart.height || 280} />}
                        {chart.type === 'horizontal' && <HorizontalBar data={chart.data} color={chart.color} height={chart.height || 280} />}
                        {chart.type === 'multiline' && <MultiLine data={chart.data} keys={chart.keys} height={chart.height || 280} />}
                        {chart.type === 'heatmap' && <HeatmapChart data={chart.data} rowLabels={chart.rowLabels} colLabels={chart.colLabels} height={chart.height || 350} />}
                        {chart.type === 'sankey' && <SankeyChart nodes={chart.nodes} links={chart.links} height={chart.height || 400} />}
                      </ChartCard>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      <DrilldownModal open={!!drilldownKPI} onClose={() => setDrilldownKPI(null)} kpi={drilldownKPI} />
    </div>
  );
}

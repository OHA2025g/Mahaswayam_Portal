import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, BarChart3, Brain, Shield, ClipboardList, GraduationCap, Building2, Headphones, Users, PieChart, ArrowRight, AlertTriangle, Gauge } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;

const DASH_ICONS = { ceo: BarChart3, ai: Brain, officer: Shield, pmo: ClipboardList, institute: GraduationCap, employer: Building2, helpdesk: Headphones, student: Users, bi: PieChart };
const TYPE_COLORS = { metric: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', alert: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', tab: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', dashboard: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' };

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const search = useCallback(async (q) => {
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await axios.get(`${API}/search`, { params: { q }, withCredentials: true });
      setResults(res.data);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (query) search(query); else setResults([]); }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (open) { setQuery(''); setResults([]); }
  }, [open]);

  const handleSelect = (item) => {
    onClose();
    const path = `/dashboard/${item.dashboard}`;
    navigate(path);
  };

  const grouped = results.reduce((acc, r) => {
    const key = r.dashboard_title;
    if (!acc[key]) acc[key] = { dashboard: r.dashboard, items: [] };
    acc[key].items.push(r);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden" data-testid="global-search-modal">
        {/* Search Input */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search KPIs, dashboards, tabs across all dashboards..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
            autoFocus
            data-testid="global-search-input"
          />
          <kbd className="hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700 ml-2">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {searching && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-sm text-slate-500">Searching...</span>
            </div>
          )}

          {!searching && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No results found for "{query}"</p>
            </div>
          )}

          {!searching && Object.entries(grouped).map(([title, group]) => {
            const Icon = DASH_ICONS[group.dashboard] || BarChart3;
            return (
              <div key={title} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
                </div>
                {group.items.slice(0, 5).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 text-left transition-colors"
                    data-testid={`search-result-${i}`}
                  >
                    <Badge className={`text-[10px] shrink-0 ${TYPE_COLORS[item.type] || ''}`}>
                      {item.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{item.label}</p>
                      {item.tab_label && (
                        <p className="text-xs text-slate-400 truncate">{item.tab_label}</p>
                      )}
                    </div>
                    {item.value && (
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums shrink-0">
                        {item.value}{item.suffix || ''}
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  </button>
                ))}
              </div>
            );
          })}

          {!searching && query.length < 2 && (
            <div className="py-8 text-center">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Type at least 2 characters to search</p>
              <p className="text-xs text-slate-400 mt-1">Search across 400+ KPIs in all 9 dashboards</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

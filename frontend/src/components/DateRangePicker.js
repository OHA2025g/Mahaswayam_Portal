import React, { useState } from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const PRESETS = [
  { label: 'Last 7 Days', range: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 Days', range: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Last 3 Months', range: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: 'Last 6 Months', range: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
  { label: 'This Month', range: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: 'Last Year', range: () => ({ from: subMonths(new Date(), 12), to: new Date() }) },
];

export default function DateRangePicker({ dateRange, onDateChange }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (range) => {
    if (range?.from) {
      onDateChange(range);
      if (range.from && range.to) setOpen(false);
    }
  };

  const handlePreset = (preset) => {
    const range = preset.range();
    onDateChange(range);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs font-medium bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
          data-testid="date-range-picker-trigger"
        >
          <CalendarIcon className="w-3.5 h-3.5 mr-2 text-slate-500" />
          {dateRange?.from ? (
            <>
              {format(dateRange.from, 'MMM dd, yyyy')}
              {dateRange.to && <> - {format(dateRange.to, 'MMM dd, yyyy')}</>}
            </>
          ) : (
            'Select Date Range'
          )}
          <ChevronDown className="w-3.5 h-3.5 ml-2 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end" data-testid="date-range-picker-popover">
        <div className="flex">
          <div className="border-r border-slate-200 p-3 space-y-1 min-w-[140px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">Quick Select</p>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p)}
                className="block w-full text-left text-xs px-2 py-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-700 transition-colors"
                data-testid={`preset-${p.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="p-2">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              defaultMonth={subMonths(new Date(), 1)}
              data-testid="date-range-calendar"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

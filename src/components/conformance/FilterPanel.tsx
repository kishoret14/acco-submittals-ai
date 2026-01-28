import React, { useState } from 'react';
import { Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConformanceFilters, OverallStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { divisionOptions, systemTypeOptions } from '@/lib/mockData';

interface FilterPanelProps {
  filters: ConformanceFilters;
  onFiltersChange: (filters: ConformanceFilters) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const statusOptions: { value: OverallStatus; label: string; activeClass: string }[] = [
  { value: 'Pre-Approved', label: 'Approved', activeClass: 'bg-success-100 text-success-700 border-success-300' },
  { value: 'Review Required', label: 'Review', activeClass: 'bg-warning-100 text-warning-700 border-warning-300' },
  { value: 'Action Mandatory', label: 'Action', activeClass: 'bg-error-100 text-error-700 border-error-300' },
];

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.division !== '' ||
    filters.systemType !== '' ||
    filters.searchQuery !== '';

  const toggleStatus = (status: OverallStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatus });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: [],
      division: '',
      systemType: '',
      searchQuery: '',
    });
  };

  const hasAdvancedFilters = filters.division !== '' || filters.systemType !== '';

  return (
    <div className="border-b border-neutral-200 bg-white px-3 py-2.5 space-y-2">
      {/* Search row */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search..."
          value={filters.searchQuery}
          onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
          className="w-full pl-8 pr-8 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Status chips and more filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {statusOptions.map((option) => {
          const isActive = filters.status.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleStatus(option.value)}
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded border transition-colors',
                isActive
                  ? option.activeClass
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
              )}
            >
              {option.label}
            </button>
          );
        })}

        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className={cn(
            'px-2 py-0.5 text-xs font-medium rounded border transition-colors flex items-center gap-1',
            hasAdvancedFilters
              ? 'bg-primary-50 text-primary-700 border-primary-200'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
          )}
        >
          <SlidersHorizontal className="h-3 w-3" />
          More
          <ChevronDown className={cn('h-3 w-3 transition-transform', showMoreFilters && 'rotate-180')} />
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-2 py-0.5 text-xs text-neutral-500 hover:text-neutral-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Expandable advanced filters */}
      {showMoreFilters && (
        <div className="flex gap-2 pt-1">
          <Select
            value={filters.division || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, division: value === 'all' ? '' : value })}
          >
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              {divisionOptions.map((opt) => (
                <SelectItem key={opt.value || 'all'} value={opt.value || 'all'}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.systemType || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, systemType: value === 'all' ? '' : value })}
          >
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue placeholder="System" />
            </SelectTrigger>
            <SelectContent>
              {systemTypeOptions.map((opt) => (
                <SelectItem key={opt.value || 'all'} value={opt.value || 'all'}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

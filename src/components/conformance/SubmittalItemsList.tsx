import React from 'react';
import { cn, truncateText } from '@/lib/utils';
import { ConformanceResult, OverallStatus } from '@/lib/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfidenceScore } from '@/components/common/ConfidenceScore';
import { Checkbox } from '@/components/ui/checkbox';

interface SubmittalItemsListProps {
  items: ConformanceResult[];
  selectedItemId: string | null;
  onSelectItem: (item: ConformanceResult) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export function SubmittalItemsList({
  items,
  selectedItemId,
  onSelectItem,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: SubmittalItemsListProps) {
  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 bg-neutral-50">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onToggleSelectAll}
          aria-label={allSelected ? 'Deselect all' : 'Select all'}
          className={cn(someSelected && 'data-[state=checked]:bg-primary/50')}
        />
        <span className="text-sm text-neutral-500">
          {items.length} item{items.length !== 1 ? 's' : ''}
          {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <SubmittalItemCard
            key={item.id}
            item={item}
            isActive={item.id === selectedItemId}
            isChecked={selectedIds.has(item.id)}
            onSelect={() => onSelectItem(item)}
            onToggleCheck={() => onToggleSelect(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface SubmittalItemCardProps {
  item: ConformanceResult;
  isActive: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onToggleCheck: () => void;
}

function SubmittalItemCard({
  item,
  isActive,
  isChecked,
  onSelect,
  onToggleCheck,
}: SubmittalItemCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 border-b border-neutral-100 cursor-pointer transition-colors',
        isActive ? 'bg-primary-50 border-l-2 border-l-primary' : 'hover:bg-neutral-50'
      )}
      onClick={onSelect}
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={onToggleCheck}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Select ${item.materialDescription}`}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium line-clamp-2', isActive ? 'text-primary-900' : 'text-neutral-900')}>
          {item.materialDescription}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <StatusBadge status={item.overallStatus} size="sm" />
          <ConfidenceScore score={item.confidenceScore} size="sm" />
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          {item.specSection} · {item.division}
        </p>
      </div>
    </div>
  );
}

import React from 'react';
import { X, Check, MessageSquare, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BatchActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onApproveSelected: () => void;
  onAddComment?: () => void;
  onAssignReviewer?: () => void;
  className?: string;
}

export function BatchActionsBar({
  selectedCount,
  onClearSelection,
  onApproveSelected,
  onAddComment,
  onAssignReviewer,
  className,
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-4 animate-slide-in z-50',
        className
      )}
    >
      <span className="text-sm">
        <strong>{selectedCount}</strong> item{selectedCount !== 1 ? 's' : ''} selected
      </span>

      <div className="h-4 w-px bg-neutral-700" />

      <div className="flex items-center gap-2">
        {onAssignReviewer && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAssignReviewer}
            className="text-white hover:bg-neutral-800"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Reviewer
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onApproveSelected}
          className="text-white hover:bg-neutral-800"
        >
          <Check className="mr-2 h-4 w-4" />
          Approve Selected
        </Button>

        {onAddComment && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddComment}
            className="text-white hover:bg-neutral-800"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Add Comment
          </Button>
        )}
      </div>

      <div className="h-4 w-px bg-neutral-700" />

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClearSelection}
        className="text-neutral-400 hover:text-white hover:bg-neutral-800"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

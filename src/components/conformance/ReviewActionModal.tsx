import React, { useState } from 'react';
import { MessageSquare, CheckCircle, XCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ReviewActionType } from '@/lib/types';

interface ReviewActionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (action: ReviewActionType, comment: string) => void;
  itemDescription?: string;
}

const actionOptions: { value: ReviewActionType; label: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'reviewed',
    label: 'Mark as Reviewed',
    icon: <Eye className="h-4 w-4" />,
    color: 'border-accent-300 bg-accent-50 text-accent-700'
  },
  {
    value: 'approved',
    label: 'Approve',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'border-success-300 bg-success-50 text-success-700'
  },
  {
    value: 'rejected',
    label: 'Request Changes',
    icon: <XCircle className="h-4 w-4" />,
    color: 'border-error-300 bg-error-50 text-error-700'
  },
  {
    value: 'comment',
    label: 'Add Comment Only',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'border-neutral-300 bg-neutral-50 text-neutral-700'
  },
];

export function ReviewActionModal({
  open,
  onClose,
  onSubmit,
  itemDescription,
}: ReviewActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<ReviewActionType | null>(null);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (selectedAction) {
      onSubmit(selectedAction, comment);
      setSelectedAction(null);
      setComment('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Item</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {itemDescription && (
            <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-md border border-neutral-200">
              {itemDescription}
            </p>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700">Select Action</p>
            <div className="grid grid-cols-2 gap-2">
              {actionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedAction(option.value)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left',
                    selectedAction === option.value
                      ? option.color + ' border-current'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  )}
                >
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Comment {selectedAction === 'comment' ? '(required)' : '(optional)'}
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add notes or comments about this review..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedAction || (selectedAction === 'comment' && !comment.trim())}
          >
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

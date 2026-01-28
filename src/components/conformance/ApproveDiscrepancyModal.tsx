import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConformanceResult } from '@/lib/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { approvalReasonOptions } from '@/lib/mockData';

interface ApproveDiscrepancyModalProps {
  item: ConformanceResult | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (itemId: string, reason: string, comment: string) => void;
  batchMode?: boolean;
  batchCount?: number;
}

export function ApproveDiscrepancyModal({
  item,
  open,
  onClose,
  onSubmit,
  batchMode = false,
  batchCount = 0,
}: ApproveDiscrepancyModalProps) {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!reason) {
      newErrors.reason = 'Please select a reason for approval';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (batchMode) {
      // In batch mode, item is null - we just call with empty ID
      onSubmit('', reason, comment);
    } else if (item) {
      onSubmit(item.id, reason, comment);
    }

    setReason('');
    setComment('');
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setReason('');
    setComment('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {batchMode ? `Approve ${batchCount} Discrepancies` : 'Approve Discrepancy'}
          </DialogTitle>
          <DialogDescription>
            {batchMode
              ? `You are about to approve ${batchCount} items with discrepancies. This action will be recorded for audit purposes.`
              : 'Provide a reason for approving this discrepancy. This will be recorded for audit purposes.'}
          </DialogDescription>
        </DialogHeader>

        {!batchMode && item && (
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-sm font-medium text-neutral-900 mb-2 line-clamp-2">
              {item.materialDescription}
            </p>
            <div className="flex items-center gap-2">
              <StatusBadge status={item.overallStatus} size="sm" />
              <span className="text-xs text-neutral-500">{item.specSection}</span>
            </div>
          </div>
        )}

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium text-neutral-900">
              Reason for Approval <span className="text-error">*</span>
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason" error={!!errors.reason}>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {approvalReasonOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-xs text-error">{errors.reason}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium text-neutral-900">
              Additional Comments
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any additional notes or justification..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            Approve{batchMode ? ` (${batchCount})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

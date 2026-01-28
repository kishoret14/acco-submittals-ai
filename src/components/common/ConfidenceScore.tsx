import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ConfidenceScoreProps {
  score: number;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'success';
  if (score >= 70) return 'warning';
  return 'error';
}

function getScoreColorClass(score: number): string {
  if (score >= 90) return 'text-success bg-success-50';
  if (score >= 70) return 'text-warning-700 bg-warning-50';
  return 'text-error bg-error-50';
}

function getProgressColorClass(score: number): string {
  if (score >= 90) return 'bg-success';
  if (score >= 70) return 'bg-warning';
  return 'bg-error';
}

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-0.5',
  lg: 'text-base px-2.5 py-1',
};

export function ConfidenceScore({ score, showBar = false, size = 'md', className }: ConfidenceScoreProps) {
  const colorClass = getScoreColorClass(score);
  const progressColor = getProgressColorClass(score);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-medium rounded', colorClass, sizeClasses[size])}>
        {score}%
      </span>
      {showBar && (
        <div className="flex-1 max-w-[100px]">
          <Progress
            value={score}
            className="h-1.5"
            indicatorClassName={progressColor}
          />
        </div>
      )}
    </div>
  );
}

export function ConfidenceScoreBar({ score, className }: { score: number; className?: string }) {
  const progressColor = getProgressColorClass(score);

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">Confidence</span>
        <span className={cn('text-xs font-medium',
          score >= 90 ? 'text-success' : score >= 70 ? 'text-warning-700' : 'text-error'
        )}>
          {score}%
        </span>
      </div>
      <Progress
        value={score}
        className="h-2"
        indicatorClassName={progressColor}
      />
    </div>
  );
}

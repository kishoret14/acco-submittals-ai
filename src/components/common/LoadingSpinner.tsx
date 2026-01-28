import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <p className="text-sm text-neutral-500">{text}</p>}
    </div>
  );
}

export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-neutral-200 rounded', className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="border border-neutral-200 rounded-lg p-6 space-y-4">
      <SkeletonLine className="h-6 w-3/4" />
      <SkeletonLine className="h-4 w-1/2" />
      <div className="flex gap-2">
        <SkeletonLine className="h-6 w-20" />
        <SkeletonLine className="h-6 w-24" />
      </div>
      <SkeletonLine className="h-4 w-full" />
    </div>
  );
}

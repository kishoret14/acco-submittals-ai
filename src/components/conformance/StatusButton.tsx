import React from 'react';
import { ChevronDown, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OverallStatus } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface StatusButtonProps {
  status: OverallStatus;
  onStatusChange: (newStatus: OverallStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

const statusConfig: Record<OverallStatus, {
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  hoverColor: string;
  borderColor: string;
}> = {
  'Pre-Approved': {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    bgColor: 'bg-success-50',
    textColor: 'text-success-700',
    hoverColor: 'hover:bg-success-100',
    borderColor: 'border-success-200',
  },
  'Review Required': {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    bgColor: 'bg-warning-50',
    textColor: 'text-warning-700',
    hoverColor: 'hover:bg-warning-100',
    borderColor: 'border-warning-200',
  },
  'Action Mandatory': {
    icon: <XCircle className="h-3.5 w-3.5" />,
    bgColor: 'bg-error-50',
    textColor: 'text-error-700',
    hoverColor: 'hover:bg-error-100',
    borderColor: 'border-error-200',
  },
};

// Allowed status transitions
const allowedTransitions: Record<OverallStatus, OverallStatus[]> = {
  'Pre-Approved': ['Review Required', 'Action Mandatory'],
  'Review Required': ['Pre-Approved', 'Action Mandatory'],
  'Action Mandatory': ['Review Required', 'Pre-Approved'],
};

export function StatusButton({ status, onStatusChange, disabled = false, size = 'default' }: StatusButtonProps) {
  const config = statusConfig[status];
  const availableStatuses = allowedTransitions[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size={size}
          className={cn(
            'gap-2 border font-medium transition-colors',
            config.bgColor,
            config.textColor,
            config.borderColor,
            config.hoverColor,
            size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-sm'
          )}
        >
          {config.icon}
          <span>{status}</span>
          <ChevronDown className={cn('opacity-60', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        {availableStatuses.map((newStatus) => {
          const newConfig = statusConfig[newStatus];
          return (
            <DropdownMenuItem
              key={newStatus}
              onClick={() => onStatusChange(newStatus)}
              className={cn(
                'gap-2 cursor-pointer',
                newConfig.textColor
              )}
            >
              {newConfig.icon}
              <span>{newStatus}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

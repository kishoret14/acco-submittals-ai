import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Loader2, FileCheck } from 'lucide-react';
import { OverallStatus, EvidenceStatus, ProjectStatus, ConformanceJobStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: OverallStatus | EvidenceStatus | ProjectStatus | ConformanceJobStatus | string;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const statusConfig: Record<string, {
  variant: 'success' | 'warning' | 'error' | 'default' | 'accent' | 'neutral';
  icon: React.ReactNode;
  label?: string;
}> = {
  'Pre-Approved': { variant: 'success', icon: <CheckCircle2 className="h-3 w-3" /> },
  'Review Required': { variant: 'warning', icon: <AlertTriangle className="h-3 w-3" /> },
  'Action Mandatory': { variant: 'error', icon: <XCircle className="h-3 w-3" /> },
  'Match': { variant: 'success', icon: <CheckCircle2 className="h-3 w-3" /> },
  'Potential Issue': { variant: 'warning', icon: <AlertTriangle className="h-3 w-3" /> },
  'Discrepancy': { variant: 'error', icon: <XCircle className="h-3 w-3" /> },
  'Active': { variant: 'success', icon: <CheckCircle2 className="h-3 w-3" /> },
  'Planning': { variant: 'default', icon: <Clock className="h-3 w-3" /> },
  'On Hold': { variant: 'warning', icon: <AlertTriangle className="h-3 w-3" /> },
  'Completed': { variant: 'neutral', icon: <FileCheck className="h-3 w-3" /> },
  'Uploading': { variant: 'default', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  'Processing': { variant: 'accent', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  'Ready for Review': { variant: 'warning', icon: <AlertTriangle className="h-3 w-3" /> },
  'Pending': { variant: 'warning', icon: <Clock className="h-3 w-3" /> },
  'Inactive': { variant: 'neutral', icon: <XCircle className="h-3 w-3" /> },
};

export function StatusBadge({ status, showIcon = true, size = 'default' }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'neutral' as const, icon: null };

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={showIcon ? config.icon : undefined}
    >
      {config.label || status}
    </Badge>
  );
}

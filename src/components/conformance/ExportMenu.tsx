import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/common/Toast';

interface ExportMenuProps {
  onExport: (format: 'csv' | 'xlsx' | 'pdf') => Promise<void>;
  disabled?: boolean;
}

export function ExportMenu({ onExport, disabled }: ExportMenuProps) {
  const { success, error } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    setIsExporting(true);
    setExportingFormat(format);

    try {
      await onExport(format);
      success(`Report exported as ${format.toUpperCase()} successfully`);
    } catch (err) {
      error('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting}
        >
          <FileText className="mr-2 h-4 w-4" />
          <div className="flex-1">
            <span>Export as CSV</span>
            <p className="text-xs text-neutral-400">Comma-separated values</p>
          </div>
          {exportingFormat === 'csv' && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('xlsx')}
          disabled={isExporting}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <div className="flex-1">
            <span>Export as Excel</span>
            <p className="text-xs text-neutral-400">Microsoft Excel format</p>
          </div>
          {exportingFormat === 'xlsx' && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
        >
          <FileText className="mr-2 h-4 w-4 text-error" />
          <div className="flex-1">
            <span>Export as PDF</span>
            <p className="text-xs text-neutral-400">Client-ready format</p>
          </div>
          {exportingFormat === 'pdf' && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

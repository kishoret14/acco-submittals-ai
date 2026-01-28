import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, FileText, Quote, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Citation {
  text: string;
  pageNumber: number;
  source: 'spec' | 'material';
  status: 'match' | 'issue' | 'discrepancy';
}

interface PDFPreviewModalProps {
  open: boolean;
  onClose: () => void;
  pageNumber: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  citations?: Citation[];
  materialDescription?: string;
}

export function PDFPreviewModal({
  open,
  onClose,
  pageNumber,
  totalPages = 50,
  onPageChange,
  citations = [],
  materialDescription,
}: PDFPreviewModalProps) {
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    setCurrentPage(pageNumber);
  }, [pageNumber]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handlePageChange = (page: number) => {
    const newPage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(newPage);
    onPageChange?.(newPage);
  };

  // Get citations for current page
  const currentPageCitations = citations.filter((c) => c.pageNumber === currentPage);

  const getStatusColor = (status: Citation['status']) => {
    switch (status) {
      case 'match':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'issue':
        return 'bg-amber-100 border-amber-400 text-amber-800';
      case 'discrepancy':
        return 'bg-red-100 border-red-400 text-red-800';
    }
  };

  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-[99999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="absolute inset-4 md:inset-8 lg:inset-12 flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Document Preview</h2>
              {materialDescription && (
                <p className="text-xs text-neutral-500 truncate max-w-xs">
                  {materialDescription}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-md px-1">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 25))}
                disabled={zoom <= 50}
                className="p-1.5 hover:bg-neutral-100 rounded disabled:opacity-50"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs w-10 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                disabled={zoom >= 200}
                className="p-1.5 hover:bg-neutral-100 rounded disabled:opacity-50"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-md px-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 hover:bg-neutral-100 rounded disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1.5 hover:bg-neutral-100 rounded disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Download button */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-neutral-200 rounded-md hover:bg-neutral-50">
              <Download className="h-3.5 w-3.5" />
              Download
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-200 rounded-md ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document Area */}
          <div className="flex-1 overflow-auto bg-neutral-700 p-6">
            <div
              className="mx-auto bg-white shadow-xl"
              style={{
                width: `${Math.round(8.5 * 96 * zoom / 100)}px`,
                minHeight: `${Math.round(11 * 96 * zoom / 100)}px`,
              }}
            >
              {/* Document Content */}
              <div className="p-8" style={{ fontSize: `${14 * zoom / 100}px` }}>
                {/* Header */}
                <div className="border-b-2 border-neutral-900 pb-3 mb-6">
                  <h1 className="text-lg font-bold text-neutral-900" style={{ fontSize: `${18 * zoom / 100}px` }}>
                    DIVISION 23 - HEATING, VENTILATING, AND AIR CONDITIONING
                  </h1>
                  <p className="text-neutral-600 mt-1">
                    Section 23 64 16 - Centrifugal Water Chillers
                  </p>
                  <div className="flex justify-between mt-2 text-xs text-neutral-400">
                    <span>Project: Downtown Medical Center HVAC Renovation</span>
                    <span>Page {currentPage}</span>
                  </div>
                </div>

                {/* Citations highlight */}
                {currentPageCitations.length > 0 && (
                  <div className="mb-6 space-y-3">
                    {currentPageCitations.map((citation, index) => (
                      <div
                        key={index}
                        className={cn(
                          'p-3 rounded border-l-4',
                          getStatusColor(citation.status)
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Quote className="h-3.5 w-3.5" />
                          <span className="text-xs font-semibold uppercase">
                            {citation.source === 'spec' ? 'Specification' : 'Material Index'}
                          </span>
                        </div>
                        <p className="text-sm">{citation.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Document Body */}
                <div className="space-y-5">
                  <section>
                    <h2 className="font-bold text-neutral-900 mb-3">PART 1 - GENERAL</h2>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-neutral-800">1.1 SUMMARY</h3>
                        <div className="mt-2 space-y-2 text-neutral-700">
                          <p>A. Section includes water-cooled, centrifugal liquid chillers with variable-speed drives.</p>
                          <p>B. Related Requirements:</p>
                          <ul className="list-disc ml-6 space-y-1">
                            <li>Section 23 05 00 - Common Work Results for HVAC</li>
                            <li>Section 23 05 93 - Testing, Adjusting, and Balancing for HVAC</li>
                            <li>Section 23 21 13 - Hydronic Piping</li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-neutral-800">1.2 PERFORMANCE REQUIREMENTS</h3>
                        <div className="mt-2 space-y-2 text-neutral-700">
                          <p>A. Minimum cooling capacity: 500 tons at ARI 550/590 conditions.</p>
                          <p>B. Variable speed drives required for capacity modulation.</p>
                          <p>C. Energy Efficiency:</p>
                          <ul className="list-disc ml-6 space-y-1">
                            <li>Full Load: Maximum 0.560 kW/ton</li>
                            <li>IPLV: Maximum 0.340 kW/ton</li>
                            <li>NPLV: Maximum 0.380 kW/ton</li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-neutral-800">1.3 SUBMITTALS</h3>
                        <div className="mt-2 space-y-2 text-neutral-700">
                          <p>A. Product Data: Include rated capacities and operating characteristics.</p>
                          <p>B. Shop Drawings: Include plans, elevations, sections, and details.</p>
                          <p>C. Certificates: Energy efficiency certifications per ASHRAE 90.1.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="font-bold text-neutral-900 mb-3">PART 2 - PRODUCTS</h2>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-neutral-800">2.1 MANUFACTURERS</h3>
                        <div className="mt-2 space-y-2 text-neutral-700">
                          <p>A. Basis-of-Design: Trane CenTraVac, or equal by:</p>
                          <ul className="list-disc ml-6 space-y-1">
                            <li>Carrier Corporation</li>
                            <li>Johnson Controls (York)</li>
                            <li>Daikin Applied</li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-neutral-800">2.2 CHILLER ASSEMBLY</h3>
                        <div className="mt-2 space-y-2 text-neutral-700">
                          <p>A. Factory-assembled, single-piece water chiller.</p>
                          <p>B. Compressor: Hermetic centrifugal, direct-drive with VFD.</p>
                          <p>C. Refrigerant: R-134a or R-1233zd(E) low-GWP option.</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-neutral-200 text-xs text-neutral-400 text-center">
                  Downtown Medical Center HVAC Renovation - Specification Document Rev 2.1
                </div>
              </div>
            </div>
          </div>

          {/* Citations Sidebar */}
          {citations.length > 0 && (
            <div className="w-72 bg-white border-l border-neutral-200 flex flex-col">
              <div className="p-3 border-b border-neutral-200 bg-neutral-50">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Quote className="h-4 w-4" />
                  Citations ({citations.length})
                </h3>
              </div>
              <div className="flex-1 overflow-auto p-3 space-y-2">
                {citations.map((citation, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(citation.pageNumber)}
                    className={cn(
                      'w-full text-left p-2.5 rounded-lg border text-xs transition-colors',
                      citation.pageNumber === currentPage
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge
                        variant={
                          citation.status === 'match'
                            ? 'success'
                            : citation.status === 'issue'
                            ? 'warning'
                            : 'error'
                        }
                        size="sm"
                      >
                        {citation.status === 'match' ? 'Match' : citation.status === 'issue' ? 'Issue' : 'Discrepancy'}
                      </Badge>
                      <span className="text-neutral-400">Page {citation.pageNumber}</span>
                    </div>
                    <p className="text-neutral-600 line-clamp-2">{citation.text}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConformanceResult, Evidence, OverallStatus } from '@/lib/types';
import { ConfidenceScoreBar } from '@/components/common/ConfidenceScore';
import { StatusPill } from '@/components/conformance/StatusPill';
import { CommentsPanel, ItemComment } from '@/components/conformance/CommentsPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ItemDetailsPaneProps {
  item: ConformanceResult | null;
  onApproveDiscrepancy: (item: ConformanceResult) => void;
  onViewPdf: (pageNumber: number, item: ConformanceResult) => void;
  onStatusChange?: (itemId: string, newStatus: OverallStatus, previousStatus: OverallStatus) => void;
  comments?: ItemComment[];
  onAddComment?: (itemId: string, text: string, parentId?: string, mentions?: string[]) => void;
  currentUserId?: string;
  currentUserName?: string;
}

const statusIcons = {
  'Match': <CheckCircle2 className="h-4 w-4 text-success" />,
  'Potential Issue': <AlertTriangle className="h-4 w-4 text-warning" />,
  'Discrepancy': <XCircle className="h-4 w-4 text-error" />,
};

export function ItemDetailsPane({
  item,
  onApproveDiscrepancy,
  onViewPdf,
  onStatusChange,
  comments = [],
  onAddComment,
  currentUserId = 'unknown',
  currentUserName = 'Unknown User',
}: ItemDetailsPaneProps) {
  if (!item) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Select an item to view details</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: OverallStatus, previousStatus: OverallStatus) => {
    if (onStatusChange) {
      onStatusChange(item.id, newStatus, previousStatus);
    }
  };

  const handleAddComment = (text: string, parentId?: string, mentions?: string[]) => {
    if (onAddComment) {
      onAddComment(item.id, text, parentId, mentions);
    }
  };

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 bg-white overflow-visible relative z-20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-neutral-900 leading-tight">
                {item.materialDescription}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline">{item.specSection}</Badge>
                <Badge variant="neutral">{item.systemType}</Badge>
              </div>
            </div>

            {/* Status Pill - Right Side */}
            <StatusPill
              status={item.overallStatus}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>

        {/* Content tabs */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="project-spec" className="h-full">
            <div className="px-4 py-3 border-b border-neutral-200 bg-white sticky top-0 z-10">
              <TabsList>
                <TabsTrigger value="project-spec">Spec Evidence</TabsTrigger>
                <TabsTrigger value="material-index">Material Index</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="project-spec" className="p-5 mt-0">
              <EvidenceSection
                evidence={item.projectSpecEvidence}
                onViewPdf={(page) => onViewPdf(page, item)}
                confidenceScore={item.confidenceScore}
              />
            </TabsContent>

            <TabsContent value="material-index" className="p-5 mt-0">
              <EvidenceSection
                evidence={item.materialIndexEvidence}
                onViewPdf={(page) => onViewPdf(page, item)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Comments Panel - Right Side */}
      <div className="w-[320px] border-l border-neutral-200 hidden lg:flex flex-col">
        <CommentsPanel
          comments={comments}
          onAddComment={handleAddComment}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentStatus={item.overallStatus}
          className="h-full"
        />
      </div>
    </div>
  );
}

interface EvidenceSectionProps {
  evidence: Evidence[];
  onViewPdf: (pageNumber: number) => void;
  confidenceScore?: number;
}

function EvidenceSection({ evidence, onViewPdf, confidenceScore }: EvidenceSectionProps) {
  return (
    <div className="space-y-4">
      {confidenceScore !== undefined && (
        <ConfidenceScoreBar score={confidenceScore} className="mb-4" />
      )}

      {evidence.map((ev, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {statusIcons[ev.status]}
              <CardTitle className="text-sm font-medium">
                {ev.status === 'Match' ? 'Matches Specification' : ev.status === 'Potential Issue' ? 'Potential Issue Found' : 'Discrepancy Detected'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* AI explanation */}
            <div className="p-3 bg-accent-50 rounded-md border border-accent-100">
              <p className="text-sm text-accent-700">
                <strong>AI Analysis:</strong> {ev.explanation}
              </p>
            </div>

            {/* Evidence chunks */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Relevant Specification Text
              </p>
              {ev.chunks.map((chunk, i) => (
                <blockquote
                  key={i}
                  className="pl-3 border-l-2 border-neutral-200 text-sm text-neutral-600 italic"
                >
                  "{chunk}"
                </blockquote>
              ))}
            </div>

            {/* Page references */}
            {ev.pageReferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-neutral-500">Page references:</span>
                {ev.pageReferences.map((page) => (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    onClick={() => onViewPdf(page)}
                    className="h-6 text-xs"
                  >
                    Page {page}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


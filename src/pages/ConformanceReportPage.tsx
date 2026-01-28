import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, PanelLeftClose, PanelLeft, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubmittalItemsList } from '@/components/conformance/SubmittalItemsList';
import { ItemDetailsPane } from '@/components/conformance/ItemDetailsPane';
import { FilterPanel } from '@/components/conformance/FilterPanel';
import { ExportMenu } from '@/components/conformance/ExportMenu';
import { BatchActionsBar } from '@/components/conformance/BatchActionsBar';
import { ApproveDiscrepancyModal } from '@/components/conformance/ApproveDiscrepancyModal';
import { PDFPreviewModal } from '@/components/conformance/PDFPreviewModal';
import { AssignReviewerModal } from '@/components/conformance/AssignReviewerModal';
import { ItemComment } from '@/components/conformance/CommentsPanel';
import { ConformanceResult, ConformanceFilters, OverallStatus, ReviewActionType } from '@/lib/types';
import { mockProjects } from '@/lib/mockData';

export function ConformanceReportPage() {
  const { projectId, runId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success } = useToast();

  // Find project and conformance run
  const project = mockProjects.find((p) => p.id === projectId);
  const conformanceRun = project?.conformanceRuns.find((r) => r.id === runId);

  // State
  const [results, setResults] = useState<ConformanceResult[]>(conformanceRun?.results || []);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [filters, setFilters] = useState<ConformanceFilters>({
    status: [],
    division: '',
    systemType: '',
    searchQuery: '',
  });

  // Item comments state - keyed by item ID
  const [itemComments, setItemComments] = useState<Record<string, ItemComment[]>>({});

  // Assigned reviewers state (project level)
  const [assignedReviewers, setAssignedReviewers] = useState<Array<{ id: string; name: string; avatarUrl?: string; assignedAt: Date }>>([]);

  // Modals
  const [approveItem, setApproveItem] = useState<ConformanceResult | null>(null);
  const [batchApproveOpen, setBatchApproveOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfPageNumber, setPdfPageNumber] = useState(1);
  const [pdfItem, setPdfItem] = useState<ConformanceResult | null>(null);

  // Reviewer modals
  const [assignReviewerOpen, setAssignReviewerOpen] = useState(false);

  // Filter results
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(item.overallStatus)) {
        return false;
      }

      // Division filter
      if (filters.division && filters.division !== 'all' && item.division !== filters.division) {
        return false;
      }

      // System type filter
      if (filters.systemType && filters.systemType !== 'all' && item.systemType !== filters.systemType) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          item.materialDescription.toLowerCase().includes(query) ||
          item.specSection.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [results, filters]);

  // Summary counts
  const summaryCounts = useMemo(() => {
    return {
      preApproved: results.filter((r) => r.overallStatus === 'Pre-Approved').length,
      reviewRequired: results.filter((r) => r.overallStatus === 'Review Required').length,
      actionMandatory: results.filter((r) => r.overallStatus === 'Action Mandatory').length,
    };
  }, [results]);

  // Selected item
  const selectedItem = selectedItemId ? results.find((r) => r.id === selectedItemId) || null : null;

  // Get comments for selected item
  const selectedItemComments = selectedItemId ? itemComments[selectedItemId] || [] : [];

  // Handlers
  const handleSelectItem = (item: ConformanceResult) => {
    setSelectedItemId(item.id);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredResults.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredResults.map((r) => r.id)));
    }
  };

  const handleApproveDiscrepancy = (itemId: string, reason: string, comment: string) => {
    setResults((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              discrepancy: {
                approved: true,
                reason,
                comment,
                approvedBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
                approvedAt: new Date(),
              },
            }
          : item
      )
    );
    success('Discrepancy approved successfully');
  };

  const handleBatchApprove = (_: string, reason: string, comment: string) => {
    setResults((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id) && (item.overallStatus === 'Review Required' || item.overallStatus === 'Action Mandatory')
          ? {
              ...item,
              discrepancy: {
                approved: true,
                reason,
                comment,
                approvedBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
                approvedAt: new Date(),
              },
            }
          : item
      )
    );
    setSelectedIds(new Set());
    success(`${selectedIds.size} discrepancies approved successfully`);
  };

  const handleViewPdf = (pageNumber: number, item: ConformanceResult) => {
    setPdfPageNumber(pageNumber);
    setPdfItem(item);
    setPdfPreviewOpen(true);
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // In production, this would generate and download the actual file
  };

  // Assign reviewer handler (project level with multi-select)
  const handleAssignReviewers = (reviewers: Array<{ id: string; name: string; avatarUrl?: string }>) => {
    const newReviewers = reviewers
      .filter((r) => !assignedReviewers.some((ar) => ar.id === r.id))
      .map((r) => ({
        id: r.id,
        name: r.name,
        avatarUrl: r.avatarUrl,
        assignedAt: new Date(),
      }));

    if (newReviewers.length > 0) {
      setAssignedReviewers((prev) => [...prev, ...newReviewers]);
      const names = newReviewers.map((r) => r.name).join(', ');
      success(`Assigned reviewer${newReviewers.length > 1 ? 's' : ''}: ${names}`);
    }
  };

  // Remove reviewer handler
  const handleRemoveReviewer = (reviewerId: string) => {
    const reviewer = assignedReviewers.find(r => r.id === reviewerId);
    setAssignedReviewers((prev) => prev.filter(r => r.id !== reviewerId));
    if (reviewer) {
      success(`Removed ${reviewer.name} from reviewers`);
    }
  };

  // Status change handler with system comment
  const handleStatusChange = (itemId: string, newStatus: OverallStatus, previousStatus: OverallStatus) => {
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';

    // Update the item status
    setResults((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              overallStatus: newStatus,
              reviewHistory: [
                ...(item.reviewHistory || []),
                {
                  id: `history-${Date.now()}`,
                  action: 'reviewed' as ReviewActionType,
                  comment: `Status changed from ${previousStatus} to ${newStatus}`,
                  userId: user?.id || 'unknown',
                  userName,
                  timestamp: new Date(),
                },
              ],
            }
          : item
      )
    );

    // Add system comment for status change
    const systemComment: ItemComment = {
      id: `comment-${Date.now()}`,
      text: `Status changed from ${previousStatus} to ${newStatus}`,
      authorId: 'system',
      authorName: 'System',
      timestamp: new Date(),
      statusAtTime: newStatus,
      isSystemComment: true,
    };

    setItemComments((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), systemComment],
    }));

    success(`Status updated to ${newStatus}`);
  };

  // Add comment handler
  const handleAddComment = (itemId: string, text: string, parentId?: string, mentions?: string[]) => {
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
    const currentItem = results.find((r) => r.id === itemId);

    const newComment: ItemComment = {
      id: `comment-${Date.now()}`,
      text,
      authorId: user?.id || 'unknown',
      authorName: userName,
      timestamp: new Date(),
      statusAtTime: currentItem?.overallStatus,
      parentId,
      mentions,
    };

    setItemComments((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), newComment],
    }));

    // Also add to review history
    setResults((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              reviewHistory: [
                ...(item.reviewHistory || []),
                {
                  id: `history-${Date.now()}`,
                  action: 'comment' as ReviewActionType,
                  comment: text,
                  userId: user?.id || 'unknown',
                  userName,
                  timestamp: new Date(),
                },
              ],
            }
          : item
      )
    );
  };

  // Build citations for PDF preview
  const buildCitations = (item: ConformanceResult | null) => {
    if (!item) return [];

    const citations: Array<{
      text: string;
      pageNumber: number;
      source: 'spec' | 'material';
      status: 'match' | 'issue' | 'discrepancy';
    }> = [];

    item.projectSpecEvidence.forEach((ev) => {
      ev.chunks.forEach((chunk, i) => {
        citations.push({
          text: chunk,
          pageNumber: ev.pageReferences[i] || ev.pageReferences[0] || 1,
          source: 'spec',
          status: ev.status === 'Match' ? 'match' : ev.status === 'Potential Issue' ? 'issue' : 'discrepancy',
        });
      });
    });

    item.materialIndexEvidence.forEach((ev) => {
      ev.chunks.forEach((chunk, i) => {
        citations.push({
          text: chunk,
          pageNumber: ev.pageReferences[i] || ev.pageReferences[0] || 1,
          source: 'material',
          status: ev.status === 'Match' ? 'match' : ev.status === 'Potential Issue' ? 'issue' : 'discrepancy',
        });
      });
    });

    return citations;
  };

  if (!project || !conformanceRun) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-neutral-900">Conformance run not found</h2>
        <p className="text-neutral-500 mt-2">The conformance run you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          Back to Projects
        </Button>
      </div>
    );
  }

  // Count items needing review for batch approval
  const batchApproveCount = Array.from(selectedIds).filter((id) => {
    const item = results.find((r) => r.id === id);
    return item && (item.overallStatus === 'Review Required' || item.overallStatus === 'Action Mandatory') && !item.discrepancy?.approved;
  }).length;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-6">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-6 py-4">
        {/* Title and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Conformance Results</h1>
              <p className="text-sm text-neutral-500">
                {project.jobId} · Version {conformanceRun.version}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Summary badges */}
            <div className="hidden lg:flex items-center gap-2">
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {summaryCounts.preApproved} Pre-Approved
              </Badge>
              <Badge variant="warning" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {summaryCounts.reviewRequired} Review Required
              </Badge>
              <Badge variant="error" className="gap-1">
                <XCircle className="h-3 w-3" />
                {summaryCounts.actionMandatory} Action Mandatory
              </Badge>
            </div>

            {/* Assigned Reviewers - ClickUp Style */}
            <div className="flex items-center">
              <div className="flex items-center -space-x-2">
                {assignedReviewers.map((reviewer) => (
                  reviewer.avatarUrl ? (
                    <img
                      key={reviewer.id}
                      src={reviewer.avatarUrl}
                      alt={reviewer.name}
                      className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm cursor-pointer hover:scale-110 hover:z-10 transition-transform"
                      title={reviewer.name}
                      onClick={() => setAssignReviewerOpen(true)}
                    />
                  ) : (
                    <div
                      key={reviewer.id}
                      className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white flex items-center justify-center text-xs font-semibold text-white shadow-sm cursor-pointer hover:scale-110 hover:z-10 transition-transform"
                      title={reviewer.name}
                      onClick={() => setAssignReviewerOpen(true)}
                    >
                      {reviewer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )
                ))}
                {/* Add Reviewer Button - Always visible */}
                <button
                  onClick={() => setAssignReviewerOpen(true)}
                  className="h-8 w-8 rounded-full border-2 border-dashed border-neutral-300 bg-white flex items-center justify-center text-neutral-400 hover:border-primary hover:text-primary hover:bg-primary-50 transition-colors"
                  title="Add reviewer"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <ExportMenu onExport={handleExport} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - items list with filters */}
        <div
          className={cn(
            'flex flex-col border-r border-neutral-200 bg-white transition-all duration-300',
            leftPanelCollapsed ? 'w-0 overflow-hidden' : 'w-full lg:w-[380px]'
          )}
        >
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
          <div className="flex-1 overflow-hidden">
            <SubmittalItemsList
              items={filteredResults}
              selectedItemId={selectedItemId}
              onSelectItem={handleSelectItem}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
            />
          </div>
        </div>

        {/* Center + Right panel - details with comments */}
        <div className="flex-1 flex flex-col bg-neutral-50 min-w-0">
          {/* Panel toggle for mobile */}
          <div className="lg:hidden flex-shrink-0 p-2 border-b border-neutral-200 bg-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            >
              {leftPanelCollapsed ? (
                <>
                  <PanelLeft className="h-4 w-4 mr-2" />
                  Show Items
                </>
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 mr-2" />
                  Hide Items
                </>
              )}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <ItemDetailsPane
              item={selectedItem}
              onApproveDiscrepancy={setApproveItem}
              onViewPdf={handleViewPdf}
              onStatusChange={handleStatusChange}
              comments={selectedItemComments}
              onAddComment={handleAddComment}
              currentUserId={user?.id}
              currentUserName={user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
            />
          </div>
        </div>
      </div>

      {/* Batch actions bar */}
      <BatchActionsBar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onApproveSelected={() => batchApproveCount > 0 && setBatchApproveOpen(true)}
        onAssignReviewer={() => setAssignReviewerOpen(true)}
      />

      {/* Modals */}
      <ApproveDiscrepancyModal
        item={approveItem}
        open={!!approveItem}
        onClose={() => setApproveItem(null)}
        onSubmit={handleApproveDiscrepancy}
      />

      <ApproveDiscrepancyModal
        item={null}
        open={batchApproveOpen}
        onClose={() => setBatchApproveOpen(false)}
        onSubmit={handleBatchApprove}
        batchMode
        batchCount={batchApproveCount}
      />

      <PDFPreviewModal
        open={pdfPreviewOpen}
        onClose={() => {
          setPdfPreviewOpen(false);
          setPdfItem(null);
        }}
        pageNumber={pdfPageNumber}
        citations={buildCitations(pdfItem)}
        materialDescription={pdfItem?.materialDescription}
      />

      {/* Assign reviewer modal with multi-select */}
      <AssignReviewerModal
        open={assignReviewerOpen}
        onClose={() => setAssignReviewerOpen(false)}
        onAssign={handleAssignReviewers}
        currentReviewers={assignedReviewers}
        onRemoveReviewer={handleRemoveReviewer}
      />
    </div>
  );
}

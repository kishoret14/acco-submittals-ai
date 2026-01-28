// User Types
export type UserRole = 'Admin' | 'User';
export type UserStatus = 'Active' | 'Pending' | 'Inactive';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  assignedProjects: string[];
  lastLogin?: Date;
  createdAt: Date;
  avatarUrl?: string;
}

// Project Types
export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed';
export type ConformanceJobStatus = 'Uploading' | 'Processing' | 'Ready for Review' | 'Completed';

export interface Project {
  id: string;
  name: string;
  jobId: string;
  location: string;
  status: ProjectStatus;
  conformanceStatus?: ConformanceJobStatus;
  assignedUsers: User[];
  conformanceRuns: ConformanceRun[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Conformance Types
export type OverallStatus = 'Pre-Approved' | 'Review Required' | 'Action Mandatory';
export type EvidenceStatus = 'Match' | 'Potential Issue' | 'Discrepancy';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadProgress: number;
  status: 'uploading' | 'complete' | 'error';
}

export interface Evidence {
  status: EvidenceStatus;
  chunks: string[];
  pageReferences: number[];
  explanation: string;
}

export interface Discrepancy {
  approved: boolean;
  reason?: string;
  comment?: string;
  approvedBy?: string;
  approvedAt?: Date;
}

// Review Types
export type ReviewActionType = 'comment' | 'reviewed' | 'approved' | 'rejected' | 'assigned';

export interface ReviewHistoryEntry {
  id: string;
  action: ReviewActionType;
  comment?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
}

export interface ReviewAssignment {
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  assignedBy: string;
  assignedAt: Date;
  status: 'pending' | 'in-review' | 'completed';
}

export interface Citation {
  text: string;
  pageNumber: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface ConformanceResult {
  id: string;
  materialDescription: string;
  specSection: string;
  division: string;
  systemType: string;
  overallStatus: OverallStatus;
  confidenceScore: number;
  projectSpecEvidence: Evidence[];
  materialIndexEvidence: Evidence[];
  discrepancy?: Discrepancy;
  reviewAssignment?: ReviewAssignment;
  reviewHistory?: ReviewHistoryEntry[];
}

export interface ConformanceRun {
  id: string;
  projectId: string;
  version: number;
  status: ConformanceJobStatus;
  submittalFiles: UploadedFile[];
  specificationFiles: UploadedFile[];
  materialIndexVersion: string;
  results: ConformanceResult[];
  createdBy: string;
  createdAt: Date;
  processingProgress?: number;
}

// Material Index Types
export interface MaterialIndexVersion {
  id: string;
  versionNumber: string;
  name: string;
  isActive: boolean;
  files: UploadedFile[];
  uploadedBy: string;
  uploadedAt: Date;
  itemCount: number;
}

// Filter Types
export interface ConformanceFilters {
  status: OverallStatus[];
  division: string;
  systemType: string;
  searchQuery: string;
}

// Auth Context Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Toast/Notification Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

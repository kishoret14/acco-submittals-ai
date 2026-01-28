import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Play, Clock, MapPin, Users, FileCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { mockProjects } from '@/lib/mockData';
import { formatDate, formatRelativeTime, getInitials } from '@/lib/utils';

export function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const project = mockProjects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-neutral-900">Project not found</h2>
        <p className="text-neutral-500 mt-2">The project you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          Back to Projects
        </Button>
      </div>
    );
  }

  const latestRun = project.conformanceRuns.length > 0
    ? project.conformanceRuns[project.conformanceRuns.length - 1]
    : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-neutral-500">
        <Link to="/projects" className="hover:text-primary">
          Projects
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-neutral-900 font-medium truncate">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-neutral-900">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <span className="font-medium">{project.jobId}</span>
              {project.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {project.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Updated {formatRelativeTime(project.updatedAt)}
              </span>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/projects/${project.id}/conformance/new`)}>
          <Play className="mr-2 h-4 w-4" />
          Run Conformance Check
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest conformance run */}
          {latestRun ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Latest Conformance Check</CardTitle>
                  <StatusBadge status={latestRun.status} />
                </div>
                <CardDescription>
                  Version {latestRun.version} · {formatDate(latestRun.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestRun.status === 'Processing' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      <span className="text-sm text-neutral-600">Processing documents...</span>
                    </div>
                    <Progress value={latestRun.processingProgress || 0} className="h-2" />
                    <p className="text-xs text-neutral-400">{latestRun.processingProgress || 0}% complete</p>
                  </div>
                ) : latestRun.status === 'Ready for Review' && latestRun.results.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-success-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-success">
                          {latestRun.results.filter((r) => r.overallStatus === 'Pre-Approved').length}
                        </p>
                        <p className="text-xs text-success-700">Pre-Approved</p>
                      </div>
                      <div className="p-3 bg-warning-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-warning">
                          {latestRun.results.filter((r) => r.overallStatus === 'Review Required').length}
                        </p>
                        <p className="text-xs text-warning-700">Review Required</p>
                      </div>
                      <div className="p-3 bg-error-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-error">
                          {latestRun.results.filter((r) => r.overallStatus === 'Action Mandatory').length}
                        </p>
                        <p className="text-xs text-error-700">Action Mandatory</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/projects/${project.id}/conformance/${latestRun.id}`)}
                    >
                      <FileCheck className="mr-2 h-4 w-4" />
                      View Full Report
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No results available yet.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <EmptyState
                  icon={<FileCheck className="h-8 w-8" />}
                  title="No conformance checks yet"
                  description="Run your first conformance check to validate submittals against specifications"
                  action={{
                    label: 'Run Conformance Check',
                    onClick: () => navigate(`/projects/${project.id}/conformance/new`),
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Conformance history */}
          {project.conformanceRuns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conformance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.conformanceRuns.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                      onClick={() => {
                        if (run.status === 'Ready for Review') {
                          navigate(`/projects/${project.id}/conformance/${run.id}`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-neutral-100 rounded">
                          <FileCheck className="h-4 w-4 text-neutral-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Version {run.version}</p>
                          <p className="text-xs text-neutral-500">{formatDate(run.createdAt)}</p>
                        </div>
                      </div>
                      <StatusBadge status={run.status} size="sm" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Team Members</CardTitle>
                <Users className="h-4 w-4 text-neutral-400" />
              </div>
            </CardHeader>
            <CardContent>
              {project.assignedUsers.length === 0 ? (
                <p className="text-sm text-neutral-500">No team members assigned</p>
              ) : (
                <div className="space-y-3">
                  {project.assignedUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-neutral-500">{user.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Job ID</p>
                <p className="text-sm font-medium text-neutral-900">{project.jobId}</p>
              </div>
              {project.location && (
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Location</p>
                  <p className="text-sm font-medium text-neutral-900">{project.location}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Status</p>
                <StatusBadge status={project.status} className="mt-1" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Created</p>
                <p className="text-sm font-medium text-neutral-900">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Last Updated</p>
                <p className="text-sm font-medium text-neutral-900">{formatRelativeTime(project.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

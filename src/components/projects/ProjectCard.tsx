import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, MoreVertical, Play, Eye, Settings, UserPlus } from 'lucide-react';
import { Project } from '@/lib/types';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onManageAccess?: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onManageAccess }: ProjectCardProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const hasConformanceRun = project.conformanceRuns.length > 0;
  const latestRun = hasConformanceRun ? project.conformanceRuns[project.conformanceRuns.length - 1] : null;

  const handleViewProject = () => {
    if (latestRun?.status === 'Ready for Review') {
      navigate(`/projects/${project.id}/conformance/${latestRun.id}`);
    } else if (latestRun?.status === 'Processing') {
      // Show processing status
      navigate(`/projects/${project.id}`);
    } else {
      navigate(`/projects/${project.id}`);
    }
  };

  const handleRunConformance = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/${project.id}/conformance/new`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-card-hover transition-shadow"
      onClick={handleViewProject}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900 truncate">{project.name}</h3>
            <p className="text-sm text-neutral-500">{project.jobId}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon-sm" aria-label="Project options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewProject(); }}>
                <Eye className="mr-2 h-4 w-4" />
                View Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRunConformance}>
                <Play className="mr-2 h-4 w-4" />
                Run Conformance
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(project); }}>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onManageAccess?.(project); }}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Manage Access
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={project.status} />
          {project.conformanceStatus && (
            <StatusBadge status={project.conformanceStatus} />
          )}
        </div>

        {/* Location and date */}
        <div className="space-y-2 mb-4">
          {project.location && (
            <div className="flex items-center text-sm text-neutral-500">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{project.location}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-neutral-500">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Updated {formatRelativeTime(project.updatedAt)}</span>
          </div>
        </div>

        {/* Footer: Assigned users */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex items-center">
            <Users className="h-4 w-4 text-neutral-400 mr-2" />
            <div className="flex -space-x-2">
              {project.assignedUsers.slice(0, 3).map((user) => (
                <Avatar key={user.id} className="h-6 w-6 border-2 border-white">
                  <AvatarFallback className="text-[10px] bg-primary-100 text-primary-700">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.assignedUsers.length > 3 && (
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-neutral-100 border-2 border-white text-[10px] font-medium text-neutral-600">
                  +{project.assignedUsers.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Conformance run count */}
          {project.conformanceRuns.length > 0 && (
            <span className="text-xs text-neutral-400">
              {project.conformanceRuns.length} run{project.conformanceRuns.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

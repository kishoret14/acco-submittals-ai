import React, { useState, useMemo } from 'react';
import { Plus, FolderOpen, Search, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { NewProjectModal } from '@/components/projects/NewProjectModal';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { ManageAccessModal } from '@/components/projects/ManageAccessModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Project, ProjectStatus } from '@/lib/types';
import { mockProjects, mockUsers } from '@/lib/mockData';
import { generateId } from '@/lib/utils';

export function ProjectsPage() {
  const { user, isAdmin } = useAuth();
  const { success } = useToast();

  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [manageAccessProject, setManageAccessProject] = useState<Project | null>(null);

  // Filter projects based on user role and search/status filters
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Non-admin users only see their assigned projects
    if (!isAdmin && user) {
      result = result.filter((p) => p.assignedUsers.some((u) => u.id === user.id));
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.jobId.toLowerCase().includes(query) ||
          p.location?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    return result;
  }, [projects, isAdmin, user, searchQuery, statusFilter]);

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'assignedUsers' | 'conformanceRuns' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const newProject: Project = {
      ...projectData,
      id: generateId(),
      assignedUsers: user ? [user] : [],
      conformanceRuns: [],
      createdBy: user?.id || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProjects((prev) => [newProject, ...prev]);
    success('Project created successfully');
  };

  const handleEditProject = (projectId: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, ...updates, updatedAt: new Date() }
          : p
      )
    );
    success('Project updated successfully');
  };

  const handleUpdateAccess = (projectId: string, userIds: string[]) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const assignedUsers = mockUsers.filter((u) => userIds.includes(u.id));
        return { ...p, assignedUsers, updatedAt: new Date() };
      })
    );
    success('Project access updated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Projects</h1>
          <p className="text-neutral-500 mt-1">
            {isAdmin
              ? 'Manage all projects and conformance checks'
              : 'View your assigned projects and conformance checks'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setNewProjectOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Planning">Planning</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-8 w-8" />}
          title={searchQuery || statusFilter !== 'all' ? 'No projects match your filters' : 'No projects yet'}
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : isAdmin
              ? 'Create your first project to start running conformance checks'
              : 'Contact your administrator to get access to projects'
          }
          action={
            isAdmin && !searchQuery && statusFilter === 'all'
              ? {
                  label: 'Create Project',
                  onClick: () => setNewProjectOpen(true),
                }
              : searchQuery || statusFilter !== 'all'
              ? {
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  },
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={setEditProject}
              onManageAccess={setManageAccessProject}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onSubmit={handleCreateProject}
      />

      <EditProjectModal
        project={editProject}
        open={!!editProject}
        onClose={() => setEditProject(null)}
        onSubmit={handleEditProject}
      />

      <ManageAccessModal
        project={manageAccessProject}
        open={!!manageAccessProject}
        onClose={() => setManageAccessProject(null)}
        onSubmit={handleUpdateAccess}
      />
    </div>
  );
}

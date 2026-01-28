import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project, ProjectStatus } from '@/lib/types';

interface EditProjectModalProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (projectId: string, updates: Partial<Project>) => void;
}

const statusOptions: ProjectStatus[] = ['Planning', 'Active', 'On Hold', 'Completed'];

export function EditProjectModal({ project, open, onClose, onSubmit }: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [jobId, setJobId] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Planning');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setJobId(project.jobId);
      setLocation(project.location || '');
      setStatus(project.status);
    }
  }, [project]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!jobId.trim()) {
      newErrors.jobId = 'Job ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project || !validate()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSubmit(project.id, {
      name: name.trim(),
      jobId: jobId.trim(),
      location: location.trim(),
      status,
    });

    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="edit-name" className="text-sm font-medium text-neutral-900">
              Project Name <span className="text-error">*</span>
            </label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-error">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-jobId" className="text-sm font-medium text-neutral-900">
              Job ID <span className="text-error">*</span>
            </label>
            <Input
              id="edit-jobId"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="Job ID"
              error={!!errors.jobId}
            />
            {errors.jobId && (
              <p className="text-xs text-error">{errors.jobId}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-location" className="text-sm font-medium text-neutral-900">
              Location
            </label>
            <Input
              id="edit-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-status" className="text-sm font-medium text-neutral-900">
              Status
            </label>
            <Select value={status} onValueChange={(val) => setStatus(val as ProjectStatus)}>
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

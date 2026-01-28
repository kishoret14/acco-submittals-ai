import React, { useState } from 'react';
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
import { generateId } from '@/lib/utils';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id' | 'assignedUsers' | 'conformanceRuns' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

const statusOptions: ProjectStatus[] = ['Planning', 'Active', 'On Hold', 'Completed'];

export function NewProjectModal({ open, onClose, onSubmit }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [jobId, setJobId] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Planning');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSubmit({
      name: name.trim(),
      jobId: jobId.trim(),
      location: location.trim(),
      status,
    });

    // Reset form
    setName('');
    setJobId('');
    setLocation('');
    setStatus('Planning');
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setName('');
    setJobId('');
    setLocation('');
    setStatus('Planning');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to start running conformance checks on submittals.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-neutral-900">
              Project Name <span className="text-error">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Downtown Medical Center HVAC Renovation"
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-error">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="jobId" className="text-sm font-medium text-neutral-900">
              Job ID <span className="text-error">*</span>
            </label>
            <Input
              id="jobId"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="DMC-2024-001"
              error={!!errors.jobId}
            />
            {errors.jobId && (
              <p className="text-xs text-error">{errors.jobId}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-neutral-900">
              Location
            </label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Los Angeles, CA"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-neutral-900">
              Status
            </label>
            <Select value={status} onValueChange={(val) => setStatus(val as ProjectStatus)}>
              <SelectTrigger id="status">
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
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Project, User } from '@/lib/types';
import { getInitials } from '@/lib/utils';
import { mockUsers } from '@/lib/mockData';

interface ManageAccessModalProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (projectId: string, userIds: string[]) => void;
}

export function ManageAccessModal({ project, open, onClose, onSubmit }: ManageAccessModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get all active users (non-admin roles can also be assigned)
  const availableUsers = mockUsers.filter((u) => u.status === 'Active');

  useEffect(() => {
    if (project) {
      setSelectedUserIds(new Set(project.assignedUsers.map((u) => u.id)));
    }
  }, [project]);

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!project) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSubmit(project.id, Array.from(selectedUserIds));
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Project Access</DialogTitle>
          <DialogDescription>
            Select users who should have access to <strong>{project?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* User list */}
          <div className="max-h-[300px] overflow-y-auto border border-neutral-200 rounded-lg">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-b-0"
                >
                  <Checkbox
                    checked={selectedUserIds.has(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  </div>
                  <Badge variant={user.role === 'Admin' ? 'default' : 'neutral'} size="sm">
                    {user.role}
                  </Badge>
                </label>
              ))
            )}
          </div>

          {/* Selected count */}
          <p className="mt-3 text-sm text-neutral-500">
            {selectedUserIds.size} user{selectedUserIds.size !== 1 ? 's' : ''} selected
          </p>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            <UserPlus className="mr-2 h-4 w-4" />
            Update Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useMemo } from 'react';
import { UserPlus, Search, MoreVertical, Mail, Shield, User as UserIcon, Clock, FolderKanban } from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/common/EmptyState';
import { User, UserRole, UserStatus } from '@/lib/types';
import { mockUsers } from '@/lib/mockData';
import { getInitials, formatRelativeTime, generateId } from '@/lib/utils';

export function UsersPage() {
  const { success } = useToast();

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('User');
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});
  const [isInviting, setIsInviting] = useState(false);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;

      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const validateInvite = (): boolean => {
    const errors: Record<string, string> = {};

    if (!inviteEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      errors.email = 'Invalid email format';
    } else if (users.some((u) => u.email.toLowerCase() === inviteEmail.toLowerCase())) {
      errors.email = 'A user with this email already exists';
    }

    setInviteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInvite = async () => {
    if (!validateInvite()) return;

    setIsInviting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser: User = {
      id: generateId(),
      email: inviteEmail.trim(),
      firstName: inviteFirstName.trim() || 'New',
      lastName: inviteLastName.trim() || 'User',
      role: inviteRole,
      status: 'Pending',
      assignedProjects: [],
      createdAt: new Date(),
    };

    setUsers((prev) => [...prev, newUser]);

    // Reset form
    setInviteEmail('');
    setInviteFirstName('');
    setInviteLastName('');
    setInviteRole('User');
    setInviteErrors({});
    setIsInviting(false);
    setInviteModalOpen(false);

    success(`Invitation sent to ${newUser.email}`);
  };

  const handleUpdateRole = (userId: string, role: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    success('User role updated');
  };

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const newStatus: UserStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        return { ...u, status: newStatus };
      })
    );
    success('User status updated');
  };

  const closeInviteModal = () => {
    setInviteEmail('');
    setInviteFirstName('');
    setInviteLastName('');
    setInviteRole('User');
    setInviteErrors({});
    setInviteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
          <p className="text-neutral-500 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setInviteModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="User">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users table */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<UserIcon className="h-8 w-8" />}
          title={searchQuery || roleFilter !== 'all' || statusFilter !== 'all' ? 'No users match your filters' : 'No users yet'}
          description={
            searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Invite your first team member to get started'
          }
          action={
            searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
              ? {
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchQuery('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  },
                }
              : {
                  label: 'Invite User',
                  onClick: () => setInviteModalOpen(true),
                }
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-3">
                    User
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-3">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-3">
                    Projects
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-3">
                    Last Login
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-sm bg-primary-100 text-primary-700">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-neutral-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'Admin' ? 'default' : 'neutral'}>
                        {user.role === 'Admin' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          user.status === 'Active'
                            ? 'success'
                            : user.status === 'Pending'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <FolderKanban className="h-4 w-4" />
                        <span>{user.assignedProjects.length}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <Clock className="h-4 w-4" />
                        <span>{user.lastLogin ? formatRelativeTime(user.lastLogin) : 'Never'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditUser(user)}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(user.id, user.role === 'Admin' ? 'User' : 'Admin')}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {user.role === 'Admin' ? 'Remove Admin' : 'Make Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(user.id)}
                            className={user.status === 'Active' ? 'text-error focus:text-error' : ''}
                          >
                            {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite user modal */}
      <Dialog open={inviteModalOpen} onOpenChange={closeInviteModal}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation email to add a new team member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="invite-email" className="text-sm font-medium text-neutral-900">
                Email <span className="text-error">*</span>
              </label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@acco.com"
                error={!!inviteErrors.email}
                icon={<Mail className="h-4 w-4" />}
              />
              {inviteErrors.email && (
                <p className="text-xs text-error">{inviteErrors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="invite-first" className="text-sm font-medium text-neutral-900">
                  First Name
                </label>
                <Input
                  id="invite-first"
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="invite-last" className="text-sm font-medium text-neutral-900">
                  Last Name
                </label>
                <Input
                  id="invite-last"
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="invite-role" className="text-sm font-medium text-neutral-900">
                Role
              </label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                {inviteRole === 'Admin'
                  ? 'Admins can manage projects, users, and the Material Index'
                  : 'Users can view assigned projects and run conformance checks'}
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={closeInviteModal} disabled={isInviting}>
              Cancel
            </Button>
            <Button onClick={handleInvite} loading={isInviting}>
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit user modal */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions.
            </DialogDescription>
          </DialogHeader>

          {editUser && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    {getInitials(editUser.firstName, editUser.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-neutral-900">
                    {editUser.firstName} {editUser.lastName}
                  </p>
                  <p className="text-sm text-neutral-500">{editUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900">Role</label>
                <Select
                  value={editUser.role}
                  onValueChange={(v) => {
                    handleUpdateRole(editUser.id, v as UserRole);
                    setEditUser({ ...editUser, role: v as UserRole });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900">Status</label>
                <Select
                  value={editUser.status}
                  onValueChange={(v) => {
                    setUsers((prev) =>
                      prev.map((u) => (u.id === editUser.id ? { ...u, status: v as UserStatus } : u))
                    );
                    setEditUser({ ...editUser, status: v as UserStatus });
                    success('User status updated');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <p className="text-sm text-neutral-500">
                  <strong>Assigned Projects:</strong> {editUser.assignedProjects.length}
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  <strong>Member since:</strong> {editUser.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

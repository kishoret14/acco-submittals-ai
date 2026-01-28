import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, X, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import { mockUsers } from '@/lib/mockData';

interface AssignReviewerModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: (reviewers: Array<{ id: string; name: string; avatarUrl?: string }>) => void;
  currentReviewers?: Array<{ id: string; name: string; avatarUrl?: string; assignedAt?: Date }>;
  onRemoveReviewer?: (reviewerId: string) => void;
}

export function AssignReviewerModal({
  open,
  onClose,
  onAssign,
  currentReviewers = [],
  onRemoveReviewer,
}: AssignReviewerModalProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Array<{ id: string; name: string; avatarUrl?: string }>>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeUsers = mockUsers.filter((u) => u.status === 'Active');
  const currentReviewerIds = new Set(currentReviewers.map(r => r.id));
  const selectedIds = new Set(selectedUsers.map(u => u.id));

  // Filter users based on search and exclude already assigned/selected
  const availableUsers = activeUsers.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const notAlreadyAssigned = !currentReviewerIds.has(user.id);
    const notSelected = !selectedIds.has(user.id);
    return matchesSearch && notAlreadyAssigned && notSelected;
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Close modal on escape
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const handleSelectUser = (user: User) => {
    setSelectedUsers((prev) => [...prev, {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      avatarUrl: user.avatarUrl
    }]);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleRemoveSelected = (userId: string) => {
    setSelectedUsers((prev) => prev.filter(u => u.id !== userId));
  };

  const handleAdd = () => {
    if (selectedUsers.length > 0) {
      onAssign(selectedUsers);
      setSelectedUsers([]);
      setSearchQuery('');
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchQuery('');
    setIsDropdownOpen(false);
    onClose();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-[99999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Assign Reviewer
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Current Assigned Reviewers */}
          {currentReviewers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                Assigned Reviewers
              </p>
              <div className="flex flex-wrap gap-2">
                {currentReviewers.map((reviewer) => (
                  <div
                    key={reviewer.id}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 bg-emerald-50 border border-emerald-200 rounded-full"
                  >
                    {reviewer.avatarUrl ? (
                      <img
                        src={reviewer.avatarUrl}
                        alt={reviewer.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-medium text-white">
                        {getInitials(reviewer.name)}
                      </div>
                    )}
                    <span className="text-sm text-emerald-800">{reviewer.name}</span>
                    {onRemoveReviewer && (
                      <button
                        onClick={() => onRemoveReviewer(reviewer.id)}
                        className="p-0.5 rounded-full hover:bg-emerald-200 transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-emerald-600" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Select User Dropdown */}
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
              Add Reviewer
            </p>
            <div className="relative" ref={dropdownRef}>
              {/* Selected users tags + input */}
              <div
                className={cn(
                  'flex flex-wrap items-center gap-1.5 min-h-[44px] px-3 py-2 border rounded-lg bg-white cursor-text transition-all',
                  isDropdownOpen ? 'border-primary ring-2 ring-primary/20' : 'border-neutral-300 hover:border-neutral-400'
                )}
                onClick={() => {
                  setIsDropdownOpen(true);
                  inputRef.current?.focus();
                }}
              >
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded-md text-sm"
                  >
                    <span>{user.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSelected(user.id);
                      }}
                      className="p-0.5 rounded hover:bg-primary-200 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <div className="flex-1 flex items-center gap-2 min-w-[150px]">
                  <Search className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search team members..."
                    className="flex-1 text-sm bg-transparent outline-none placeholder:text-neutral-400"
                  />
                </div>
                <ChevronDown className={cn(
                  'h-4 w-4 text-neutral-400 transition-transform flex-shrink-0',
                  isDropdownOpen && 'rotate-180'
                )} />
              </div>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                  {availableUsers.length > 0 ? (
                    availableUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 text-left transition-colors"
                      >
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-neutral-500">{user.role}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-neutral-500">
                      {searchQuery ? 'No matching users found' : 'All team members are assigned'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-xl">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedUsers.length === 0}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add{selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ''}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FolderKanban, Database, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/projects', label: 'Projects', icon: FolderKanban, adminOnly: false },
  { path: '/material-index', label: 'Material Index', icon: Database, adminOnly: true },
  { path: '/users', label: 'Users', icon: Users, adminOnly: true },
];

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Navigation panel */}
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 22L16 10L24 22"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="16" cy="18" r="2" fill="white" />
              </svg>
            </div>
            <span className="font-semibold text-neutral-900">Menu</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
}

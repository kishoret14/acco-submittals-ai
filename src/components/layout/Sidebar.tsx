import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FolderKanban, Database, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/projects', label: 'Projects', icon: FolderKanban, adminOnly: false },
  { path: '/material-index', label: 'Material Index', icon: Database, adminOnly: true },
  { path: '/users', label: 'Users', icon: Users, adminOnly: true },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-neutral-200 transition-all duration-300 z-40',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <nav className="flex flex-col h-full py-4">
          <div className="flex-1 px-3 space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`);

              const linkContent = (
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.path} delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.path}>{linkContent}</div>;
            })}
          </div>

          <div className="px-3 mt-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className={cn('w-full', collapsed ? 'justify-center' : 'justify-start')}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </nav>
      </aside>
    </TooltipProvider>
  );
}

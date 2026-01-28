import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OverallStatus } from '@/lib/types';

interface StatusPillProps {
  status: OverallStatus;
  onStatusChange: (newStatus: OverallStatus, previousStatus: OverallStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

const statusConfig: Record<OverallStatus, {
  bg: string;
  hoverBg: string;
  text: string;
  ring: string;
}> = {
  'Pre-Approved': {
    bg: 'bg-emerald-500',
    hoverBg: 'hover:bg-emerald-600',
    text: 'text-white',
    ring: 'ring-emerald-500/30',
  },
  'Review Required': {
    bg: 'bg-amber-500',
    hoverBg: 'hover:bg-amber-600',
    text: 'text-white',
    ring: 'ring-amber-500/30',
  },
  'Action Mandatory': {
    bg: 'bg-red-500',
    hoverBg: 'hover:bg-red-600',
    text: 'text-white',
    ring: 'ring-red-500/30',
  },
};

const allStatuses: OverallStatus[] = ['Pre-Approved', 'Review Required', 'Action Mandatory'];

export function StatusPill({ status, onStatusChange, disabled = false, size = 'default' }: StatusPillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const config = statusConfig[status];

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 6,
        left: rect.right - 180, // Align to right edge of button
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current && !buttonRef.current.contains(target)) {
        // Check if click is inside the portal dropdown
        const dropdown = document.getElementById('status-dropdown');
        if (dropdown && !dropdown.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleStatusSelect = (e: React.MouseEvent, newStatus: OverallStatus) => {
    e.preventDefault();
    e.stopPropagation();

    if (newStatus === status) {
      setIsOpen(false);
      return;
    }

    // Trigger animation
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    // Close dropdown
    setIsOpen(false);

    // Trigger the change with previous status for logging
    onStatusChange(newStatus, status);
  };

  // Dropdown rendered via portal
  const dropdown = isOpen ? createPortal(
    <div
      id="status-dropdown"
      className="fixed bg-white rounded-lg shadow-xl border border-neutral-200 py-1 min-w-[180px] z-[99999]"
      style={{
        top: dropdownPosition.top,
        left: Math.max(8, dropdownPosition.left), // Ensure it doesn't go off-screen
      }}
    >
      {allStatuses.map((statusOption) => {
        const optionConfig = statusConfig[statusOption];
        const isSelected = statusOption === status;

        return (
          <button
            key={statusOption}
            type="button"
            onClick={(e) => handleStatusSelect(e, statusOption)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer',
              'hover:bg-neutral-50 transition-colors',
              isSelected && 'bg-neutral-50'
            )}
          >
            <span
              className={cn(
                'w-3 h-3 rounded-full flex-shrink-0',
                optionConfig.bg
              )}
            />
            <span className="flex-1 text-neutral-700">{statusOption}</span>
            {isSelected && (
              <Check className="h-4 w-4 text-neutral-500 flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer',
          config.bg,
          config.text,
          config.hoverBg,
          'shadow-sm',
          animating && 'scale-105 ring-4 ' + config.ring,
          disabled && 'opacity-50 cursor-not-allowed',
          size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
        )}
      >
        <span>{status}</span>
        <ChevronDown
          className={cn(
            'transition-transform duration-200',
            size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {dropdown}
    </>
  );
}

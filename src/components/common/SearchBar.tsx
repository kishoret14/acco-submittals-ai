import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
  debounceMs?: number;
}

export function SearchBar({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onClear,
  className,
  debounceMs = 300,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const debouncedOnChange = useCallback(
    debounce((val: string) => onChange(val), debounceMs),
    [onChange, debounceMs]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
    onClear?.();
  };

  return (
    <div className={className}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          icon={<Search className="h-4 w-4" />}
          className="pr-8"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

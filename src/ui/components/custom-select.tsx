'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select...', 
  disabled = false,
  className = ''
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-2 text-left bg-brand-bg 
          border border-gray-300 dark:border-gray-600 
          rounded-lg shadow-sm
          focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand
          disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
          transition-colors
          flex items-center justify-between
        `}
      >
        <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-brand-bg border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={
                option.value === value
                  ? 'w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors bg-green-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-gray-700'
                  : 'w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            >
              <span className={`text-sm ${option.value === value ? 'font-semibold text-brand dark:text-brand' : 'text-gray-700 dark:text-gray-300'}`}>
                {option.label}
              </span>
              {option.value === value && (
                <Check className="w-4 h-4 text-brand dark:text-brand" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

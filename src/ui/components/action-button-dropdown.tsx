/**
 * ACTION BUTTON WITH DROPDOWN
 * 
 * Purpose:
 * Split button with primary action and dropdown menu for additional actions
 * 
 * Features:
 * - Primary action on left (e.g., Edit)
 * - Dropdown arrow on right with separator
 * - Click arrow to show additional actions
 * - Auto-closes when clicking outside
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface ActionItem {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  disabled?: boolean;
}

interface ActionButtonDropdownProps {
  primaryLabel: string;
  primaryHref?: string;
  primaryOnClick?: () => void;
  primaryIcon?: React.ReactNode;
  primaryDisabled?: boolean;
  actions: ActionItem[];
  disabled?: boolean;
}

export function ActionButtonDropdown({
  primaryLabel,
  primaryHref,
  primaryOnClick,
  primaryIcon,
  primaryDisabled = false,
  actions,
  disabled = false,
}: ActionButtonDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const buttonClasses = "inline-flex items-center px-4 py-2 bg-brand text-white font-medium rounded-l-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
  const dropdownButtonClasses = "px-3 py-2 bg-brand text-white border-l border-white/20 rounded-r-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

  const getActionClasses = (variant: string = 'default') => {
    const base = "flex items-center w-full px-4 py-2 text-left text-sm transition-colors";
    
    switch (variant) {
      case 'success':
        return `${base} text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20`;
      case 'danger':
        return `${base} text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20`;
      case 'warning':
        return `${base} text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20`;
      default:
        return `${base} text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`;
    }
  };

  return (
    <div className="relative inline-flex" ref={dropdownRef}>
      {/* Primary Action Button */}
      {primaryHref && !primaryDisabled ? (
        <Link href={primaryHref} className={buttonClasses}>
          {primaryIcon && <span className="mr-2">{primaryIcon}</span>}
          {primaryLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={primaryOnClick}
          disabled={disabled || primaryDisabled}
          className={buttonClasses}
        >
          {primaryIcon && <span className="mr-2">{primaryIcon}</span>}
          {primaryLabel}
        </button>
      )}

      {/* Dropdown Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || actions.length === 0}
        className={dropdownButtonClasses}
        aria-label="More actions"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && actions.length > 0 && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {actions.map((action, index) => (
            <div key={index}>
              {action.href ? (
                <Link
                  href={action.href}
                  className={getActionClasses(action.variant)}
                  onClick={() => setIsOpen(false)}
                >
                  {action.icon && <span className="mr-3">{action.icon}</span>}
                  {action.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    action.onClick?.();
                    setIsOpen(false);
                  }}
                  disabled={action.disabled}
                  className={`${getActionClasses(action.variant)} ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {action.icon && <span className="mr-3">{action.icon}</span>}
                  {action.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


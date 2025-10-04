/**
 * ⚠️ MODULAR DESIGN REMINDER
 * Keep this file under500lines. Extract components early!
 * See docs/MODULAR_DESIGN.md for guidelines.
 * 
 * Suggested extractions when needed:
 * - Menu item component
 * - Menu items data/config to constants
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Users,
  Briefcase,
  FileText,
  Receipt,
  DollarSign,
  Home,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface CreateMenuProps {
  onJobCreate?: () => void;
}

export function CreateMenu({ onJobCreate }: CreateMenuProps) {
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  const createOptions = [
    {
      label: 'New Client',
      description: 'Add a client or lead',
      icon: Users,
      href: '/clients?action=create',
      color: 'from-brand to-brand-dark',
    },
    {
      label: 'New Request',
      description: 'Capture a service inquiry',
      icon: FileText,
      href: '/requests/new',
      color: 'from-brand to-brand-dark',
    },
    {
      label: 'New Estimate',
      description: 'Create a quote for services',
      icon: FileText,
      href: '/estimates/new',
      color: 'from-brand to-brand-dark',
    },
    {
      label: 'New Job',
      description: 'Schedule a cleaning job',
      icon: Briefcase,
      href: '/jobs/new',
      color: 'from-brand to-brand-dark',
    },
    {
      label: 'New Invoice',
      description: 'Bill a client for services',
      icon: Receipt,
      href: '/invoices/new',
      color: 'from-brand to-brand-dark',
    },
    {
      label: 'Record Payment',
      description: 'Log a payment received',
      icon: DollarSign,
      href: '/payments?action=create',
      color: 'from-brand to-brand-dark',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className={`p-0.5 sm:p-3 rounded-lg transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation ${
          showMenu 
            ? 'bg-brand-dark text-white rotate-45 scale-90 xs:scale-95 active:scale-85' 
            : 'bg-brand text-white hover:bg-brand-dark active:bg-brand-dark sm:hover:scale-105 sm:hover:shadow-lg active:scale-95'
        }`}
        title="Create new..."
        aria-label="Create new"
      >
        <Plus className="w-8 h-8 sm:w-5 sm:h-5" />
      </button>

      {showMenu && (
        <div className="fixed left-1/2 -translate-x-1/2 mt-2 w-[calc(100vw-1rem)] max-w-sm sm:absolute sm:left-auto sm:right-0 sm:translate-x-0 sm:w-80 bg-brand-bg rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50" style={{ top: 'var(--header-height, 64px)' }}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">What would you like to create?</p>
          </div>
          <div className="p-2">
            {createOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link
                  key={option.label}
                  href={option.href}
                  onClick={() => setShowMenu(false)}
                  className="flex items-start p-3 sm:p-3.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors group min-h-[56px] touch-manipulation"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${option.color} flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand truncate">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{option.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

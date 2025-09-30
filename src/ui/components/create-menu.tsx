'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Users,
  UserPlus,
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
      label: 'New Job',
      description: 'Schedule a cleaning job',
      icon: Briefcase,
      href: '/jobs/new',
      color: 'from-brand to-brand-dark',
    },
    {
      label: 'New Lead',
      description: 'Capture a potential client',
      icon: UserPlus,
      href: '/leads?action=create',
      color: 'from-brand to-brand-dark',
    },
    {
      label: 'New Client',
      description: 'Add a client to your database',
      icon: Users,
      href: '/clients?action=create',
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
        className={`p-3 rounded-full transition-all shadow-lg ${
          showMenu 
            ? 'bg-brand-dark text-white rotate-45' 
            : 'bg-gradient-to-r from-brand to-brand-dark text-white hover:from-brand-dark hover:to-brand'
        }`}
        title="Create new..."
      >
        <Plus className="w-6 h-6" />
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">What would you like to create?</p>
          </div>
          <div className="p-2 max-h-96 overflow-y-auto">
            {createOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link
                  key={option.label}
                  href={option.href}
                  onClick={() => setShowMenu(false)}
                  className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${option.color} flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{option.description}</p>
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

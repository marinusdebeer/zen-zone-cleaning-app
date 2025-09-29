'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Receipt,
  CreditCard,
  BarChart3,
  Calendar,
  Settings,
  MessageSquare,
  MapPin,
  UserCheck,
  Package,
  X
} from 'lucide-react';

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = true, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Clients',
      href: '/clients',
      icon: Users,
    },
    {
      label: 'Estimates',
      href: '/estimates',
      icon: FileText,
    },
    {
      label: 'Jobs',
      href: '/jobs',
      icon: Briefcase,
    },
    {
      label: 'Schedule',
      href: '/schedule',
      icon: Calendar,
    },
    {
      label: 'Invoices',
      href: '/invoices',
      icon: Receipt,
    },
    {
      label: 'Payments',
      href: '/payments',
      icon: CreditCard,
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
  ];

  const bottomMenuItems = [
    {
      label: 'Team',
      href: '/team',
      icon: UserCheck,
    },
    {
      label: 'Inventory',
      href: '/inventory',
      icon: Package,
    },
    {
      label: 'Service Areas',
      href: '/service-areas',
      icon: MapPin,
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: MessageSquare,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-[#2e3d2f] text-white w-64 z-30
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:fixed
        `}
      >
        {/* Mobile close button */}
        <div className="lg:hidden p-4 flex justify-end">
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-[#4a7c59] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          {/* Logo section (for mobile) */}
          <div className="p-4 border-b border-[#4a7c59] lg:hidden">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-[#78A265] rounded-lg flex items-center justify-center text-[#2e3d2f] font-bold text-lg">
                ZZ
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold">Zen Zone</h1>
                <p className="text-xs text-gray-400">Cleaning Services</p>
              </div>
            </div>
          </div>

          {/* Main navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg
                      transition-all duration-200
                      ${active 
                        ? 'bg-[#4a7c59] text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-[#3a4d3b] hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Separator */}
            <div className="my-6 border-t border-[#4a7c59]"></div>

            {/* Secondary navigation */}
            <div className="space-y-1">
              {bottomMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg
                      transition-all duration-200
                      ${active 
                        ? 'bg-[#4a7c59] text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-[#3a4d3b] hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer info */}
          <div className="p-4 border-t border-[#4a7c59]">
            <div className="text-xs text-gray-400">
              <p className="font-semibold text-gray-300 mb-2">Contact Support</p>
              <p>(705) 242-1166</p>
              <p>admin@zenzonecleaning.com</p>
              <p className="mt-2">49 High St Suite 300</p>
              <p>Barrie, ON L4N 5J4</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

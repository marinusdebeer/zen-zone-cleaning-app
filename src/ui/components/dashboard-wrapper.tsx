'use client';

import { useState } from 'react';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { useSidebar } from './sidebar-context';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-brand-bg-secondary transition-colors">
      {/* Sidebar */}
      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header */}
        <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <main className="flex-1 p-6 bg-brand-bg-secondary">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

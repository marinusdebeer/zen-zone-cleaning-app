/**
 * ⚠️ MODULAR DESIGN REMINDER
 * Keep this file under500lines. Extract components early!
 * See docs/MODULAR_DESIGN.md for guidelines.
 */

'use client';

import { useSidebar } from './sidebar-context';

interface FullPageWrapperProps {
  children: React.ReactNode;
}

export function FullPageWrapper({ children }: FullPageWrapperProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className={`fixed inset-0 top-16 right-0 bottom-0 transition-all duration-300 ${isCollapsed ? 'left-0 lg:left-16' : 'left-0 lg:left-64'}`}>
      {children}
    </div>
  );
}

/**
 * ⚠️ MODULAR DESIGN REMINDER
 * Keep this file under500lines. Extract components early!
 * See docs/MODULAR_DESIGN.md for guidelines.
 */

'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export function AdminHeader() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <header suppressHydrationWarning className="admin-bg border-b admin-border">
      <div suppressHydrationWarning className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="admin-brand-gradient w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              CF
            </div>
            <div>
              <h1 className="text-xl font-bold">CleanFlow</h1>
              <p className="text-xs">Super Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              className="admin-icon-button p-2 rounded-lg"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            
            <div className="admin-user-badge flex items-center space-x-2 px-3 py-1.5 rounded-lg">
              <Shield className="w-4 h-4 admin-icon-primary" />
              <span className="text-sm">{session?.user?.email}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="admin-icon-button px-4 py-2 rounded-lg text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

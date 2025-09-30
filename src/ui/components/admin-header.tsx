'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export function AdminHeader() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-gradient-to-r from-[#0f172a] to-[#1e40af] border-b border-blue-900 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#1e40af] dark:from-blue-600 dark:to-blue-800 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              CF
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CleanFlow</h1>
              <p className="text-xs text-blue-200 dark:text-gray-400">Super Admin Dashboard</p>
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
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-blue-200" />
              ) : (
                <Sun className="h-5 w-5 text-blue-200" />
              )}
            </button>
            
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <Shield className="w-4 h-4 text-blue-300 dark:text-blue-400" />
              <span className="text-sm text-blue-100 dark:text-gray-300">{session?.user?.email}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm transition-colors border border-white/20"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

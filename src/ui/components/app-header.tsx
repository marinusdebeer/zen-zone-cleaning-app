'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  ChevronDown,
  LogOut,
  Settings,
  User,
  Menu,
  Shield
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // Mock data for demonstration
  const unreadNotifications = 3;
  const unreadMessages = 2;
  
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin || false;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
      setShowNotifications(false);
      setShowMessages(false);
    };

    if (showUserMenu || showNotifications || showMessages) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu, showNotifications, showMessages]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Company Name */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md lg:hidden hover:bg-gray-100"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="flex items-center ml-2 lg:ml-0">
              {/* Logo */}
              <div className="w-10 h-10 bg-gradient-to-br from-[#2e3d2f] to-[#4a7c59] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                ZZ
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-[#2e3d2f]">Zen Zone Cleaning</h1>
                <p className="text-xs text-gray-500">Service Management System</p>
              </div>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search clients, jobs, invoices..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side - Notifications, Messages, User */}
          <div className="flex items-center space-x-4">
            {/* Admin Link (Super Admin Only) */}
            {isSuperAdmin && (
              <Link
                href="/admin"
                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white rounded-lg hover:from-[#1e3a8a] hover:to-[#2563eb] transition-all text-sm font-medium shadow-lg"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}

            {/* Mobile Search */}
            <button className="p-2 rounded-md md:hidden hover:bg-gray-100">
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                  setShowMessages(false);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-md hover:bg-gray-100 relative"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-[#4a8c37] rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900">New job scheduled</p>
                      <p className="text-xs text-gray-500 mt-1">123 Main St - Tomorrow at 9:00 AM</p>
                    </div>
                    <div className="p-4 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900">Invoice paid</p>
                      <p className="text-xs text-gray-500 mt-1">Invoice #1234 - $250.00</p>
                    </div>
                    <div className="p-4 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900">Client message</p>
                      <p className="text-xs text-gray-500 mt-1">Sarah Johnson - "Thank you for..."</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <a href="/notifications" className="text-sm text-[#4a7c59] hover:text-[#4a8c37] font-medium">
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMessages(!showMessages);
                  setShowNotifications(false);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-md hover:bg-gray-100 relative"
              >
                <MessageSquare className="h-5 w-5 text-gray-600" />
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-[#4a8c37] rounded-full"></span>
                )}
              </button>

              {/* Messages Dropdown */}
              {showMessages && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Client Messages</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                          <p className="text-xs text-gray-500">Can we reschedule for next week?</p>
                          <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">Mike Chen</p>
                          <p className="text-xs text-gray-500">Thank you for the great service!</p>
                          <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <a href="/messages" className="text-sm text-[#4a7c59] hover:text-[#4a8c37] font-medium">
                      View all messages
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                  setShowMessages(false);
                }}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-[#4a7c59] rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">{session?.user?.email}</p>
                  </div>
                  <div className="py-2">
                    <a
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </a>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

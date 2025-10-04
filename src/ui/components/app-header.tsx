/**
 * ⚠️ MODULAR DESIGN REMINDER
 * This file is 573+ lines and should be refactored into smaller components.
 * See docs/MODULAR_DESIGN.md for guidelines.
 * Target: <300 lines per component
 * 
 * Suggested extractions:
 * - Search bar component
 * - User menu dropdown component
 * - Notifications dropdown component
 * - Organization switcher component
 * - Search results component
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  ChevronDown,
  LogOut,
  Settings,
  User,
  Menu,
  Shield,
  Users,
  Briefcase,
  Receipt,
  FileText,
  UserPlus,
  Home,
  Loader2,
  DollarSign,
  Moon,
  Sun
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { globalSearch } from '@/server/actions/search';
import { CreateMenu } from './create-menu';
import { useTheme } from './theme-provider';
import { getClientDisplayName } from '@/lib/client-utils';

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock data for demonstration
  const unreadNotifications = 3;
  const unreadMessages = 2;
  
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin || false;

  // Search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      setSearchLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await globalSearch(searchQuery);
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setSearchLoading(false);
        }
      }, 300); // 300ms debounce
    } else {
      setSearchResults(null);
      setShowSearchResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
      setShowNotifications(false);
      setShowMessages(false);
      setShowSearchResults(false);
    };

    if (showUserMenu || showNotifications || showMessages || showSearchResults) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu, showNotifications, showMessages, showSearchResults]);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
      <div className="px-2 xs:px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 xs:h-[60px] sm:h-16">
          {/* Left side - Logo and Company Name (Mobile Optimized) */}
          <div className="flex items-center min-w-0">
            <button
              onClick={onMenuClick}
              className="p-0.5 sm:p-3 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 cursor-pointer touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="h-8 w-8 sm:h-5 sm:w-5 text-gray-700 dark:text-white" />
            </button>
            
            <div className="flex items-center ml-1 xs:ml-2 lg:ml-0 min-w-0">
              {/* Logo */}
              <div className="bg-gradient-to-br from-brand to-brand-dark w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm xs:text-base sm:text-lg flex-shrink-0">
                ZZ
              </div>
              {/* Hide company name on very small screens */}
              <div className="ml-2 xs:ml-2.5 sm:ml-3 hidden xs:block min-w-0">
                <h1 className="text-sm xs:text-base sm:text-xl font-semibold text-gray-900 dark:text-white truncate leading-tight">Zen Zone Cleaning</h1>
                <p className="text-[10px] xs:text-xs text-gray-600 dark:text-gray-400 hidden sm:block leading-tight">Service Management System</p>
              </div>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block relative">
            <div className="relative">
              {searchLoading ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              )}
              <input
                type="search"
                placeholder="Search clients, jobs, invoices, estimates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (searchResults) setShowSearchResults(true);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults && (
              <div className="absolute top-full mt-2 w-full bg-brand-bg rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] overflow-y-auto">
                {/* Clients */}
                {searchResults.clients.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Clients ({searchResults.clients.length})
                      </h3>
                    </div>
                    <div>
                      {searchResults.clients.map((client: any) => {
                        const emails = Array.isArray(client.emails) ? client.emails : [];
                        return (
                          <Link
                            key={client.id}
                            href={`/clients/${client.id}`}
                            onClick={() => {
                              setShowSearchResults(false);
                              setSearchQuery('');
                            }}
                            className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{getClientDisplayName(client)}</p>
                                {emails[0] && <p className="text-xs text-gray-500 dark:text-gray-400">{emails[0]}</p>}
                              </div>
                              {client.clientStatus === 'LEAD' && (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                                  Lead
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Requests */}
                {searchResults.requests?.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Requests ({searchResults.requests.length})
                      </h3>
                    </div>
                    <div>
                      {searchResults.requests.map((request: any) => (
                        <Link
                          key={request.id}
                          href={`/requests/${request.id}`}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{getClientDisplayName(request.client)}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Jobs */}
                {searchResults.jobs.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Jobs ({searchResults.jobs.length})
                      </h3>
                    </div>
                    <div>
                      {searchResults.jobs.map((job: any) => (
                        <Link
                          key={job.id}
                          href={`/jobs/${job.id}`}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{job.title || getClientDisplayName(job.client)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{getClientDisplayName(job.client)}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimates */}
                {searchResults.estimates.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Estimates ({searchResults.estimates.length})
                      </h3>
                    </div>
                    <div>
                      {searchResults.estimates.map((estimate: any) => (
                        <Link
                          key={estimate.id}
                          href={`/estimates/${estimate.id}`}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{estimate.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {estimate.client?.companyName || `${estimate.client?.firstName || ''} ${estimate.client?.lastName || ''}`.trim() || 'Client'}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoices */}
                {searchResults.invoices.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase flex items-center">
                        <Receipt className="w-4 h-4 mr-2" />
                        Invoices ({searchResults.invoices.length})
                      </h3>
                    </div>
                    <div>
                      {searchResults.invoices.map((invoice: any) => (
                        <Link
                          key={invoice.id}
                          href={`/invoices/${invoice.id}`}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {getClientDisplayName(invoice.client)} - ${invoice.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {invoice.status}{invoice.job ? ` • ${invoice.job.title || getClientDisplayName(invoice.job.client)}` : ''}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Properties */}
                {searchResults.properties.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase flex items-center">
                        <Home className="w-4 h-4 mr-2" />
                        Properties ({searchResults.properties.length})
                      </h3>
                    </div>
                    <div>
                      {searchResults.properties.map((property: any) => (
                        <Link
                          key={property.id}
                          href={`/properties/${property.id}`}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{property.address}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{getClientDisplayName(property.client)}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payments */}
                {searchResults.payments && searchResults.payments.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Payments ({searchResults.payments.length})
                      </h3>
                    </div>
                    <div>
                      {searchResults.payments.map((payment: any) => (
                        <Link
                          key={payment.id}
                          href={`/payments`}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ${payment.amount.toFixed(2)} - {payment.method}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getClientDisplayName(payment.invoice.client)}
                            {payment.reference ? ` • Ref: ${payment.reference}` : ''}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {searchResults && 
                  !searchResults.clients.length && 
                  !searchResults.requests?.length &&
                  !searchResults.estimates.length &&
                  !searchResults.jobs.length && 
                  !searchResults.invoices.length && 
                  !searchResults.properties.length && 
                  !searchResults.payments?.length && (
                  <div className="px-4 py-8 text-center">
                    <Search className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try different keywords</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Notifications, Messages, User (Mobile Optimized) */}
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-3">
            {/* Create Menu - Always visible */}
            <CreateMenu />

            {/* Theme Toggle - Hide on mobile */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer hidden md:flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-600" />
              ) : (
                <Sun className="h-5 w-5 text-gray-300" />
              )}
            </button>

            {/* Admin Link (Super Admin Only) - Icon only on mobile */}
            {isSuperAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-brand to-brand-dark text-white rounded-lg hover:from-brand hover:to-brand-dark transition-all text-sm font-medium shadow-lg min-h-[44px] touch-manipulation"
                aria-label="Admin panel"
              >
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}

            {/* Notifications - Always visible, mobile optimized */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                  setShowMessages(false);
                  setShowUserMenu(false);
                }}
                className="p-0.5 sm:p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 relative cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Notifications"
              >
                <Bell className="h-8 w-8 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 xs:h-2.5 xs:w-2.5 bg-brand rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                )}
              </button>

              {/* Notifications Dropdown - Mobile optimized width */}
              {showNotifications && (
                <div className="fixed left-1/2 -translate-x-1/2 mt-2 w-[calc(100vw-1rem)] max-w-sm sm:absolute sm:left-auto sm:right-0 sm:translate-x-0 sm:w-80 bg-brand-bg rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50" style={{ top: 'var(--header-height, 64px)' }}>
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">New job scheduled</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">123 Main St - Tomorrow at 9:00 AM</p>
                    </div>
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Invoice paid</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Invoice #1234 - $250.00</p>
                    </div>
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Client message</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sarah Johnson - "Thank you for..."</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <a href="/notifications" className="text-sm text-brand hover:text-brand-dark font-medium">
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Messages - Always visible, mobile optimized */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMessages(!showMessages);
                  setShowNotifications(false);
                  setShowUserMenu(false);
                }}
                className="p-0.5 sm:p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 relative cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Messages"
              >
                <MessageSquare className="h-8 w-8 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 xs:h-2.5 xs:w-2.5 bg-brand rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                )}
              </button>

              {/* Messages Dropdown - Mobile optimized width */}
              {showMessages && (
                <div className="fixed left-1/2 -translate-x-1/2 mt-2 w-[calc(100vw-1rem)] max-w-sm sm:absolute sm:left-auto sm:right-0 sm:translate-x-0 sm:w-80 bg-brand-bg rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50" style={{ top: 'var(--header-height, 64px)' }}>
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Client Messages</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Sarah Johnson</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Can we reschedule for next week?</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Mike Chen</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Thank you for the great service!</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <a href="/messages" className="text-sm text-brand hover:text-brand-dark font-medium">
                      View all messages
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu - Mobile Optimized */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                  setShowMessages(false);
                }}
                className="flex items-center gap-1 sm:gap-2 p-0.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 cursor-pointer min-h-[44px] touch-manipulation"
                aria-label="User menu"
              >
                <div className="w-11 h-11 sm:w-8 sm:h-8 bg-brand rounded-full flex items-center justify-center text-white text-xl sm:text-sm font-medium flex-shrink-0">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300 hidden sm:block" />
              </button>

              {/* User Dropdown - Mobile Optimized */}
              {showUserMenu && (
                <div className="fixed left-1/2 -translate-x-1/2 mt-2 w-[calc(100vw-1rem)] max-w-xs sm:absolute sm:left-auto sm:right-0 sm:translate-x-0 sm:w-56 bg-brand-bg rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50" style={{ top: 'var(--header-height, 64px)' }}>
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                  </div>
                  <div className="py-2">
                    <a
                      href="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 min-h-[44px] touch-manipulation"
                    >
                      <User className="h-4 w-4 mr-3 flex-shrink-0" />
                      Profile
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 min-h-[44px] touch-manipulation"
                    >
                      <Settings className="h-4 w-4 mr-3 flex-shrink-0" />
                      Settings
                    </a>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 min-h-[44px] touch-manipulation"
                    >
                      <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
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

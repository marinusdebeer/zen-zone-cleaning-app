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
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Company Name */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-6 w-6 text-gray-700 dark:text-white" />
            </button>
            
            <div className="flex items-center ml-2 lg:ml-0">
              {/* Logo */}
              <div className="bg-gradient-to-br from-brand to-brand-dark w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                ZZ
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Zen Zone Cleaning</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Service Management System</p>
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
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</p>
                            {emails[0] && <p className="text-xs text-gray-500 dark:text-gray-400">{emails[0]}</p>}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Leads */}
                {searchResults.leads.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase flex items-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Leads ({searchResults.leads.length})
                      </h3>
                    </div>
                    <div>
                      {searchResults.leads.map((lead: any) => (
                        <Link
                          key={lead.id}
                          href={`/leads`}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Status: {lead.status}</p>
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
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{job.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{job.client.name}</p>
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
                            {estimate.client?.name || estimate.lead?.name} - ${estimate.amount.toFixed(2)}
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
                            {invoice.client.name} - ${invoice.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {invoice.status} {invoice.job?.title ? `• ${invoice.job.title}` : ''}
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
                          href={`/clients/${property.client.id}`}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{property.address}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{property.client.name}</p>
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
                            {payment.invoice.client.name}
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
                  !searchResults.jobs.length && 
                  !searchResults.invoices.length && 
                  !searchResults.estimates.length && 
                  !searchResults.leads.length && 
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

          {/* Right side - Notifications, Messages, User */}
          <div className="flex items-center space-x-4">
            {/* Create Menu */}
            <CreateMenu />

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-600" />
              ) : (
                <Sun className="h-5 w-5 text-gray-300" />
              )}
            </button>

            {/* Admin Link (Super Admin Only) */}
            {isSuperAdmin && (
              <Link
                href="/admin"
                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-brand to-brand-dark text-white rounded-lg hover:from-brand hover:to-brand-dark transition-all text-sm font-medium shadow-lg"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}

            {/* Mobile Search */}
            <button className="p-2 rounded-md md:hidden hover:bg-gray-100 dark:hover:bg-gray-700">
              <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
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
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-brand rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-brand-bg rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
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

            {/* Messages */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMessages(!showMessages);
                  setShowNotifications(false);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-brand rounded-full"></span>
                )}
              </button>

              {/* Messages Dropdown */}
              {showMessages && (
                <div className="absolute right-0 mt-2 w-80 bg-brand-bg rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
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

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                  setShowMessages(false);
                }}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-brand-bg rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                  </div>
                  <div className="py-2">
                    <a
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </a>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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

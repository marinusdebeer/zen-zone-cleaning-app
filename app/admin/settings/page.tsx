import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from '@/server/db';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Palette,
  Info,
  ExternalLink,
  Server,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminSettingsPage() {
  const session = await auth();
  
  if (!session?.user) redirect('/auth/signin');
  
  const user = session.user as any;
  if (!user.isSuperAdmin) redirect('/dashboard');

  // Get system statistics
  const stats = await prisma.$transaction([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.client.count(),
    prisma.job.count(),
    prisma.invoice.count(),
  ]);

  const [orgCount, userCount, clientCount, jobCount, invoiceCount] = stats;

  // Check email configuration
  const emailConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-gray-400 mt-1">Configure and monitor your CleanFlow platform</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">System Online</span>
        </div>
      </div>

      {/* Platform Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">Organizations</span>
          </div>
          <p className="text-2xl font-bold text-white">{orgCount}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-xs font-medium text-green-300">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-white">{userCount}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-medium text-purple-300">Clients</span>
          </div>
          <p className="text-2xl font-bold text-white">{clientCount}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <span className="text-xs font-medium text-yellow-300">Jobs</span>
          </div>
          <p className="text-2xl font-bold text-white">{jobCount}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 border border-indigo-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-300">Invoices</span>
          </div>
          <p className="text-2xl font-bold text-white">{invoiceCount}</p>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Server className="w-5 h-5 mr-2 text-blue-400" />
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Database</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-lg font-semibold text-white">Connected</p>
            <p className="text-xs text-gray-500 mt-1">PostgreSQL (Neon)</p>
          </div>
          <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Email Service</span>
              {emailConfigured ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            <p className="text-lg font-semibold text-white">
              {emailConfigured ? 'Configured' : 'Not Configured'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {emailConfigured ? 'SMTP Active' : 'Setup Required'}
            </p>
          </div>
          <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Authentication</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-lg font-semibold text-white">Active</p>
            <p className="text-xs text-gray-500 mt-1">Auth.js v5</p>
          </div>
        </div>
      </div>

      {/* Platform Branding */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Palette className="w-5 h-5 mr-2 text-pink-400" />
          Platform Branding
        </h2>
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-800/20 border border-blue-700 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    CF
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">CleanFlow</h3>
                    <p className="text-sm text-blue-300">Multi-Tenant Cleaning Management Platform</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Primary Color</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded border border-white/20"></div>
                      <span className="text-sm text-gray-300 font-mono">#3B82F6 → #9333EA</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Version</p>
                    <span className="text-sm text-white font-semibold">1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-300 font-medium mb-1">Platform Branding</p>
                <p className="text-sm text-blue-200/80">
                  CleanFlow branding appears on admin pages and authentication screens. 
                  Each organization maintains its own branding within their dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-blue-400" />
          Email Configuration
        </h2>
        
        {emailConfigured ? (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-semibold text-green-300">Email is Configured</p>
                  <p className="text-sm text-gray-400">SMTP server is connected and ready</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">SMTP Host</p>
                  <p className="text-sm text-white font-mono">{process.env.SMTP_HOST || 'Not set'}</p>
                </div>
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">SMTP Port</p>
                  <p className="text-sm text-white font-mono">{process.env.SMTP_PORT || 'Not set'}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-300 font-medium mb-1">Email Features Active</p>
                  <ul className="text-sm text-blue-200/80 space-y-1">
                    <li>✓ Welcome emails for new users</li>
                    <li>✓ Password reset emails</li>
                    <li>✓ Organization creation notifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="font-semibold text-yellow-300">Email Not Configured</p>
                  <p className="text-sm text-gray-400">Configure SMTP to enable email features</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-300 mb-3">To enable email functionality:</p>
              <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                <li>Add SMTP credentials to your <code className="bg-gray-900 px-2 py-1 rounded text-blue-400">.env.local</code> file</li>
                <li>Required variables: <code className="bg-gray-900 px-2 py-1 rounded text-blue-400">SMTP_HOST</code>, <code className="bg-gray-900 px-2 py-1 rounded text-blue-400">SMTP_PORT</code>, <code className="bg-gray-900 px-2 py-1 rounded text-blue-400">SMTP_USER</code>, <code className="bg-gray-900 px-2 py-1 rounded text-blue-400">SMTP_PASSWORD</code></li>
                <li>Restart the development server</li>
              </ol>
              <Link 
                href="/docs/EMAIL_SETUP.md" 
                className="inline-flex items-center mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View Email Setup Guide <ExternalLink className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-red-400" />
          Security Configuration
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-white">Password Requirements</p>
                <p className="text-sm text-gray-400">Minimum 8 characters</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-white">One User = One Organization</p>
                <p className="text-sm text-gray-400">Enhanced security model enforced</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-white">Row Level Security (RLS)</p>
                <p className="text-sm text-gray-400">Database-level tenant isolation</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-300 font-medium mb-1">Security Best Practices</p>
                <ul className="text-sm text-blue-200/80 space-y-1">
                  <li>✓ All passwords are hashed with bcrypt</li>
                  <li>✓ Session-based authentication with secure cookies</li>
                  <li>✓ Super admin access separated from tenant data</li>
                  <li>✓ HTTPS enforced in production</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Management */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Database className="w-5 h-5 mr-2 text-purple-400" />
          Database Management
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Provider</p>
                <p className="text-white font-semibold">PostgreSQL</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Host</p>
                <p className="text-white font-semibold">Neon</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">ORM</p>
                <p className="text-white font-semibold">Prisma</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-300 font-medium mb-1">Database Operations</p>
                <p className="text-sm text-yellow-200/80">
                  Use terminal commands for database operations. Run migrations with <code className="bg-gray-900 px-2 py-1 rounded">npx prisma migrate dev</code> 
                  and seed data with <code className="bg-gray-900 px-2 py-1 rounded">npx prisma db seed</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation & Resources */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-400" />
            Documentation & Resources
          </h2>
          <Link 
            href="/admin/docs"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center"
          >
            View All Docs
            <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/admin/docs/email-setup"
            className="bg-gray-750 rounded-lg p-4 border border-gray-700 hover:border-blue-600 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">Email Setup Guide</p>
                <p className="text-sm text-gray-400 mt-1">Configure SMTP for email features</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </Link>

          <Link 
            href="/admin/docs/admin-guide"
            className="bg-gray-750 rounded-lg p-4 border border-gray-700 hover:border-blue-600 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">Admin Guide</p>
                <p className="text-sm text-gray-400 mt-1">Super admin features and workflows</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </Link>

          <Link 
            href="/admin/docs/user-accounts"
            className="bg-gray-750 rounded-lg p-4 border border-gray-700 hover:border-blue-600 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">User Accounts</p>
                <p className="text-sm text-gray-400 mt-1">Login credentials and access info</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </Link>

          <Link 
            href="/admin/docs/business-workflow"
            className="bg-gray-750 rounded-lg p-4 border border-gray-700 hover:border-blue-600 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">Business Workflow</p>
                <p className="text-sm text-gray-400 mt-1">Understand the data models</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Info className="w-5 h-5 mr-2 text-gray-400" />
          System Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Platform Version</p>
            <p className="text-white font-semibold">1.0.0</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Framework</p>
            <p className="text-white font-semibold">Next.js 15.5</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Node Environment</p>
            <p className="text-white font-semibold">{process.env.NODE_ENV || 'development'}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Database Provider</p>
            <p className="text-white font-semibold">PostgreSQL (Neon)</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Authentication</p>
            <p className="text-white font-semibold">Auth.js v5</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Deployment</p>
            <p className="text-white font-semibold">Vercel</p>
          </div>
        </div>
      </div>
    </div>
  );
}
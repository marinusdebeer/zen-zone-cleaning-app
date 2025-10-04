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
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="mt-1">Configure and monitor your CleanFlow platform</p>
        </div>
        <div className="admin-user-badge flex items-center space-x-2 px-4 py-2 rounded-lg">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--admin-success)' }}></div>
          <span className="text-sm">System Online</span>
        </div>
      </div>

      {/* Platform Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="admin-stat-card">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-5 h-5 admin-icon-primary" />
            <span className="text-xs font-medium">Organizations</span>
          </div>
          <p className="text-2xl font-bold">{orgCount}</p>
        </div>
        <div className="admin-stat-card">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 admin-icon-success" />
            <span className="text-xs font-medium">Total Users</span>
          </div>
          <p className="text-2xl font-bold">{userCount}</p>
        </div>
        <div className="admin-stat-card">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 admin-icon-secondary" />
            <span className="text-xs font-medium">Clients</span>
          </div>
          <p className="text-2xl font-bold">{clientCount}</p>
        </div>
        <div className="admin-stat-card">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 admin-icon-warning" />
            <span className="text-xs font-medium">Jobs</span>
          </div>
          <p className="text-2xl font-bold">{jobCount}</p>
        </div>
        <div className="admin-stat-card">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 admin-icon-info" />
            <span className="text-xs font-medium">Invoices</span>
          </div>
          <p className="text-2xl font-bold">{invoiceCount}</p>
        </div>
      </div>

      {/* System Status */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Server className="w-5 h-5 mr-2 admin-icon-primary" />
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="admin-card-secondary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Database</span>
              <CheckCircle className="w-5 h-5 admin-icon-success" />
            </div>
            <p className="text-lg font-semibold">Connected</p>
            <p className="text-xs admin-text-tertiary mt-1">PostgreSQL (Neon)</p>
          </div>
          <div className="admin-card-secondary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Email Service</span>
              {emailConfigured ? (
                <CheckCircle className="w-5 h-5 admin-icon-success" />
              ) : (
                <XCircle className="w-5 h-5 admin-icon-danger" />
              )}
            </div>
            <p className="text-lg font-semibold">
              {emailConfigured ? 'Configured' : 'Not Configured'}
            </p>
            <p className="text-xs admin-text-tertiary mt-1">
              {emailConfigured ? 'SMTP Active' : 'Setup Required'}
            </p>
          </div>
          <div className="admin-card-secondary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Authentication</span>
              <CheckCircle className="w-5 h-5 admin-icon-success" />
            </div>
            <p className="text-lg font-semibold">Active</p>
            <p className="text-xs admin-text-tertiary mt-1">Auth.js v5</p>
          </div>
        </div>
      </div>

      {/* Platform Branding */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Palette className="w-5 h-5 mr-2 admin-icon-secondary" />
          Platform Branding
        </h2>
        <div className="space-y-4">
          <div className="admin-card-secondary p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="admin-brand-gradient-accent w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    CF
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">CleanFlow</h3>
                    <p className="text-sm">Multi-Tenant Cleaning Management Platform</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Primary Color</p>
                    <div className="flex items-center space-x-2">
                      <div className="admin-brand-gradient-accent w-6 h-6 rounded border border-white/20"></div>
                      <span className="text-sm text-gray-300 font-mono">#3B82F6 → #9333EA</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Version</p>
                    <span className="text-sm font-semibold">1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="admin-card-secondary">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 admin-icon-info mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Platform Branding</p>
                <p className="text-sm">
                  CleanFlow branding appears on admin pages and authentication screens. 
                  Each organization maintains its own branding within their dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Mail className="w-5 h-5 mr-2 admin-icon-primary" />
          Email Configuration
        </h2>
        
        {emailConfigured ? (
          <div className="space-y-4">
            <div className="admin-card-secondary">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="w-6 h-6 admin-icon-success" />
                <div>
                  <p className="font-semibold">Email is Configured</p>
                  <p className="text-sm text-gray-400">SMTP server is connected and ready</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="admin-bg-tertiary rounded p-3">
                  <p className="text-xs admin-text-tertiary mb-1">SMTP Host</p>
                  <p className="text-sm font-mono">{process.env.SMTP_HOST || 'Not set'}</p>
                </div>
                <div className="admin-bg-tertiary rounded p-3">
                  <p className="text-xs admin-text-tertiary mb-1">SMTP Port</p>
                  <p className="text-sm font-mono">{process.env.SMTP_PORT || 'Not set'}</p>
                </div>
              </div>
            </div>
            <div className="admin-card-secondary">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 admin-icon-info mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">Email Features Active</p>
                  <ul className="text-sm space-y-1">
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
            <div className="admin-card-secondary">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 admin-icon-warning" />
                <div>
                  <p className="font-semibold">Email Not Configured</p>
                  <p className="text-sm text-gray-400">Configure SMTP to enable email features</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-300 mb-3">To enable email functionality:</p>
              <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                <li>Add SMTP credentials to your <code className="admin-bg-tertiary admin-text-primary px-2 py-1 rounded">.env</code> file</li>
                <li>Required variables: <code className="admin-bg-tertiary admin-text-primary px-2 py-1 rounded">SMTP_HOST</code>, <code className="admin-bg-tertiary admin-text-primary px-2 py-1 rounded">SMTP_PORT</code>, <code className="admin-bg-tertiary admin-text-primary px-2 py-1 rounded">SMTP_USER</code>, <code className="admin-bg-tertiary admin-text-primary px-2 py-1 rounded">SMTP_PASSWORD</code></li>
                <li>Restart the development server</li>
              </ol>
              <Link 
                href="/docs/EMAIL_SETUP.md" 
                className="admin-link inline-flex items-center mt-4 text-sm font-medium"
              >
                View Email Setup Guide <ExternalLink className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
          Security Configuration
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-white">Password Requirements</p>
                <p className="text-sm text-gray-400">Minimum 8 characters</p>
              </div>
              <CheckCircle className="w-5 h-5 admin-icon-success" />
            </div>
          </div>
          
          <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-white">One User = One Organization</p>
                <p className="text-sm text-gray-400">Enhanced security model enforced</p>
              </div>
              <CheckCircle className="w-5 h-5 admin-icon-success" />
            </div>
          </div>

          <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-white">Row Level Security (RLS)</p>
                <p className="text-sm text-gray-400">Database-level tenant isolation</p>
              </div>
              <CheckCircle className="w-5 h-5 admin-icon-success" />
            </div>
          </div>

          <div className="admin-card-secondary">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 admin-icon-info mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Security Best Practices</p>
                <ul className="text-sm space-y-1">
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
      <div className="admin-card">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Database className="w-5 h-5 mr-2 admin-icon-secondary" />
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

          <div className="admin-card-secondary">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 admin-icon-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Database Operations</p>
                <p className="text-sm">
                  Use terminal commands for database operations. Run migrations with <code className="bg-gray-900 px-2 py-1 rounded">npx prisma migrate dev</code> 
                  and seed data with <code className="bg-gray-900 px-2 py-1 rounded">npx prisma db seed</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation & Resources */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2 admin-icon-success" />
            Documentation & Resources
          </h2>
          <Link 
            href="/admin/docs"
            className="admin-link text-sm font-medium inline-flex items-center"
          >
            View All Docs
            <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/admin/docs/email-setup"
            className="admin-card-secondary group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold group-hover:admin-text-primary transition-colors">Email Setup Guide</p>
                <p className="text-sm text-gray-400 mt-1">Configure SMTP for email features</p>
              </div>
              <ExternalLink className="w-5 h-5 admin-text-tertiary group-hover:admin-icon-primary transition-colors" />
            </div>
          </Link>

          <Link 
            href="/admin/docs/admin-guide"
            className="admin-card-secondary group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold group-hover:admin-text-primary transition-colors">Admin Guide</p>
                <p className="text-sm text-gray-400 mt-1">Super admin features and workflows</p>
              </div>
              <ExternalLink className="w-5 h-5 admin-text-tertiary group-hover:admin-icon-primary transition-colors" />
            </div>
          </Link>

          <Link 
            href="/admin/docs/user-accounts"
            className="admin-card-secondary group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold group-hover:admin-text-primary transition-colors">User Accounts</p>
                <p className="text-sm text-gray-400 mt-1">Login credentials and access info</p>
              </div>
              <ExternalLink className="w-5 h-5 admin-text-tertiary group-hover:admin-icon-primary transition-colors" />
            </div>
          </Link>

          <Link 
            href="/admin/docs/business-workflow"
            className="admin-card-secondary group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold group-hover:admin-text-primary transition-colors">Business Workflow</p>
                <p className="text-sm text-gray-400 mt-1">Understand the data models</p>
              </div>
              <ExternalLink className="w-5 h-5 admin-text-tertiary group-hover:admin-icon-primary transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* System Information */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Info className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          System Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Platform Version</p>
            <p className="font-semibold">1.0.0</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Framework</p>
            <p className="font-semibold">Next.js 15.5</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Node Environment</p>
            <p className="font-semibold">{process.env.NODE_ENV || 'development'}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Database Provider</p>
            <p className="font-semibold">PostgreSQL (Neon)</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Authentication</p>
            <p className="font-semibold">Auth.js v5</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Deployment</p>
            <p className="font-semibold">Vercel</p>
          </div>
        </div>
      </div>
    </div>
  );
}
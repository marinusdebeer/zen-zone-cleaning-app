import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { 
  FileText, 
  Mail, 
  Shield, 
  Users, 
  Briefcase, 
  Calendar,
  Building2,
  ChevronRight,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

const docs = [
  {
    slug: 'email-setup',
    title: 'Email Setup Guide',
    description: 'Configure SMTP for email features including welcome emails and password resets',
    icon: Mail,
    color: 'blue',
    category: 'Configuration'
  },
  {
    slug: 'admin-guide',
    title: 'Admin Guide',
    description: 'Super admin features, workflows, and best practices for managing the platform',
    icon: Shield,
    color: 'red',
    category: 'Administration'
  },
  {
    slug: 'user-accounts',
    title: 'User Accounts',
    description: 'Login credentials, password management, and user access information',
    icon: Users,
    color: 'green',
    category: 'Users'
  },
  {
    slug: 'business-workflow',
    title: 'Business Workflow',
    description: 'Understand the data models and business process flow from leads to payments',
    icon: Briefcase,
    color: 'purple',
    category: 'Business'
  },
  {
    slug: 'multi-tenancy',
    title: 'Multi-Tenancy Architecture',
    description: 'How the multi-tenant system works with Row Level Security',
    icon: Building2,
    color: 'indigo',
    category: 'Architecture'
  },
  {
    slug: 'calendar-features',
    title: 'Calendar Features',
    description: 'Interactive calendar with drag-to-create and scheduling capabilities',
    icon: Calendar,
    color: 'yellow',
    category: 'Features'
  },
  {
    slug: 'how-to-run',
    title: 'How to Run',
    description: 'Getting started, installation, and development setup instructions',
    icon: BookOpen,
    color: 'pink',
    category: 'Getting Started'
  },
];

const colorClasses = {
  blue: 'admin-card-secondary',
  red: 'admin-card-secondary',
  green: 'admin-card-secondary',
  purple: 'admin-card-secondary',
  indigo: 'admin-card-secondary',
  yellow: 'admin-card-secondary',
  pink: 'admin-card-secondary',
};

const iconColorClasses = {
  blue: 'admin-icon-primary',
  red: 'admin-icon-danger',
  green: 'admin-icon-success',
  purple: 'admin-icon-secondary',
  indigo: 'admin-icon-primary',
  yellow: 'admin-icon-warning',
  pink: 'admin-icon-secondary',
};

export default async function AdminDocsPage() {
  const session = await auth();
  
  if (!session?.user) redirect('/auth/signin');
  
  const user = session.user as any;
  if (!user.isSuperAdmin) redirect('/dashboard');

  // Group docs by category
  const categories = Array.from(new Set(docs.map(doc => doc.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <BookOpen className="w-8 h-8 mr-3 admin-icon-primary" />
            Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Everything you need to know about managing CleanFlow</p>
        </div>
        <Link
          href="/admin/settings"
          className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Link>
      </div>

      {/* Categories */}
      {categories.map((category) => {
        const categoryDocs = docs.filter(doc => doc.category === category);
        
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="admin-brand-gradient-accent h-8 w-1 rounded-full"></div>
              <h2 className="text-2xl font-bold flex items-center">
                {category}
                <span className="ml-3 px-3 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700">
                  {categoryDocs.length} {categoryDocs.length === 1 ? 'guide' : 'guides'}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryDocs.map((doc) => {
                const Icon = doc.icon;
                return (
                  <Link
                    key={doc.slug}
                    href={`/admin/docs/${doc.slug}`}
                    className="group"
                  >
                    <div className={`bg-gradient-to-br ${colorClasses[doc.color as keyof typeof colorClasses]} border rounded-xl p-6 transition-all hover:shadow-lg hover:scale-[1.02]`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 bg-gray-800/50 rounded-lg border border-gray-700 ${iconColorClasses[doc.color as keyof typeof iconColorClasses]} shadow-lg`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:admin-text-primary transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {doc.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Quick Links */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/admin" className="admin-link text-sm flex items-center">
            <ChevronRight className="w-4 h-4 mr-1" />
            Organizations Dashboard
          </Link>
          <Link href="/admin/analytics" className="admin-link text-sm flex items-center">
            <ChevronRight className="w-4 h-4 mr-1" />
            Platform Analytics
          </Link>
          <Link href="/admin/settings" className="admin-link text-sm flex items-center">
            <ChevronRight className="w-4 h-4 mr-1" />
            System Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

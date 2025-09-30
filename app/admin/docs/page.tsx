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
  blue: 'from-blue-900/30 to-blue-800/20 border-blue-700 group-hover:border-blue-500',
  red: 'from-red-900/30 to-red-800/20 border-red-700 group-hover:border-red-500',
  green: 'from-green-900/30 to-green-800/20 border-green-700 group-hover:border-green-500',
  purple: 'from-purple-900/30 to-purple-800/20 border-purple-700 group-hover:border-purple-500',
  indigo: 'from-indigo-900/30 to-indigo-800/20 border-indigo-700 group-hover:border-indigo-500',
  yellow: 'from-yellow-900/30 to-yellow-800/20 border-yellow-700 group-hover:border-yellow-500',
  pink: 'from-pink-900/30 to-pink-800/20 border-pink-700 group-hover:border-pink-500',
};

const iconColorClasses = {
  blue: 'text-blue-400',
  red: 'text-red-400',
  green: 'text-green-400',
  purple: 'text-purple-400',
  indigo: 'text-indigo-400',
  yellow: 'text-yellow-400',
  pink: 'text-pink-400',
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
          <h1 className="text-3xl font-bold text-white flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-blue-400" />
            Documentation
          </h1>
          <p className="text-gray-400 mt-1">Everything you need to know about managing CleanFlow</p>
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
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                {category}
                <span className="ml-3 px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded-full border border-gray-700">
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
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
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
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
            <ChevronRight className="w-4 h-4 mr-1" />
            Organizations Dashboard
          </Link>
          <Link href="/admin/analytics" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
            <ChevronRight className="w-4 h-4 mr-1" />
            Platform Analytics
          </Link>
          <Link href="/admin/settings" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
            <ChevronRight className="w-4 h-4 mr-1" />
            System Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

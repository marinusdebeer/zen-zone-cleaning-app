import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { DollarSign, TrendingUp, CheckCircle, Clock, CreditCard } from 'lucide-react';

export default async function PaymentsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Mock payment data
  const payments = [
    {
      id: '1',
      invoiceId: 'INV-001',
      client: 'Sarah Johnson',
      amount: 350,
      method: 'Credit Card',
      status: 'completed',
      date: new Date('2025-01-20'),
    },
    {
      id: '2',
      invoiceId: 'INV-002',
      client: 'Mike Chen',
      amount: 850,
      method: 'Bank Transfer',
      status: 'pending',
      date: new Date('2025-01-22'),
    },
    {
      id: '3',
      invoiceId: 'INV-003',
      client: 'Lisa Chen',
      amount: 450,
      method: 'Cash',
      status: 'completed',
      date: new Date('2025-01-18'),
    },
  ];

  const stats = {
    totalReceived: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    thisMonth: payments.reduce((sum, p) => sum + p.amount, 0),
  };

  const getStatusBadge = (status: string) => {
    return status === 'completed' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" /> Paid
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" /> Pending
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Track and manage payment transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Received This Month</p>
              <p className="text-2xl font-bold text-[#4a7c59] mt-2">${stats.totalReceived.toFixed(2)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+15.3%</span>
              </div>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <DollarSign className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">${stats.pending.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">1 invoice</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${stats.thisMonth.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">{payments.length} transactions</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <CreditCard className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Credit Card</span>
              <span className="text-sm font-semibold text-gray-900">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Bank Transfer</span>
              <span className="text-sm font-semibold text-gray-900">35%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Cash</span>
              <span className="text-sm font-semibold text-gray-900">20%</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {payments.slice(0, 3).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${payment.status === 'completed' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <DollarSign className={`w-4 h-4 ${payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{payment.client}</p>
                    <p className="text-xs text-gray-500">{payment.date.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${payment.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{payment.method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Payments</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {payment.client}
                      </h3>
                      {getStatusBadge(payment.status)}
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        <strong>Invoice:</strong> {payment.invoiceId}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Method:</strong> {payment.method}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Date:</strong> {payment.date.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Amount:</strong> <span className="text-[#4a7c59] font-semibold text-lg">${payment.amount.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <Link
                      href={`/invoices/${payment.invoiceId}`}
                      className="text-[#4a7c59] hover:text-[#4a8c37] text-sm font-medium"
                    >
                      View Invoice
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

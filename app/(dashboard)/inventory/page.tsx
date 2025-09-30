import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Package, AlertCircle, TrendingDown, Plus } from 'lucide-react';

export default async function InventoryPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Mock inventory data
  const inventory = [
    {
      id: '1',
      name: 'All-Purpose Cleaner',
      category: 'Cleaning Solutions',
      quantity: 45,
      unit: 'bottles',
      reorderLevel: 20,
      costPerUnit: 8.99,
      status: 'in-stock',
    },
    {
      id: '2',
      name: 'Microfiber Cloths',
      category: 'Supplies',
      quantity: 150,
      unit: 'pieces',
      reorderLevel: 50,
      costPerUnit: 2.50,
      status: 'in-stock',
    },
    {
      id: '3',
      name: 'Floor Mop',
      category: 'Equipment',
      quantity: 8,
      unit: 'units',
      reorderLevel: 5,
      costPerUnit: 35.00,
      status: 'in-stock',
    },
    {
      id: '4',
      name: 'Glass Cleaner',
      category: 'Cleaning Solutions',
      quantity: 15,
      unit: 'bottles',
      reorderLevel: 20,
      costPerUnit: 6.50,
      status: 'low-stock',
    },
    {
      id: '5',
      name: 'Vacuum Bags',
      category: 'Supplies',
      quantity: 8,
      unit: 'packs',
      reorderLevel: 15,
      costPerUnit: 12.00,
      status: 'low-stock',
    },
  ];

  const getStatusBadge = (item: typeof inventory[0]) => {
    if (item.quantity <= item.reorderLevel) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
          <AlertCircle className="w-3 h-3 mr-1" /> Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
        In Stock
      </span>
    );
  };

  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory & Supplies</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage cleaning supplies and equipment</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{inventory.length}</p>
            </div>
            <div className="p-3 bg-[#f7faf7] dark:bg-gray-700 rounded-lg">
              <Package className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{lowStockItems.length}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">3</p>
            </div>
            <div className="p-3 bg-[#f7faf7] dark:bg-gray-700 rounded-lg">
              <Package className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-[#4a7c59] mt-2">$2,847</p>
            </div>
            <div className="p-3 bg-[#f7faf7] dark:bg-gray-700 rounded-lg">
              <TrendingDown className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {lowStockItems.length} item(s) need reordering
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {lowStockItems.map(item => item.name).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Inventory</h2>
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>All Categories</option>
              <option>Cleaning Solutions</option>
              <option>Supplies</option>
              <option>Equipment</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reorder Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cost/Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{item.quantity} {item.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.reorderLevel}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">${item.costPerUnit.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-[#4a7c59] hover:text-[#4a8c37] font-medium mr-3">
                      Edit
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Reorder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

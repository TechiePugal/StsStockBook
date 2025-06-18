import React from 'react';
import { Package, Building2, Factory, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useInventoryData } from '../../hooks/useInventoryData';

const Dashboard: React.FC<ReturnType<typeof useInventoryData>> = ({
  parts,
  suppliers,
  companies,
  smwToSupplierTransactions,
  supplierToCompanyTransactions,
  loading
}) => {
  const stats = [
    {
      name: 'Total Parts',
      value: parts.length,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    {
      name: 'Active Suppliers',
      value: suppliers.length,
      icon: Building2,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600'
    },
    {
      name: 'Companies',
      value: companies.length,
      icon: Factory,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600'
    },
    {
      name: 'Total Transactions',
      value: smwToSupplierTransactions.length + supplierToCompanyTransactions.length,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600'
    },
  ];

  const recentTransactions = [
    ...smwToSupplierTransactions.slice(0, 3).map(t => ({
      ...t,
      type: 'SMW to Supplier',
      color: 'bg-blue-100 text-blue-800'
    })),
    ...supplierToCompanyTransactions.slice(0, 3).map(t => ({
      ...t,
      type: 'Supplier to Company',
      color: 'bg-green-100 text-green-800'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to your inventory management system overview
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="p-6">
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {transaction.sendQuantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${transaction.color}`}>
                        {transaction.type}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {transaction.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent transactions</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Package className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-900">Add Part</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Building2 className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-900">Add Supplier</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Factory className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-900">Add Company</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-orange-900">View Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
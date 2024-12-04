import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Map,
  BarChart2,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  userCount: number;
  territoriesCount: number;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
  subscription: string;
}

const TenantMonitoring: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock data - replace with actual API call
  const tenants: Tenant[] = [
    {
      id: '1',
      name: 'Acme Corporation',
      userCount: 150,
      territoriesCount: 25,
      status: 'active',
      lastActive: '2024-01-15',
      subscription: 'Enterprise'
    },
    {
      id: '2',
      name: 'TechStart Inc',
      userCount: 45,
      territoriesCount: 8,
      status: 'active',
      lastActive: '2024-01-14',
      subscription: 'Professional'
    },
    {
      id: '3',
      name: 'Global Solutions',
      userCount: 75,
      territoriesCount: 12,
      status: 'inactive',
      lastActive: '2024-01-10',
      subscription: 'Enterprise'
    }
  ];

  const stats = [
    {
      label: 'Total Organizations',
      value: tenants.length,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Active Users',
      value: tenants.reduce((acc, tenant) => acc + tenant.userCount, 0),
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Total Territories',
      value: tenants.reduce((acc, tenant) => acc + tenant.territoriesCount, 0),
      icon: Map,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Active Rate',
      value: '85%',
      icon: BarChart2,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500 bg-green-100';
      case 'inactive':
        return 'text-red-500 bg-red-100';
      case 'pending':
        return 'text-yellow-500 bg-yellow-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Organization Monitoring</h1>
        <p className="text-gray-600">
          Monitor and manage all organizations using the platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-2xl font-semibold">{stat.value}</span>
            </div>
            <h3 className="text-gray-600 text-sm">{stat.label}</h3>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search organizations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <ArrowUpDown className="w-5 h-5" />
              Sort
            </button>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Territories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                    <div className="text-sm text-gray-500">ID: {tenant.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.userCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.territoriesCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.subscription}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tenant.lastActive).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenantMonitoring;

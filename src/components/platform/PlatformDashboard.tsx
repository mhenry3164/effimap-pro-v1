import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Settings, 
  Activity,
  TrendingUp,
  AlertTriangle,
  Server,
  Shield,
  DollarSign
} from 'lucide-react';
import { adminService, SystemMetrics, TenantData } from '../../services/adminService';

const PlatformDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [tenantStats, setTenantStats] = useState({
    totalTenants: 0,
    activeUsers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load metrics and tenant data in parallel
      const [metrics, tenantsResult] = await Promise.all([
        adminService.getSystemMetrics().catch(error => {
          console.error('Error fetching metrics:', error);
          return null;
        }),
        adminService.getTenants(100).catch(error => {
          console.error('Error fetching tenants:', error);
          return { tenants: [], lastDoc: null };
        }),
      ]);

      if (metrics) {
        setSystemMetrics(metrics);
      }

      // Calculate tenant statistics
      const tenants = tenantsResult.tenants;
      const stats = calculateTenantStats(tenants);
      setTenantStats(stats);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'An error occurred while loading dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTenantStats = (tenants: TenantData[]) => {
    return tenants.reduce((acc, tenant) => ({
      totalTenants: acc.totalTenants + 1,
      activeUsers: acc.activeUsers + (tenant.userCount || 0),
      totalRevenue: acc.totalRevenue + (tenant.subscription?.mrr || 0),
    }), {
      totalTenants: 0,
      activeUsers: 0,
      totalRevenue: 0,
    });
  };

  const stats = [
    {
      label: 'Active Organizations',
      value: tenantStats.totalTenants,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      link: '/platform/organizations'
    },
    {
      label: 'Active Users',
      value: tenantStats.activeUsers,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      link: '/platform/users'
    },
    {
      label: 'System Health',
      value: systemMetrics?.cpu ? `${systemMetrics.cpu}%` : 'N/A',
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      link: '/platform/health'
    },
    {
      label: 'Monthly Revenue',
      value: `$${tenantStats.totalRevenue}`,
      icon: DollarSign,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      link: '/platform/analytics'
    }
  ];

  const quickActions = [
    {
      title: 'System Health',
      description: 'Monitor system performance and issues',
      icon: Server,
      color: 'text-blue-500',
      link: '/platform/health'
    },
    {
      title: 'Security',
      description: 'Review security settings and logs',
      icon: Shield,
      color: 'text-green-500',
      link: '/platform/security'
    },
    {
      title: 'Alerts',
      description: `${systemMetrics?.activeAlerts || 0} active alerts`,
      icon: AlertTriangle,
      color: systemMetrics?.activeAlerts ? 'text-red-500' : 'text-orange-500',
      link: '/platform/alerts'
    },
    {
      title: 'Settings',
      description: 'Configure platform settings',
      icon: Settings,
      color: 'text-purple-500',
      link: '/platform/settings'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Platform Overview</h1>
            <p className="text-gray-600">
              Monitor and manage your platform's performance and organizations
            </p>
          </div>
          {systemMetrics?.activeAlerts ? (
            <button
              onClick={() => navigate('/platform/alerts')}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              {systemMetrics.activeAlerts} Active Alerts
            </button>
          ) : null}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(stat.link)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold">{stat.value}</div>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm">{stat.label}</h3>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(action.link)}
            >
              <div className="flex items-center mb-4">
                <action.icon className={`w-6 h-6 ${action.color} mr-3`} />
                <h3 className="font-medium">{action.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {/* We'll implement this with actual data from adminService later */}
          <p className="text-gray-600">No recent activities to display</p>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;

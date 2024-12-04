import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Clock,
  Cpu,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { adminService, SystemMetrics } from '../../services/adminService';

interface SystemStatus {
  status: 'operational' | 'degraded' | 'down';
  components: {
    database: 'operational' | 'degraded' | 'down';
    storage: 'operational' | 'degraded' | 'down';
    authentication: 'operational' | 'degraded' | 'down';
    api: 'operational' | 'degraded' | 'down';
  };
  metrics: {
    cpu: number;
    memory: number;
    storage: number;
    activeConnections: number;
  };
  recentErrors: Array<{
    id: string;
    timestamp: Date;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

const SystemHealth: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [componentStatus, setComponentStatus] = useState<Record<string, 'operational' | 'degraded' | 'down'>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSystemHealth();
    const interval = setInterval(loadSystemHealth, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadSystemHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load metrics and status in parallel
      const [metrics, status] = await Promise.all([
        adminService.getSystemMetrics(),
        adminService.getComponentStatus(),
      ]);

      setSystemMetrics(metrics);
      setComponentStatus(status);
    } catch (err) {
      console.error('Error loading system health:', err);
      setError('Failed to load system health data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return CheckCircle2;
      case 'degraded':
        return AlertCircle;
      case 'down':
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-500 bg-green-100';
      case 'degraded':
        return 'text-yellow-500 bg-yellow-100';
      case 'down':
        return 'text-red-500 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const metrics = systemMetrics ? [
    {
      title: 'CPU Usage',
      value: `${systemMetrics.cpu}%`,
      status: systemMetrics.cpu > 80 ? 'critical' : systemMetrics.cpu > 60 ? 'warning' : 'healthy',
      icon: Cpu,
      trend: {
        direction: 'up',
        value: '2%'
      }
    },
    {
      title: 'Memory Usage',
      value: `${systemMetrics.memory}%`,
      status: systemMetrics.memory > 80 ? 'critical' : systemMetrics.memory > 60 ? 'warning' : 'healthy',
      icon: Server,
      trend: {
        direction: 'up',
        value: '0.5 GB'
      }
    },
    {
      title: 'Storage',
      value: `${systemMetrics.storage}%`,
      status: systemMetrics.storage > 80 ? 'critical' : systemMetrics.storage > 60 ? 'warning' : 'healthy',
      icon: HardDrive
    },
    {
      title: 'Active Connections',
      value: systemMetrics.activeConnections,
      status: 'healthy',
      icon: Network
    }
  ] : [];

  const services = [
    {
      name: 'API Server',
      status: componentStatus['api'] || 'operational',
      uptime: '99.99%',
      lastIncident: '30 days ago'
    },
    {
      name: 'Database',
      status: componentStatus['database'] || 'operational',
      uptime: '99.95%',
      lastIncident: '15 days ago'
    },
    {
      name: 'Authentication',
      status: componentStatus['auth'] || 'operational',
      uptime: '99.99%'
    },
    {
      name: 'Storage Service',
      status: componentStatus['storage'] || 'operational',
      uptime: '98.5%',
      lastIncident: '2 hours ago'
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
        <h1 className="text-2xl font-semibold mb-2">System Health</h1>
        <p className="text-gray-600">
          Monitor system performance and service status
        </p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getStatusColor(metric.status)}`}>
                <metric.icon className={`w-6 h-6`} />
              </div>
              <div className="text-right">
                <span className="text-2xl font-semibold">{metric.value}</span>
                {metric.trend && (
                  <div className={`text-sm ${
                    metric.trend.direction === 'up' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {metric.trend.direction === 'up' ? '↑' : '↓'} {metric.trend.value}
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-gray-600 text-sm">{metric.title}</h3>
          </div>
        ))}
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium">Service Status</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {services.map((service, index) => {
            const StatusIcon = getStatusIcon(service.status);
            return (
              <div key={index} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <StatusIcon className={`w-5 h-5 mr-3 ${getStatusColor(service.status)}`} />
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-500">
                      Uptime: {service.uptime}
                    </p>
                  </div>
                </div>
                {service.lastIncident && (
                  <div className="text-sm text-gray-500">
                    Last incident: {service.lastIncident}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium">Recent System Logs</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">High Memory Usage Warning</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Activity className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">System Backup Completed</p>
                <p className="text-sm text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Database className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Database Optimization Complete</p>
                <p className="text-sm text-gray-500">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;

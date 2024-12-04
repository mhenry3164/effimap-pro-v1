import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../contexts/TenantContext';
import { MapPin, Users, Map as MapIcon, Calendar } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const stats = [
    {
      label: 'Active Territory',
      value: '1',
      icon: MapPin,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Team Members',
      value: '12',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Area Coverage',
      value: '85%',
      icon: MapIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Next Review',
      value: '15 Days',
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Welcome back, {user?.displayName || 'User'}!</h1>
        <p className="text-gray-600">
          Here's an overview of your territory and recent activities
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {/* Placeholder for activity list */}
            <p className="text-gray-600">No recent activities to display</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Territory Updates</h2>
          <div className="space-y-4">
            {/* Placeholder for territory updates */}
            <p className="text-gray-600">No recent updates to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

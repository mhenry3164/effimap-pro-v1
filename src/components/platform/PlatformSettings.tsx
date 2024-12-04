import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Shield, Database, Mail, Bell, Cloud } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface PlatformSettings {
  subscriptionPlans: {
    basic: {
      enabled: boolean;
      maxUsers: number;
      price: number;
    };
    professional: {
      enabled: boolean;
      maxUsers: number;
      price: number;
    };
    enterprise: {
      enabled: boolean;
      maxUsers: number;
      price: number;
    };
  };
  features: {
    userInvitations: boolean;
    apiAccess: boolean;
    customBranding: boolean;
    advancedAnalytics: boolean;
  };
  systemNotifications: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    systemAlert: string;
  };
}

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ElementType;
  fields: {
    id: string;
    label: string;
    type: string;
    value: string | boolean | number;
    description?: string;
    options?: { value: string; label: string }[];
  }[];
}

const PlatformSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<PlatformSettings>({
    subscriptionPlans: {
      basic: { enabled: true, maxUsers: 5, price: 10 },
      professional: { enabled: true, maxUsers: 20, price: 25 },
      enterprise: { enabled: true, maxUsers: 100, price: 100 },
    },
    features: {
      userInvitations: true,
      apiAccess: true,
      customBranding: true,
      advancedAnalytics: false,
    },
    systemNotifications: {
      maintenanceMode: false,
      maintenanceMessage: '',
      systemAlert: '',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'platform', 'settings'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as PlatformSettings);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load settings',
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'platform', 'settings'), settings);
      setNotification({
        type: 'success',
        message: 'Settings saved successfully',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setNotification({
        type: 'error',
        message: 'Failed to save settings',
      });
    }
  };

  const handleFieldChange = (sectionId: string, fieldId: string, value: string | boolean | number) => {
    setSettings((prev) => {
      const newSettings = { ...prev };
      if (sectionId === 'subscriptionPlans') {
        const [plan, field] = fieldId.split('.');
        (newSettings.subscriptionPlans as any)[plan][field] = value;
      } else if (sectionId === 'features') {
        (newSettings.features as any)[fieldId] = value;
      } else if (sectionId === 'systemNotifications') {
        (newSettings.systemNotifications as any)[fieldId] = value;
      }
      return newSettings;
    });
  };

  const sections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      icon: RefreshCw,
      fields: [
        {
          id: 'systemNotifications.maintenanceMode',
          label: 'Maintenance Mode',
          type: 'toggle',
          value: settings.systemNotifications.maintenanceMode,
          description: 'Enable maintenance mode to prevent user access during updates',
        },
        {
          id: 'systemNotifications.maintenanceMessage',
          label: 'Maintenance Message',
          type: 'text',
          value: settings.systemNotifications.maintenanceMessage,
          description: 'Message to display during maintenance',
        },
        {
          id: 'systemNotifications.systemAlert',
          label: 'System Alert',
          type: 'text',
          value: settings.systemNotifications.systemAlert,
          description: 'Display a system-wide alert message',
        },
      ],
    },
    {
      id: 'subscriptionPlans',
      title: 'Subscription Plans',
      icon: Cloud,
      fields: [
        {
          id: 'basic.enabled',
          label: 'Basic Plan',
          type: 'toggle',
          value: settings.subscriptionPlans.basic.enabled,
          description: 'Enable/disable basic subscription plan',
        },
        {
          id: 'basic.price',
          label: 'Basic Plan Price',
          type: 'number',
          value: settings.subscriptionPlans.basic.price,
          description: 'Monthly price for basic plan',
        },
        {
          id: 'professional.enabled',
          label: 'Professional Plan',
          type: 'toggle',
          value: settings.subscriptionPlans.professional.enabled,
        },
        {
          id: 'professional.price',
          label: 'Professional Plan Price',
          type: 'number',
          value: settings.subscriptionPlans.professional.price,
        },
        {
          id: 'enterprise.enabled',
          label: 'Enterprise Plan',
          type: 'toggle',
          value: settings.subscriptionPlans.enterprise.enabled,
        },
        {
          id: 'enterprise.price',
          label: 'Enterprise Plan Price',
          type: 'number',
          value: settings.subscriptionPlans.enterprise.price,
        },
      ],
    },
    {
      id: 'features',
      title: 'Feature Settings',
      icon: Shield,
      fields: [
        {
          id: 'userInvitations',
          label: 'User Invitations',
          type: 'toggle',
          value: settings.features.userInvitations,
          description: 'Allow users to invite others to their organization',
        },
        {
          id: 'apiAccess',
          label: 'API Access',
          type: 'toggle',
          value: settings.features.apiAccess,
          description: 'Enable API access for organizations',
        },
        {
          id: 'customBranding',
          label: 'Custom Branding',
          type: 'toggle',
          value: settings.features.customBranding,
          description: 'Allow organizations to customize their branding',
        },
        {
          id: 'advancedAnalytics',
          label: 'Advanced Analytics',
          type: 'toggle',
          value: settings.features.advancedAnalytics,
          description: 'Enable advanced analytics features',
        },
      ],
    },
  ];

  const renderField = (field: SettingsSection['fields'][0], sectionId: string) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            value={field.value as string}
            onChange={(e) => handleFieldChange(sectionId, field.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={field.value as number}
            onChange={(e) => handleFieldChange(sectionId, field.id, parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        );
      case 'toggle':
        return (
          <div className="mt-1">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={field.value as boolean}
                onChange={(e) => handleFieldChange(sectionId, field.id, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        );
      case 'select':
        return (
          <select
            id={field.id}
            value={field.value as string}
            onChange={(e) => handleFieldChange(sectionId, field.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Platform Settings</h1>
        <p className="text-gray-600">
          Configure and manage platform-wide settings
        </p>
      </div>

      {notification && (
        <div className={`p-4 mb-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === section.id
                  ? 'bg-primary text-white'
                  : 'text-gray-900 hover:bg-gray-100'
              }`}
            >
              <section.icon className="mr-3 h-5 w-5" />
              {section.title}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            {sections
              .filter((section) => section.id === activeTab)
              .map((section) => (
                <div key={section.id} className="p-6">
                  <h2 className="text-lg font-medium mb-6">{section.title}</h2>
                  <div className="space-y-6">
                    {section.fields.map((field) => (
                      <div key={field.id}>
                        <label
                          htmlFor={field.id}
                          className="block text-sm font-medium text-gray-700"
                        >
                          {field.label}
                        </label>
                        {renderField(field, section.id)}
                        {field.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {field.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;

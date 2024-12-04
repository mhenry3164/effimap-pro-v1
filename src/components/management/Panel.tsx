// src/components/management/Panel.tsx

import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import BranchForm from './BranchForm';
import RepresentativeForm from './RepresentativeForm';
import TerritoryForm from '../territory/TerritoryForm';
import LoadingScreen from '../shared/LoadingScreen';
import { Settings, Users, Building2, Map, Database } from 'lucide-react';

interface ManagementPanelProps {
  onClose: () => void;
}

const navigationItems = [
  {
    id: 'branches',
    label: 'Branch Management',
    icon: <Building2 className="w-4 h-4" />,
    description: 'Manage company branches and locations'
  },
  {
    id: 'representatives',
    label: 'Representative Management',
    icon: <Users className="w-4 h-4" />,
    description: 'Manage sales representatives and staff'
  },
  {
    id: 'territories',
    label: 'Territory Management',
    icon: <Map className="w-4 h-4" />,
    description: 'Define and assign sales territories'
  },
  {
    id: 'data',
    label: 'Data Management',
    icon: <Database className="w-4 h-4" />,
    description: 'Import and export system data'
  },
  {
    id: 'settings',
    label: 'System Settings',
    icon: <Settings className="w-4 h-4" />,
    description: 'Configure application settings'
  }
];

export const ManagementPanel: React.FC<ManagementPanelProps> = ({ onClose }) => {
  const {
    territories,
    branches,
    representatives,
    loading,
    addTerritory,
    updateTerritory,
    deleteTerritory,
    addBranch,
    updateBranch,
    deleteBranch,
    addRepresentative,
    updateRepresentative,
    deleteRepresentative,
    fetchTerritories,
    fetchBranches,
    fetchRepresentatives,
  } = useStore();

  const [activeSection, setActiveSection] = useState('territories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedRepresentative, setSelectedRepresentative] = useState<Representative | null>(null);
  const [showTerritoryForm, setShowTerritoryForm] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showRepresentativeForm, setShowRepresentativeForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchTerritories(),
          fetchBranches(),
          fetchRepresentatives()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [fetchTerritories, fetchBranches, fetchRepresentatives]);

  const handleDelete = async (type: 'territory' | 'branch' | 'representative', id: string) => {
    try {
      switch (type) {
        case 'territory':
          await deleteTerritory(id);
          setSelectedTerritory(null);
          break;
        case 'branch':
          await deleteBranch(id);
          setSelectedBranch(null);
          break;
        case 'representative':
          await deleteRepresentative(id);
          setSelectedRepresentative(null);
          break;
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Management Panel</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <nav className="px-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-4 py-3 mb-1 rounded-lg text-left transition-colors ${
                activeSection === item.id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">
              {navigationItems.find(item => item.id === activeSection)?.label}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-4 py-2 border rounded-lg w-64"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-2 top-3" />
              </div>
              {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Territories Section */}
          {activeSection === 'territories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowTerritoryForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Territory
                </button>
              </div>
              
              <div className="grid gap-4">
                {territories.map(territory => (
                  <div
                    key={territory.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium">{territory.name}</h3>
                      <p className="text-sm text-gray-500">
                        {territory.branchId ? `Branch: ${branches.find(b => b.id === territory.branchId)?.name}` : 'No Branch Assigned'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTerritory(territory);
                          setShowTerritoryForm(true);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-full"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete('territory', territory.id)}
                        className="p-2 hover:bg-red-100 rounded-full"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Branches Section */}
          {activeSection === 'branches' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowBranchForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Branch
                </button>
              </div>
              
              <div className="grid gap-4">
                {branches.map(branch => (
                  <div
                    key={branch.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium">{branch.name}</h3>
                      <p className="text-sm text-gray-500">{branch.address}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBranch(branch);
                          setShowBranchForm(true);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-full"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete('branch', branch.id)}
                        className="p-2 hover:bg-red-100 rounded-full"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Representatives Section */}
          {activeSection === 'representatives' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowRepresentativeForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Representative
                </button>
              </div>
              
              <div className="grid gap-4">
                {representatives.map(representative => (
                  <div
                    key={representative.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium">{representative.name}</h3>
                      <p className="text-sm text-gray-500">
                        {representative.branchId 
                          ? `Branch: ${branches.find(b => b.id === representative.branchId)?.name}` 
                          : 'No Branch Assigned'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRepresentative(representative);
                          setShowRepresentativeForm(true);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-full"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete('representative', representative.id)}
                        className="p-2 hover:bg-red-100 rounded-full"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Management Section */}
          {activeSection === 'data' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Import Data</h3>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </button>
              </div>
              
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Export Data</h3>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Reports
                </button>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Map Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Default Map Center</span>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Configure
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Default Zoom Level</span>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Configure
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Boundary Colors</span>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Configure
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Application Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Default Territory Type</span>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Configure
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Auto-Save Interval</span>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Configure
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Data Refresh Rate</span>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Configure
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-medium mb-4">User Interface</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Theme Settings</span>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Configure
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Panel Layout</span>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Configure
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Toolbar Position</span>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Configure
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-medium mb-4">System Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Version</span>
                      <span className="text-sm text-gray-900">1.0.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="text-sm text-gray-900">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Storage Usage</span>
                      <span className="text-sm text-gray-900">0 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forms */}
      {showTerritoryForm && (
        <TerritoryForm
          territory={selectedTerritory}
          onClose={() => {
            setShowTerritoryForm(false);
            setSelectedTerritory(null);
          }}
          onSubmit={async (data) => {
            try {
              if (selectedTerritory) {
                await updateTerritory(selectedTerritory.id, data);
              } else {
                await addTerritory(data);
              }
              setShowTerritoryForm(false);
              setSelectedTerritory(null);
            } catch (error) {
              console.error('Error saving territory:', error);
            }
          }}
        />
      )}

      {showBranchForm && (
        <BranchForm
          branch={selectedBranch}
          onClose={() => {
            setShowBranchForm(false);
            setSelectedBranch(null);
          }}
          onSubmit={async (data) => {
            try {
              if (selectedBranch) {
                await updateBranch(selectedBranch.id, data);
              } else {
                await addBranch(data);
              }
              setShowBranchForm(false);
              setSelectedBranch(null);
            } catch (error) {
              console.error('Error saving branch:', error);
            }
          }}
        />
      )}

      {showRepresentativeForm && (
        <RepresentativeForm
          representative={selectedRepresentative}
          onClose={() => {
            setShowRepresentativeForm(false);
            setSelectedRepresentative(null);
          }}
          onSubmit={async (data) => {
            try {
              if (selectedRepresentative) {
                await updateRepresentative(selectedRepresentative.id, data);
              } else {
                await addRepresentative(data);
              }
              setShowRepresentativeForm(false);
              setSelectedRepresentative(null);
            } catch (error) {
              console.error('Error saving representative:', error);
            }
          }}
        />
      )}
    </div>
  );
};

export default ManagementPanel;

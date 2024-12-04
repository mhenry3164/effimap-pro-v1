import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash, MapPin } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useTenant } from '../../../contexts/TenantContext';

interface Branch {
  id: string;
  name: string;
  address: string;
  managerName?: string;
  employeeCount?: number;
  territories?: number;
}

const BranchList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement branch fetching
    const fetchBranches = async () => {
      try {
        // Temporary mock data
        const mockBranches: Branch[] = [
          {
            id: '1',
            name: 'Main Branch',
            address: '123 Main St, City, State',
            managerName: 'John Doe',
            employeeCount: 15,
            territories: 3
          },
          {
            id: '2',
            name: 'Downtown Office',
            address: '456 Market St, City, State',
            managerName: 'Jane Smith',
            employeeCount: 8,
            territories: 2
          }
        ];
        setBranches(mockBranches);
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const canManageBranches = user?.organizationRoles?.includes('orgAdmin') ||
                           user?.organizationRoles?.includes('divisionAdmin');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Branches</h1>
        {canManageBranches && (
          <button
            onClick={() => navigate('/branches/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Branch</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">{branch.name}</h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{branch.address}</span>
                  </div>
                </div>
                {canManageBranches && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/branches/${branch.id}/edit`)}
                      className="p-1 text-gray-600 hover:text-primary transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-red-500 transition-colors">
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Manager</p>
                  <p className="font-medium">{branch.managerName || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employees</p>
                  <p className="font-medium">{branch.employeeCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Territories</p>
                  <p className="font-medium">{branch.territories || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchList;

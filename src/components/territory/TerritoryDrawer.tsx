import React, { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Territory, TerritoryType, NewTerritory } from '../../types/territory';
import { useAuth } from '../../hooks/useAuth';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useStore } from '../../store';

interface TerritoryDrawerProps {
  territory: Territory | null;
  onClose: () => void;
  onSave: (territory: NewTerritory) => Promise<void>;
}

const DEFAULT_TERRITORY_STYLE = {
  fillColor: '#3B82F6',
  strokeColor: '#2563EB',
  fillOpacity: 0.05,
  strokeOpacity: 1,
  strokeWeight: 2
};

const TerritoryDrawer: React.FC<TerritoryDrawerProps> = ({
  territory,
  onClose,
  onSave
}) => {
  const { user } = useAuth();
  const { branches, representatives, fetchBranches, fetchRepresentatives } = useStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(territory?.name || '');
  const [type, setType] = useState<TerritoryType>(territory?.type || 'branch');
  const [branchId, setBranchId] = useState<string | null>(territory?.branchId || null);
  const [representativeId, setRepresentativeId] = useState<string | null>(territory?.representativeId || null);

  useEffect(() => {
    void fetchBranches();
    void fetchRepresentatives();
  }, [fetchBranches, fetchRepresentatives]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!name.trim()) {
        setError('Territory name is required');
        return;
      }

      const now = Timestamp.now();
      const territoryData: NewTerritory = {
        name: name.trim(),
        code: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        type,
        branchId: type === 'branch' ? branchId : null,
        representativeId: type === 'representative' ? representativeId : null,
        boundary: {
          coordinates: [],
          style: DEFAULT_TERRITORY_STYLE,
          type: 'Polygon'
        },
        coordinates: [],
        boundaries: {
          zipCodes: [],
          counties: [],
          cities: []
        },
        metrics: {
          area: 0,
          perimeter: 0,
          lastCalculated: now
        },
        status: 'active',
        metadata: {
          createdBy: user?.uid || '',
          updatedBy: user?.uid || '',
          version: 1,
        }
      };

      await onSave(territoryData);
      onClose();
    } catch (error) {
      console.error('Error saving territory:', error);
      setError('Failed to save territory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {territory ? 'Edit Territory' : 'New Territory'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void handleSave(); }} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Territory Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter territory name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Territory Type</Label>
          <Select value={type} onValueChange={(value: TerritoryType) => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="branch">Branch</SelectItem>
              <SelectItem value="representative">Representative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type === 'branch' && (
          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Select value={branchId || ''} onValueChange={setBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {type === 'representative' && (
          <div className="space-y-2">
            <Label htmlFor="representative">Representative</Label>
            <Select value={representativeId || ''} onValueChange={setRepresentativeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select representative" />
              </SelectTrigger>
              <SelectContent>
                {representatives.map(rep => (
                  <SelectItem key={rep.id} value={rep.id}>
                    {rep.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Territory'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TerritoryDrawer;
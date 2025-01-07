import React, { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '../ui/select';
import { branchService } from '../../services/branchService';
import { representativeService } from '../../services/representativeService';
import { territoryTypeService, TerritoryTypeDefinition } from '../../services/territoryTypeService';
import { X } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../hooks/useAuth';
import { TerritoryType, TerritoryPoint, NewTerritory, TerritoryStyle } from '../../types/territory';
import { useTenant } from '../../contexts/TenantContext';
import { Timestamp } from 'firebase/firestore';

interface TerritoryFormProps {
  onSave: (formData: NewTerritory) => Promise<void>;
  onClose: () => void;
  onSuccess?: () => void;
  territoryStyle?: TerritoryStyle;
}

interface TerritoryFormData {
  name: string;
  description?: string;
  type: string;
  branchId?: string;
  representativeId?: string;
  metadata?: {
    [key: string]: string;
  };
}

interface Branch {
  id: string;
  name: string;
}

interface Representative {
  id: string;
  name: string;
  branchId: string;
}

const TerritoryForm: React.FC<TerritoryFormProps> = ({
  onSave,
  onClose,
  onSuccess,
  territoryStyle,
}) => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TerritoryFormData>({
    name: '',
    type: '',
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [territoryTypes, setTerritoryTypes] = useState<TerritoryTypeDefinition[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!tenant?.id) {
        console.log('No tenant ID available');
        setTerritoryTypes([]);
        setBranches([]);
        return;
      }

      try {
        console.log('Loading data for tenant:', tenant.id);
        setLoading(true);
        
        // Load territory types first
        const typesData = await territoryTypeService.getAll(tenant.id);
        console.log('Loaded territory types:', typesData);

        // Remove any duplicate types by code
        const uniqueTypes = Array.from(
          new Map(typesData.map(type => [type.code, type])).values()
        );

        // Sort territory types: categories first, then system types, then others
        const sortedTypes = uniqueTypes.sort((a, b) => {
          if (a.isCategory && !b.isCategory) return -1;
          if (!a.isCategory && b.isCategory) return 1;
          if (a.isSystem && !b.isSystem) return -1;
          if (!a.isSystem && b.isSystem) return 1;
          return a.name.localeCompare(b.name);
        });

        setTerritoryTypes(sortedTypes);

        // Then load branches
        const branchesData = await branchService.getAll(tenant.id);
        console.log('Loaded branches:', branchesData);

        // Remove any duplicate branches by id
        const uniqueBranches = Array.from(
          new Map(branchesData.map(branch => [branch.id, branch])).values()
        );
        setBranches(uniqueBranches);

      } catch (error) {
        console.error('Error loading form data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load territory types. Please try refreshing the page.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenant?.id, toast]);

  useEffect(() => {
    const loadRepresentatives = async () => {
      if (!tenant?.id || formData.type !== 'representative' || !formData.branchId) {
        setRepresentatives([]);
        return;
      }

      try {
        const repsData = await representativeService.getRepresentativesByBranch(tenant.id, formData.branchId);
        // Remove any duplicate representatives by id
        const uniqueReps = Array.from(
          new Map(repsData.map(rep => [rep.id, rep])).values()
        );
        setRepresentatives(uniqueReps);
      } catch (error) {
        console.error('Error loading representatives:', error);
        toast({
          title: 'Error',
          description: 'Failed to load representatives',
          variant: 'destructive',
        });
      }
    };

    loadRepresentatives();
  }, [tenant?.id, formData.type, formData.branchId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;

    setLoading(true);
    try {
      const selectedType = territoryTypes.find(t => t.code === formData.type);
      
      const territory: NewTerritory = {
        ...formData,
        code: `${formData.type}-${Date.now()}`, // Generate a unique code
        boundary: {
          type: 'Polygon',
          coordinates: [],
          style: {
            strokeColor: selectedType?.color || '#2563EB',
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: selectedType?.color || '#3B82F6',
            fillOpacity: 0.35
          }
        },
        createdBy: user?.uid || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'active',
        metadata: {
          ...formData.metadata,
          typeColor: selectedType?.color,
          typeDescription: selectedType?.description,
        },
      };

      await onSave(territory);
      onSuccess?.();
      toast({
        title: 'Success',
        description: 'Territory saved successfully',
      });
      onClose();
    } catch (error) {
      console.error('Error saving territory:', error);
      toast({
        title: 'Error',
        description: 'Failed to save territory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTerritoryTypes = () => {
    if (loading) {
      return <div>Loading territory types...</div>;
    }

    if (territoryTypes.length === 0) {
      return <div>No territory types available</div>;
    }

    return (
      <Select
        value={formData.type}
        onValueChange={(value) => setFormData({ ...formData, type: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {/* Categories */}
          {territoryTypes.filter(type => type.isCategory).map(category => (
            <SelectGroup key={`category-${category.code}`}>
              <SelectLabel>{category.name}</SelectLabel>
              {territoryTypes
                .filter(type => type.parentType === category.code)
                .map(type => (
                  <SelectItem key={`type-${type.code}`} value={type.code}>
                    {type.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          ))}

          {/* System Types */}
          <SelectGroup key="system-types">
            <SelectLabel>System Types</SelectLabel>
            {territoryTypes
              .filter(type => type.isSystem && !type.isCategory)
              .map(type => (
                <SelectItem key={`system-${type.code}`} value={type.code}>
                  {type.name}
                </SelectItem>
              ))}
          </SelectGroup>

          {/* Other Types */}
          {territoryTypes.filter(type => !type.isSystem && !type.isCategory && !type.parentType).length > 0 && (
            <SelectGroup key="other-types">
              <SelectLabel>Other Types</SelectLabel>
              {territoryTypes
                .filter(type => !type.isSystem && !type.isCategory && !type.parentType)
                .map(type => (
                  <SelectItem key={`other-${type.code}`} value={type.code}>
                    {type.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Territory Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Territory Type</Label>
        {renderTerritoryTypes()}
      </div>

      {/* Conditional Fields based on Type */}
      {formData.type === 'branch' && (
        <div className="space-y-2">
          <Label htmlFor="branchId">Branch</Label>
          <Select
            value={formData.branchId}
            onValueChange={(value) => setFormData({ ...formData, branchId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={`branch-${branch.id}`} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.type === 'representative' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="branchId">Branch</Label>
            <Select
              value={formData.branchId}
              onValueChange={(value) => {
                setFormData({ 
                  ...formData, 
                  branchId: value,
                  representativeId: undefined // Clear rep when branch changes
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={`branch-${branch.id}`} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Representative Selection - Only show if branch is selected */}
          {formData.branchId && (
            <div className="space-y-2">
              <Label htmlFor="representativeId">Representative</Label>
              <Select
                value={formData.representativeId}
                onValueChange={(value) => setFormData({ ...formData, representativeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select representative" />
                </SelectTrigger>
                <SelectContent>
                  {representatives.map((rep) => (
                    <SelectItem key={`rep-${rep.id}`} value={rep.id}>
                      {rep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Territory'}
        </Button>
      </div>
    </form>
  );
};

export { TerritoryForm };
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
import { TerritoryType, TerritoryPoint, NewTerritory } from '../../types/territory';
import { useTenant } from '../../contexts/TenantContext';
import { Timestamp } from 'firebase/firestore';

interface TerritoryFormProps {
  coordinates: TerritoryPoint[];
  onSave: (formData: NewTerritory) => Promise<void>;
  onClose: () => void;
  onSuccess?: () => void;
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
  coordinates,
  onSave,
  onClose,
  onSuccess,
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
    if (tenant?.id) {
      loadData();
    }
  }, [tenant?.id]);

  useEffect(() => {
    if (tenant?.id && formData.type === 'representative' && formData.branchId) {
      loadRepresentatives(formData.branchId);
    } else {
      setRepresentatives([]);
    }
  }, [tenant?.id, formData.type, formData.branchId]);

  const loadData = async () => {
    try {
      const [branchesData, typesData] = await Promise.all([
        branchService.getAll(tenant!.id),
        territoryTypeService.getAll(tenant!.id),
      ]);

      setBranches(branchesData);
      setTerritoryTypes(typesData);
    } catch (error) {
      console.error('Error loading form data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load form data',
        variant: 'destructive',
      });
    }
  };

  const loadRepresentatives = async (branchId: string) => {
    try {
      const repsData = await representativeService.getRepresentativesByBranch(tenant!.id, branchId);
      setRepresentatives(repsData);
    } catch (error) {
      console.error('Error loading representatives:', error);
      toast({
        title: 'Error',
        description: 'Failed to load representatives',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;

    setLoading(true);
    try {
      const selectedType = territoryTypes.find(t => t.code === formData.type);
      
      const territory: NewTerritory = {
        ...formData,
        coordinates,
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
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {/* System Types */}
            <SelectGroup>
              <SelectLabel>System Types</SelectLabel>
              {territoryTypes
                .filter(type => type.isSystem)
                .filter((type, index, self) => 
                  index === self.findIndex(t => t.code === type.code)
                )
                .map(type => (
                  <SelectItem
                    key={`system-${type.code}`}
                    value={type.code}
                  >
                    {type.name}
                  </SelectItem>
                ))}
            </SelectGroup>

            {/* Category Types and their children */}
            {territoryTypes
              .filter(type => type.isCategory && !type.isSystem)
              .filter((type, index, self) => 
                index === self.findIndex(t => t.code === type.code)
              )
              .map(category => (
                <SelectGroup key={`category-${category.code}`}>
                  <SelectLabel>{category.name}</SelectLabel>
                  {territoryTypes
                    .filter(type => type.parentType === category.code)
                    .filter((type, index, self) => 
                      index === self.findIndex(t => t.code === type.code)
                    )
                    .map(type => (
                      <SelectItem
                        key={`child-${type.code}`}
                        value={type.code}
                        className="pl-6"
                      >
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              ))}

            {/* Standalone Types */}
            {territoryTypes
              .filter(type => !type.isSystem && !type.isCategory && !type.parentType)
              .filter((type, index, self) => 
                index === self.findIndex(t => t.code === type.code)
              )
              .length > 0 && (
              <SelectGroup>
                <SelectLabel>Other Types</SelectLabel>
                {territoryTypes
                  .filter(type => !type.isSystem && !type.isCategory && !type.parentType)
                  .filter((type, index, self) => 
                    index === self.findIndex(t => t.code === type.code)
                  )
                  .map(type => (
                    <SelectItem
                      key={`standalone-${type.code}`}
                      value={type.code}
                    >
                      {type.name}
                    </SelectItem>
                  ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
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
                <SelectItem key={branch.id} value={branch.id}>
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
                  <SelectItem key={branch.id} value={branch.id}>
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
                    <SelectItem key={rep.id} value={rep.id}>
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
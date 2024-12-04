import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { branchService } from '../../../services/branchService';
import { Branch, BranchInput } from '../../../types/branch';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MapPin
} from 'lucide-react';

const BranchList: React.FC = () => {
  const { user, tenant } = useStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [formData, setFormData] = useState<BranchInput>({
    code: '',
    name: '',
    status: 'active',
    divisionId: '',
    manager: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    contact: {
      email: '',
      phone: ''
    },
    location: {
      latitude: 0,
      longitude: 0
    }
  });

  useEffect(() => {
    if (tenant?.id) {
      loadBranches();
    }
  }, [tenant?.id]);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const data = await branchService.getAll(tenant!.id);
      setBranches(data);
    } catch (error) {
      toast.error('Failed to load branches');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (branchId: string) => {
    try {
      await branchService.delete(tenant!.id, branchId);
      toast.success('Branch deleted successfully');
      loadBranches();
    } catch (error) {
      toast.error('Failed to delete branch');
      console.error(error);
    }
  };

  const handleAddBranch = () => {
    setSelectedBranch(null);
    setFormData({
      code: '',
      name: '',
      status: 'active',
      divisionId: '',
      manager: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      contact: {
        email: '',
        phone: ''
      },
      location: {
        latitude: 0,
        longitude: 0
      }
    });
    setOpenDialog(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      code: branch.code,
      name: branch.name,
      status: branch.status,
      divisionId: branch.divisionId,
      manager: branch.manager,
      address: branch.address,
      contact: branch.contact,
      location: branch.location
    });
    setOpenDialog(true);
  };

  const handleSaveBranch = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      if (selectedBranch) {
        await branchService.update(tenant!.id, selectedBranch.id, formData);
        toast.success('Branch updated');
      } else {
        await branchService.create(tenant!.id, formData);
        toast.success('Branch created');
      }
      
      loadBranches();
      setOpenDialog(false);
    } catch (error) {
      toast.error(selectedBranch ? 'Failed to update branch' : 'Failed to create branch');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {!branches.length ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Branches</h1>
            <Button onClick={handleAddBranch} className="gap-2">
              <Plus className="h-4 w-4" />
              New Branch
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
              <MapPin className="h-12 w-12 mb-4" />
              <p>No branches found</p>
              <p className="text-sm">Add your first branch to get started</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Branches</h1>
            <Button onClick={handleAddBranch} className="gap-2">
              <Plus className="h-4 w-4" />
              New Branch
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <Card key={branch.id} className="overflow-hidden">
                <CardHeader className="border-b bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{branch.name || 'Unnamed Branch'}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditBranch(branch)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(branch.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {branch.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm">{branch.address.street || 'No street address'}</p>
                        <p className="text-sm text-muted-foreground">
                          {[
                            branch.address.city,
                            branch.address.state,
                            branch.address.zipCode
                          ].filter(Boolean).join(', ') || 'No address details'}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Manager</p>
                      <p className="text-sm text-muted-foreground">{branch.manager || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm text-muted-foreground capitalize">{branch.status || 'Unknown'}</p>
                    </div>
                    {branch.contact && (
                      <div>
                        <p className="text-sm font-medium">Contact</p>
                        <p className="text-sm text-muted-foreground">{branch.contact.phone || 'No phone'}</p>
                        <p className="text-sm text-muted-foreground">{branch.contact.email || 'No email'}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {openDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedBranch ? 'Edit Branch' : 'New Branch'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSaveBranch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Code</label>
                  <input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Branch code"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Branch name"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Manager Email</label>
                  <input
                    value={formData.manager}
                    onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                    placeholder="Manager email"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Address</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Street</label>
                    <input
                      value={formData.address.street}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      placeholder="Street address"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">City</label>
                    <input
                      value={formData.address.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      placeholder="City"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">State</label>
                    <input
                      value={formData.address.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      placeholder="State"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">ZIP Code</label>
                    <input
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, zipCode: e.target.value }
                      }))}
                      placeholder="ZIP code"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input
                      value={formData.contact.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value }
                      }))}
                      placeholder="Contact email"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <input
                      value={formData.contact.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value }
                      }))}
                      placeholder="Contact phone"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Location</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.location.latitude}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, latitude: parseFloat(e.target.value) }
                      }))}
                      placeholder="Latitude"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.location.longitude}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, longitude: parseFloat(e.target.value) }
                      }))}
                      placeholder="Longitude"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedBranch ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BranchList;

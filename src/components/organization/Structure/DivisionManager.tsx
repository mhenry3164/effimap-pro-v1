import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { divisionService } from '../../../services/divisionService';
import { branchService } from '../../../services/branchService';
import { representativeService } from '../../../services/representativeService';
import { Division, DivisionInput } from '../../../types/division';
import { Branch, BranchInput } from '../../../types/branch';
import { Representative, RepresentativeInput } from '../../../types/representative';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
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
  UserPlus,
  Building2
} from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';

const DEFAULT_BRANCH_DATA: BranchInput = {
  code: '',
  name: '',
  divisionId: '',
  status: 'active',
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
};

const DEFAULT_REP_DATA: RepresentativeInput = {
  displayName: '',
  email: '',
  divisionId: '',
  organizationRoles: ['representative'],
  permissions: ['view']
};

const DivisionManager: React.FC = () => {
  const { user, tenant } = useStore();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [branches, setBranches] = useState<{ [key: string]: Branch[] }>({});
  const [representatives, setRepresentatives] = useState<{ [key: string]: Representative[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState<{ [key: string]: boolean }>({});
  const [isLoadingReps, setIsLoadingReps] = useState<{ [key: string]: boolean }>({});
  const [openDivisionDialog, setOpenDivisionDialog] = useState(false);
  const [openBranchDialog, setOpenBranchDialog] = useState(false);
  const [openRepDialog, setOpenRepDialog] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [expandedDivisions, setExpandedDivisions] = useState<string[]>([]);
  const [expandedBranches, setExpandedBranches] = useState<string[]>([]);
  const [divisionFormData, setDivisionFormData] = useState<DivisionInput>({
    code: '',
    name: '',
    status: 'active'
  });
  const [branchFormData, setBranchFormData] = useState<BranchInput>(DEFAULT_BRANCH_DATA);
  const [repFormData, setRepFormData] = useState<RepresentativeInput>(DEFAULT_REP_DATA);

  useEffect(() => {
    if (tenant?.id) {
      loadDivisions();
    }
  }, [tenant?.id]);

  const loadDivisions = async () => {
    try {
      setIsLoading(true);
      const data = await divisionService.getAll(tenant!.id);
      setDivisions(data);
    } catch (error) {
      toast.error('Failed to load divisions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBranches = async (divisionId: string) => {
    try {
      setIsLoadingBranches(prev => ({ ...prev, [divisionId]: true }));
      const branchList = await branchService.getByDivision(tenant!.id, divisionId);
      setBranches(prev => ({ ...prev, [divisionId]: branchList }));
    } catch (error) {
      toast.error('Failed to load branches');
      console.error(error);
    } finally {
      setIsLoadingBranches(prev => ({ ...prev, [divisionId]: false }));
    }
  };

  const loadRepresentatives = async (branchId: string) => {
    try {
      setIsLoadingReps(prev => ({ ...prev, [branchId]: true }));
      const reps = await representativeService.getByBranchId(tenant!.id, branchId);
      setRepresentatives(prev => ({ ...prev, [branchId]: reps }));
    } catch (error) {
      toast.error('Failed to load representatives');
      console.error(error);
    } finally {
      setIsLoadingReps(prev => ({ ...prev, [branchId]: false }));
    }
  };

  const handleAddDivision = () => {
    setSelectedDivision(null);
    setDivisionFormData({
      code: '',
      name: '',
      status: 'active'
    });
    setOpenDivisionDialog(true);
  };

  const handleAddBranch = (division: Division) => {
    setSelectedDivision(division);
    setSelectedBranch(null);
    setBranchFormData({
      ...DEFAULT_BRANCH_DATA,
      divisionId: division.id
    });
    setOpenBranchDialog(true);
  };

  const handleAddRepresentative = (branch: Branch) => {
    setSelectedBranch(branch);
    setRepFormData({
      ...DEFAULT_REP_DATA,
      divisionId: branch.divisionId
    });
    setOpenRepDialog(true);
  };

  const handleEditDivision = (division: Division) => {
    setSelectedDivision(division);
    setDivisionFormData({
      code: division.code,
      name: division.name,
      status: division.status
    });
    setOpenDivisionDialog(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setBranchFormData({
      code: branch.code,
      name: branch.name,
      divisionId: branch.divisionId,
      status: branch.status,
      manager: branch.manager,
      address: branch.address || DEFAULT_BRANCH_DATA.address,
      contact: branch.contact || DEFAULT_BRANCH_DATA.contact,
      location: branch.location || DEFAULT_BRANCH_DATA.location
    });
    setOpenBranchDialog(true);
  };

  const handleDeleteDivision = async (division: Division) => {
    if (!confirm('Are you sure you want to delete this division?')) return;
    
    try {
      await divisionService.delete(tenant!.id, division.id);
      toast.success('Division deleted');
      loadDivisions();
    } catch (error) {
      toast.error('Failed to delete division');
      console.error(error);
    }
  };

  const handleDeleteBranch = async (branch: Branch) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    
    try {
      await branchService.delete(tenant!.id, branch.id);
      toast.success('Branch deleted');
      loadBranches(branch.divisionId);
    } catch (error) {
      toast.error('Failed to delete branch');
      console.error(error);
    }
  };

  const handleDeleteRepresentative = async (representative: Representative, branchId: string) => {
    if (!confirm('Are you sure you want to delete this representative?')) return;
    
    try {
      await representativeService.delete(tenant!.id, representative.id);
      toast.success('Representative deleted');
      loadRepresentatives(branchId);
    } catch (error) {
      toast.error('Failed to delete representative');
      console.error(error);
    }
  };

  const handleSaveDivision = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      if (selectedDivision) {
        await divisionService.update(tenant!.id, selectedDivision.id, divisionFormData);
        toast.success('Division updated');
      } else {
        await divisionService.create(tenant!.id, divisionFormData);
        toast.success('Division created');
      }
      
      loadDivisions();
      setOpenDivisionDialog(false);
    } catch (error) {
      toast.error(selectedDivision ? 'Failed to update division' : 'Failed to create division');
      console.error(error);
    }
  };

  const handleSaveBranch = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      if (selectedBranch) {
        await branchService.update(tenant!.id, selectedBranch.id, branchFormData);
        toast.success('Branch updated');
      } else {
        await branchService.create(tenant!.id, branchFormData);
        toast.success('Branch created');
      }
      
      loadBranches(branchFormData.divisionId);
      setOpenBranchDialog(false);
    } catch (error) {
      toast.error(selectedBranch ? 'Failed to update branch' : 'Failed to create branch');
      console.error(error);
    }
  };

  const handleSaveRepresentative = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      const timestamp = serverTimestamp();
      const newRepresentative = {
        ...repFormData,
        branchId: selectedBranch!.id,
        tenantId: tenant!.id,
        organizationRoles: repFormData.organizationRoles || DEFAULT_REP_DATA.organizationRoles,
        permissions: repFormData.permissions || DEFAULT_REP_DATA.permissions,
        metadata: {
          createdAt: timestamp,
          createdBy: user!.uid,
          updatedAt: timestamp,
          updatedBy: user!.uid
        }
      };
      
      await representativeService.add(tenant!.id, newRepresentative);
      toast.success('Representative added');
      loadRepresentatives(selectedBranch!.id);
      setOpenRepDialog(false);
    } catch (error) {
      toast.error('Failed to add representative');
      console.error(error);
    }
  };

  const toggleExpandDivision = async (divisionId: string) => {
    const isExpanding = !expandedDivisions.includes(divisionId);
    setExpandedDivisions(prev =>
      prev.includes(divisionId)
        ? prev.filter(id => id !== divisionId)
        : [...prev, divisionId]
    );
    
    if (isExpanding && !branches[divisionId]) {
      await loadBranches(divisionId);
    }
  };

  const toggleExpandBranch = async (branchId: string) => {
    const isExpanding = !expandedBranches.includes(branchId);
    setExpandedBranches(prev =>
      prev.includes(branchId)
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
    
    if (isExpanding && !representatives[branchId]) {
      await loadRepresentatives(branchId);
    }
  };

  if (!tenant) return null;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Organization Structure</h2>
        <Button onClick={handleAddDivision}>
          <Plus className="mr-2 h-4 w-4" />
          Add Division
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Divisions & Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] overflow-y-auto pr-4">
              {divisions.map((division) => (
                <div key={division.id} className="mb-4">
                  <div className="flex items-center p-2 hover:bg-accent rounded-lg group">
                    <button
                      onClick={() => toggleExpandDivision(division.id)}
                      className="p-1 hover:bg-accent rounded-sm"
                    >
                      {expandedDivisions.includes(division.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <span className="flex-1 ml-2 font-medium">{division.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddBranch(division)}
                      >
                        <Building2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDivision(division)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDivision(division)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {expandedDivisions.includes(division.id) && (
                    <div className="ml-8 mt-2">
                      <div className="space-y-2 mb-4 p-4 bg-accent/50 rounded-lg">
                        <div>
                          <span className="font-semibold">Code:</span> {division.code}
                        </div>
                        <div>
                          <span className="font-semibold">Status:</span> {division.status}
                        </div>
                      </div>

                      {isLoadingBranches[division.id] ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : branches[division.id]?.length ? (
                        <div className="space-y-2">
                          {branches[division.id].map((branch) => (
                            <div key={branch.id} className="border rounded-lg">
                              <div className="flex items-center p-2 hover:bg-accent group">
                                <button
                                  onClick={() => toggleExpandBranch(branch.id)}
                                  className="p-1 hover:bg-accent rounded-sm"
                                >
                                  {expandedBranches.includes(branch.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                                <span className="flex-1 ml-2">{branch.name}</span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddRepresentative(branch)}
                                  >
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditBranch(branch)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteBranch(branch)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {expandedBranches.includes(branch.id) && (
                                <div className="ml-8 mt-2 p-4 bg-accent/25 rounded-lg space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="font-semibold">Code:</span> {branch.code}
                                    </div>
                                    <div>
                                      <span className="font-semibold">Status:</span> {branch.status}
                                    </div>
                                    <div>
                                      <span className="font-semibold">Manager:</span> {branch.manager}
                                    </div>
                                    {branch.contact && (
                                      <div>
                                        <span className="font-semibold">Phone:</span> {branch.contact.phone}
                                      </div>
                                    )}
                                    {branch.contact && (
                                      <div className="col-span-2">
                                        <span className="font-semibold">Email:</span> {branch.contact.email}
                                      </div>
                                    )}
                                    {branch.address && (
                                      <div className="col-span-2">
                                        <span className="font-semibold">Address:</span>{' '}
                                        {`${branch.address.street}, ${branch.address.city}, ${branch.address.state} ${branch.address.zipCode}`}
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-lg">Representatives</h4>
                                    {isLoadingReps[branch.id] ? (
                                      <div className="flex justify-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                      </div>
                                    ) : representatives[branch.id]?.length ? (
                                      <div className="space-y-2">
                                        {representatives[branch.id].map((rep) => (
                                          <div key={rep.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                                            <div>
                                              <div className="font-medium">{rep.displayName}</div>
                                              <div className="text-sm text-muted-foreground">{rep.email}</div>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleDeleteRepresentative(rep, branch.id)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-sm text-muted-foreground">
                                        No representatives found
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No branches found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Division Dialog */}
      {openDivisionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDivision ? 'Edit Division' : 'New Division'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenDivisionDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSaveDivision} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Code</label>
                <Input
                  value={divisionFormData.code}
                  onChange={(e) => setDivisionFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Division code"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={divisionFormData.name}
                  onChange={(e) => setDivisionFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Division name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={divisionFormData.status}
                  onChange={(e) => setDivisionFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDivisionDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedDivision ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Dialog */}
      {openBranchDialog && selectedDivision && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedBranch ? 'Edit Branch' : 'New Branch'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenBranchDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSaveBranch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Code</label>
                  <Input
                    value={branchFormData.code}
                    onChange={(e) => setBranchFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Branch code"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={branchFormData.name}
                    onChange={(e) => setBranchFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Branch name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Manager</label>
                  <Input
                    value={branchFormData.manager}
                    onChange={(e) => setBranchFormData(prev => ({ ...prev, manager: e.target.value }))}
                    placeholder="Manager email"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={branchFormData.status}
                    onChange={(e) => setBranchFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Address</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input
                      value={branchFormData.address.street}
                      onChange={(e) => setBranchFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      placeholder="Street address"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      value={branchFormData.address.city}
                      onChange={(e) => setBranchFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      value={branchFormData.address.state}
                      onChange={(e) => setBranchFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      placeholder="State"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={branchFormData.address.zipCode}
                      onChange={(e) => setBranchFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, zipCode: e.target.value }
                      }))}
                      placeholder="ZIP Code"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="email"
                      value={branchFormData.contact.email}
                      onChange={(e) => setBranchFormData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value }
                      }))}
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      value={branchFormData.contact.phone}
                      onChange={(e) => setBranchFormData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value }
                      }))}
                      placeholder="Phone"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenBranchDialog(false)}
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

      {/* Representative Dialog */}
      {openRepDialog && selectedBranch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Representative</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenRepDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSaveRepresentative} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  value={repFormData.displayName}
                  onChange={(e) => setRepFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Representative name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={repFormData.email}
                  onChange={(e) => setRepFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenRepDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Representative
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DivisionManager;

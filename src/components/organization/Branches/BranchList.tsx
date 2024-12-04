import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { branchService } from '../../../services/branchService';
import { Branch } from '../../../types/branch';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MapPin
} from 'lucide-react';

interface BranchListProps {
  onEditBranch: (branch: Branch) => void;
}

const BranchList: React.FC<BranchListProps> = ({ onEditBranch }) => {
  const { user, tenant } = useStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            <Button onClick={() => onEditBranch({} as Branch)} className="gap-2">
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
            <Button onClick={() => onEditBranch({} as Branch)} className="gap-2">
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
                        onClick={() => onEditBranch(branch)}
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
    </>
  );
};

export default BranchList;

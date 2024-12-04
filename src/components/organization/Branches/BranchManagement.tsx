import React, { useState } from 'react';
import BranchList from './BranchList';
import BranchForm from './BranchForm';
import { Branch } from '../../../types/branch';
import { branchService } from '../../../services/branchService';
import { useTenant } from '../../../contexts/TenantContext';
import { toast } from 'react-hot-toast';
import PageLayout from '../../layout/PageLayout';

export default function BranchManagement() {
  const { tenant } = useTenant();
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const handleSubmit = async (data: any) => {
    if (!tenant?.id) return;

    try {
      if (editingBranch) {
        await branchService.update(tenant.id, editingBranch.id, data);
        toast.success('Branch updated successfully');
      } else {
        await branchService.create(tenant.id, data);
        toast.success('Branch created successfully');
      }
      setShowForm(false);
      setEditingBranch(null);
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error(editingBranch ? 'Failed to update branch' : 'Failed to create branch');
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBranch(null);
  };

  return (
    <PageLayout>
      <div className="p-6">
        {showForm ? (
          <BranchForm
            onSubmit={handleSubmit}
            initialData={editingBranch}
            onCancel={handleCancel}
          />
        ) : (
          <BranchList onEditBranch={handleEdit} />
        )}
      </div>
    </PageLayout>
  );
}

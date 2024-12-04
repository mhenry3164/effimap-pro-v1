import React, { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "../../store";
import type { Branch } from "../../types/branch";
import LocationPicker from "../shared/LocationPicker";

interface BranchFormProps {
  branch?: Branch;
  initialCoordinates?: [number, number];
  onClose: () => void;
  onSave: (data: Branch) => Promise<void>;
}

type BranchFormData = Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>;

const BranchForm: React.FC<BranchFormProps> = ({
  onClose,
  branch,
  initialCoordinates,
  onSave
}) => {
  const { addBranch, updateBranch } = useStore();
  const [formData, setFormData] = useState<BranchFormData>({
    name: branch?.name || '',
    address: branch?.address || '',
    contact: {
      name: branch?.contact?.name || '',
      phone: branch?.contact?.phone || '',
      email: branch?.contact?.email || '',
    },
    coordinates: branch?.coordinates || initialCoordinates || [0, 0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (branch) {
        const updatedBranch = {
          ...branch,
          ...formData,
          updatedAt: new Date()
        };
        await updateBranch(branch.id, updatedBranch);
        await onSave(updatedBranch);
      } else {
        const newBranch: Branch = {
          ...formData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await addBranch(newBranch);
        await onSave(newBranch);
      }
      onClose();
    } catch (error) {
      console.error('Error saving branch:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {branch ? 'Edit Branch' : 'Add New Branch'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Branch Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Name
            </label>
            <input
              type="text"
              value={formData.contact.name}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact, name: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.contact.phone}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact, phone: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.contact.email}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact, email: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <LocationPicker
            initialCoordinates={formData.coordinates}
            onCoordinatesChange={(coordinates: [number, number]) => 
              setFormData({ ...formData, coordinates })
            }
            address={formData.address}
            onAddressChange={(address: string) => 
              setFormData({ ...formData, address })
            }
          />

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {branch ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchForm;
import React, { useState, useCallback } from "react";
import { X } from "lucide-react";
import { useStore } from "../../store";
import type { Representative } from "../../types/representative";
import LocationPicker from "../shared/LocationPicker";

interface RepresentativeFormProps {
  representative?: Representative;
  initialCoordinates?: [number, number];
  onClose: () => void;
  onSave: (data: Representative) => Promise<void>;
}

type RepresentativeFormData = Omit<Representative, 'id' | 'createdAt' | 'updatedAt'>;

const RepresentativeForm: React.FC<RepresentativeFormProps> = ({
  onClose,
  representative,
  initialCoordinates,
  onSave
}) => {
  const { addRepresentative, updateRepresentative, branches } = useStore();
  const [formData, setFormData] = useState<RepresentativeFormData>({
    name: representative?.name || '',
    email: representative?.email || '',
    phone: representative?.phone || '',
    branchId: representative?.branchId || '',
    address: representative?.address || '',
    coordinates: representative?.coordinates || initialCoordinates || [0, 0],
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (representative) {
        await updateRepresentative(representative.id, {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        const newRepresentative: Omit<Representative, 'id'> = {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await addRepresentative(newRepresentative);
      }
      
      await onSave({
        ...formData,
        id: representative?.id || crypto.randomUUID(),
        createdAt: representative?.createdAt || new Date(),
        updatedAt: new Date()
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving representative:', error);
      // Here you might want to show an error message to the user
    }
  }, [formData, representative, addRepresentative, updateRepresentative, onSave, onClose]);

  const handleInputChange = useCallback(<T extends keyof RepresentativeFormData>(
    field: T,
    value: RepresentativeFormData[T]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {representative ? 'Edit Representative' : 'New Representative'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">
              Branch
            </label>
            <select
              id="branchId"
              value={formData.branchId}
              onChange={(e) => handleInputChange('branchId', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <LocationPicker
              initialCoordinates={formData.coordinates}
              onCoordinatesChange={(coordinates) => handleInputChange('coordinates', coordinates)}
              address={formData.address}
              onAddressChange={(address) => handleInputChange('address', address)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {representative ? 'Update' : 'Create'} Representative
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepresentativeForm;
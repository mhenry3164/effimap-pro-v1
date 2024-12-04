import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { divisionService } from '../../../services/divisionService';
import { Division, DivisionInput } from '../../../types/division';
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
  Loader2
} from 'lucide-react';

const DivisionManager: React.FC = () => {
  const { user, tenant } = useStore();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [formData, setFormData] = useState<DivisionInput>({
    code: '',
    name: '',
    status: 'active'
  });

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

  const handleAddDivision = () => {
    setSelectedDivision(null);
    setFormData({
      code: '',
      name: '',
      status: 'active'
    });
    setOpenDialog(true);
  };

  const handleEditDivision = (division: Division) => {
    setSelectedDivision(division);
    setFormData({
      code: division.code,
      name: division.name,
      status: division.status
    });
    setOpenDialog(true);
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

  const handleSaveDivision = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      if (selectedDivision) {
        await divisionService.update(tenant!.id, selectedDivision.id, formData);
        toast.success('Division updated');
      } else {
        await divisionService.create(tenant!.id, formData);
        toast.success('Division created');
      }
      
      loadDivisions();
      setOpenDialog(false);
    } catch (error) {
      toast.error(selectedDivision ? 'Failed to update division' : 'Failed to create division');
      console.error(error);
    }
  };

  const toggleExpand = (divisionId: string) => {
    setExpanded(prev =>
      prev.includes(divisionId)
        ? prev.filter(id => id !== divisionId)
        : [...prev, divisionId]
    );
  };

  if (!tenant) return null;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Divisions</h2>
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
            <CardTitle>Division List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] overflow-y-auto pr-4">
              {divisions.map((division) => (
                <div key={division.id} className="mb-2">
                  <div className="flex items-center p-2 hover:bg-accent rounded-lg group">
                    <button
                      onClick={() => toggleExpand(division.id)}
                      className="p-1 hover:bg-accent rounded-sm"
                    >
                      {expanded.includes(division.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <span className="flex-1 ml-2">{division.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                  {expanded.includes(division.id) && (
                    <div className="ml-8 mt-2 p-4 bg-accent/50 rounded-lg space-y-2">
                      <div>
                        <span className="font-semibold">Code:</span> {division.code}
                      </div>
                      <div>
                        <span className="font-semibold">Status:</span> {division.status}
                      </div>
                      <div>
                        <span className="font-semibold">Created:</span>{' '}
                        {division.metadata.createdAt.toDate().toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold">Last Updated:</span>{' '}
                        {division.metadata.updatedAt.toDate().toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {openDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDivision ? 'Edit Division' : 'New Division'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSaveDivision} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Division code"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Division name"
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
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
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
    </div>
  );
};

export default DivisionManager;

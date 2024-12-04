import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useRBAC } from '../../../hooks/useRBAC';
import { useTenant } from '../../../providers/TenantProvider';
import { useGoogleMapsApi } from '../../../hooks/useGoogleMapsApi';

interface BranchFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  onCancel: () => void;
}

const BranchForm: React.FC<BranchFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const { tenant } = useTenant();
  const { hasPermission } = useRBAC();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    managerEmail: initialData?.managerEmail || '',
    status: initialData?.status || 'active',
    address: initialData?.address || '',
    territory: initialData?.territory || '',
    coordinates: initialData?.coordinates || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Get coordinates from address using Google Geocoding
      if (formData.address) {
        const geocoder = new google.maps.Geocoder();
        const result = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: formData.address }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Could not geocode address'));
            }
          });
        });

        // Update formData with coordinates
        const location = (result as google.maps.GeocoderResult).geometry.location;
        const coordinates = [location.lat(), location.lng()];
        await onSubmit({ ...formData, coordinates });
      } else {
        await onSubmit(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const canEditBranch = hasPermission({
    resource: 'branches',
    action: initialData ? 'update' : 'create',
    conditions: initialData ? { branchId: initialData.id } : undefined,
  });

  if (!canEditBranch) {
    return (
      <Alert severity="error">
        You don't have permission to {initialData ? 'edit' : 'create'} branches
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Edit Branch' : 'Add New Branch'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Branch Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Branch Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Manager Email"
              name="managerEmail"
              type="email"
              value={formData.managerEmail}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              helperText="Enter the full address to automatically get coordinates"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Territory</InputLabel>
              <Select
                name="territory"
                value={formData.territory}
                onChange={handleChange}
                label="Territory"
              >
                {/* TODO: Fetch territories from context */}
                <MenuItem value="north">North</MenuItem>
                <MenuItem value="south">South</MenuItem>
                <MenuItem value="east">East</MenuItem>
                <MenuItem value="west">West</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                {initialData ? 'Save Changes' : 'Add Branch'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default BranchForm;

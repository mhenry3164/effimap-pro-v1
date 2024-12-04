import React, { useState, useEffect } from 'react';
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
import { Branch } from '../../../types/branch';

interface BranchFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: Branch | null;
  onCancel: () => void;
}

const BranchForm: React.FC<BranchFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const { tenant } = useTenant();
  const { hasPermission } = useRBAC();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    manager: '',
    status: 'active',
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
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        manager: initialData.manager || '',
        status: initialData.status || 'active',
        address: initialData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        contact: initialData.contact || {
          email: '',
          phone: ''
        },
        location: initialData.location || {
          latitude: 0,
          longitude: 0
        }
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Get coordinates from address using Google Geocoding if address has changed
      if (formData.address.street && formData.address.city) {
        const geocoder = new google.maps.Geocoder();
        const fullAddress = `${formData.address.street}, ${formData.address.city}, ${formData.address.state} ${formData.address.zipCode}`;
        
        const result = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: fullAddress }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Could not geocode address'));
            }
          });
        });

        // Update formData with coordinates
        const location = (result as google.maps.GeocoderResult).geometry.location;
        formData.location = {
          latitude: location.lat(),
          longitude: location.lng()
        };
      }

      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (field.includes('.')) {
        const [section, key] = field.split('.');
        (newData as any)[section] = {
          ...(newData as any)[section],
          [key]: value
        };
      } else {
        (newData as any)[field] = value;
      }
      return newData;
    });
  };

  const canEditBranch = hasPermission({
    resource: 'branches',
    action: initialData ? 'update' : 'create'
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
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Branch Code"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Manager Email"
              value={formData.manager}
              onChange={(e) => handleChange('manager', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Address
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street"
                  value={formData.address.street}
                  onChange={(e) => handleChange('address.street', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.address.city}
                  onChange={(e) => handleChange('address.city', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.address.state}
                  onChange={(e) => handleChange('address.state', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={formData.address.zipCode}
                  onChange={(e) => handleChange('address.zipCode', e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleChange('contact.email', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.contact.phone}
                  onChange={(e) => handleChange('contact.phone', e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
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

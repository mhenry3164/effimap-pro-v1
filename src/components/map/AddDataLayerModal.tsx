import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Upload, InfoOutlined } from '@mui/icons-material';
import { createDataLayer, DataLayerConfig } from '../../services/dataLayerService';
import { useTenant } from '../../hooks/useTenant';
import Papa from 'papaparse';

interface AddDataLayerModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddDataLayerModal({ open, onClose }: AddDataLayerModalProps) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [addressField, setAddressField] = useState('');
  const [tooltipFields, setTooltipFields] = useState<string[]>([]);
  const [markerColor, setMarkerColor] = useState('#1890ff');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv') {
      setError('Please upload a CSV file');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Parse CSV headers
    Papa.parse(selectedFile, {
      header: true,
      preview: 1,
      complete: (results) => {
        if (results.meta.fields) {
          setColumns(results.meta.fields);
          // Try to find an address-like column
          const addressColumn = results.meta.fields.find(field => 
            field.toLowerCase().includes('address') ||
            field.toLowerCase().includes('location')
          );
          if (addressColumn) {
            setAddressField(addressColumn);
          }
        }
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a name for the data layer');
      return;
    }

    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    if (!addressField) {
      setError('Please select the address column');
      return;
    }

    if (!tenant) {
      setError('No tenant context found. Please try logging out and back in.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const config: DataLayerConfig = {
        addressField,
        markerStyle: {
          color: markerColor,
          icon: 'pin',
          size: 24,
          tooltipFields,
        },
      };

      await createDataLayer(tenant.id, name, file, config);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create data layer');
    } finally {
      setIsUploading(false);
    }
  };

  // Show loading state while tenant context is initializing
  if (tenantLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error if tenant context failed to load
  if (tenantError) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Alert severity="error">
            Failed to load tenant context: {tenantError.message}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Data Layer</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              CSV Requirements:
            </Typography>
            <Typography variant="body2">
              • Upload a CSV file with column headers
              <br />
              • Select the column containing addresses
              <br />
              • Choose which columns to show in tooltips
            </Typography>
          </Alert>

          <TextField
            label="Layer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            disabled={isUploading}
          />

          <Box>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="csv-file-upload"
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <label htmlFor="csv-file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
                fullWidth
                disabled={isUploading}
              >
                Upload CSV File
              </Button>
            </label>
            {file && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Selected file: {file.name}
              </Typography>
            )}
          </Box>

          {columns.length > 0 && (
            <>
              <FormControl fullWidth>
                <InputLabel>
                  Address Column
                  <Tooltip title="Select the column containing full addresses">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputLabel>
                <Select
                  label="Address Column"
                  value={addressField}
                  onChange={(e) => setAddressField(e.target.value)}
                  disabled={isUploading}
                >
                  {columns.map(column => (
                    <MenuItem key={column} value={column}>
                      {column}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>
                  Tooltip Fields
                  <Tooltip title="Select fields to display in marker tooltips">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputLabel>
                <Select
                  multiple
                  label="Tooltip Fields"
                  value={tooltipFields}
                  onChange={(e) => setTooltipFields(e.target.value as string[])}
                  disabled={isUploading}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {columns.map(column => (
                    <MenuItem key={column} value={column}>
                      {column}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Marker Color
                </Typography>
                <input
                  type="color"
                  value={markerColor}
                  onChange={(e) => setMarkerColor(e.target.value)}
                  disabled={isUploading}
                  style={{ width: '100%', height: '40px' }}
                />
              </Box>
            </>
          )}

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isUploading || !file || !name.trim() || !addressField}
        >
          {isUploading ? 'Uploading...' : 'Create Layer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { DataLayer, updateDataLayerConfig } from '../../services/dataLayerService';
import { useTenant } from '../../hooks/useTenant';

interface EditDataLayerModalProps {
  open: boolean;
  onClose: () => void;
  dataLayer: DataLayer;
}

export function EditDataLayerModal({ open, onClose, dataLayer }: EditDataLayerModalProps) {
  const [tooltipFields, setTooltipFields] = useState<string[]>(dataLayer.config.markerStyle.tooltipFields);
  const [markerColor, setMarkerColor] = useState(dataLayer.config.markerStyle.color);
  const [markerSize, setMarkerSize] = useState(dataLayer.config.markerStyle.size || 6);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { tenant } = useTenant();

  const handleSubmit = async () => {
    if (!tenant) {
      setError('No tenant context found. Please try logging out and back in.');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      await updateDataLayerConfig(tenant.id, dataLayer.id, {
        markerStyle: {
          ...dataLayer.config.markerStyle,
          color: markerColor,
          tooltipFields,
          size: markerSize,
        },
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update data layer');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Data Layer: {dataLayer.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {dataLayer.columns && dataLayer.columns.length > 0 && (
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
                disabled={isUpdating}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {dataLayer.columns.map((column) => (
                  <MenuItem key={column} value={column}>
                    {column}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Marker Color
            </Typography>
            <input
              type="color"
              value={markerColor}
              onChange={(e) => setMarkerColor(e.target.value)}
              disabled={isUpdating}
              style={{ width: '100%', height: '40px' }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Marker Size
              <Tooltip title="Size of the markers in pixels (default: 6)">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <FormControl fullWidth>
              <input
                type="range"
                min="2"
                max="20"
                value={markerSize}
                onChange={(e) => setMarkerSize(Number(e.target.value))}
                disabled={isUpdating}
                style={{ width: '100%' }}
              />
              <Typography variant="caption" align="center">
                {markerSize}px
              </Typography>
            </FormControl>
          </Box>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isUpdating}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Switch, 
  IconButton, 
  Collapse, 
  Slider, 
  Paper, 
  Stack, 
  Button,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PaletteIcon from '@mui/icons-material/Palette';
import CloseIcon from '@mui/icons-material/Close';
import { HeatMapDataset } from '../../types/heatMap';
import { useMap } from '../../contexts/MapContext';
import { useStore } from '../../store';
import { heatMapService } from '../../services/heatMapService';
import type { ActiveHeatMapLayer } from '../../types/heatMap';
import { gradientOptions } from '../../constants/heatmapConstants';
import { HeatMapControls } from './HeatMapControls';
import { DEFAULT_HEATMAP_CONTROLS } from '../../constants/heatmapEnhanced';

// Edit Layer Modal Component
interface EditLayerModalProps {
  open: boolean;
  onClose: () => void;
  layer: HeatMapDataset;
  onDelete: () => void;
  onSave: (name: string) => Promise<void>;
}

const EditLayerModal: React.FC<EditLayerModalProps> = ({
  open,
  onClose,
  layer,
  onDelete,
  onSave
}) => {
  const [name, setName] = useState(layer.name);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(name);
      onClose();
    } catch (err) {
      console.error('Error saving layer:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Layer</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            label="Layer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Created: {layer.metadata.createdAt.toDate().toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Points: {layer.metadata.totalPoints}
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Danger Zone
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={onDelete}
            sx={{ mt: 1 }}
            fullWidth
          >
            Delete Layer Permanently
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading || !name.trim() || name === layer.name}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface HeatMapLayerItemProps {
  layer: ActiveHeatMapLayer;
  onToggle: (visible: boolean) => void;
  onRemove: () => void;
  onSettingsChange: (settings: Partial<ActiveHeatMapLayer['settings']>) => void;
}

const HeatMapLayerItem = ({ 
  layer, 
  onToggle, 
  onRemove,
  onSettingsChange 
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleVisibilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(event.target.checked);
  };

  const handleWeightRangeChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      onSettingsChange({
        minWeight: newValue[0],
        maxWeight: newValue[1]
      });
    }
  };

  const handleGradientChange = (gradient: string[]) => {
    onSettingsChange({ gradient });
  };

  const handleControlsChange = (controls: Partial<typeof DEFAULT_HEATMAP_CONTROLS>) => {
    onSettingsChange({ 
      ...layer.settings,
      controls: {
        ...layer.settings.controls,
        ...controls
      }
    });
  };

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Switch
            checked={layer.settings.visible}
            onChange={handleVisibilityChange}
            size="small"
          />
          <Typography variant="subtitle2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {layer.dataset.name}
          </Typography>
        </Box>
        <Box>
          <IconButton 
            size="small" 
            onClick={() => setExpanded(!expanded)}
            sx={{ mr: 1 }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <Tooltip title="Remove from active layers">
            <IconButton size="small" onClick={onRemove}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <HeatMapControls
            settings={layer.settings.controls || DEFAULT_HEATMAP_CONTROLS}
            onSettingsChange={handleControlsChange}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="caption" color="text.secondary">
            Weight Range
          </Typography>
          <Box sx={{ px: 1, mt: 1 }}>
            <Slider
              value={[layer.settings.minWeight, layer.settings.maxWeight]}
              onChange={handleWeightRangeChange}
              valueLabelDisplay="auto"
              valueLabelFormat={formatValue}
              min={layer.dataset.metadata.minWeight}
              max={layer.dataset.metadata.maxWeight}
            />
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Color Gradient
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
            {gradientOptions.map((option, index) => (
              <Button
                key={index}
                size="small"
                variant={
                  JSON.stringify(layer.settings.gradient) === JSON.stringify(option.gradient) 
                    ? "contained" 
                    : "outlined"
                }
                onClick={() => handleGradientChange(option.gradient)}
                startIcon={<PaletteIcon />}
              >
                {option.name}
              </Button>
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

interface AvailableLayerItemProps {
  dataset: HeatMapDataset;
  onActivate: () => void;
  onEdit: () => void;
}

const AvailableLayerItem: React.FC<AvailableLayerItemProps> = ({
  dataset,
  onActivate,
  onEdit
}) => (
  <Paper sx={{ p: 2, mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={onActivate}>
        <Typography variant="subtitle2">{dataset.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {dataset.description}
        </Typography>
      </Box>
      <Box>
        <Tooltip title="Edit layer">
          <IconButton size="small" onClick={onEdit}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  </Paper>
);

export function HeatMapLayersList() {
  const { 
    activeHeatMapLayers,
    toggleHeatMapLayer,
    updateHeatMapLayerSettings,
    removeHeatMapLayer,
    addHeatMapLayer
  } = useMap();
  const { user } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableLayers, setAvailableLayers] = useState<HeatMapDataset[]>([]);
  const [editingLayer, setEditingLayer] = useState<HeatMapDataset | null>(null);

  const fetchLayers = async () => {
    if (!user?.tenantId) return;
    
    try {
      setLoading(true);
      setError(null);
      const datasets = await heatMapService.getDatasets(user.tenantId);
      setAvailableLayers(datasets.filter(d => d.status === 'active'));
    } catch (err) {
      console.error('Error fetching heat map layers:', err);
      setError('Failed to load heat map layers');
    } finally {
      setLoading(false);
    }
  };

  const refreshLayers = async () => {
    if (!user?.tenantId) return;
    try {
      const datasets = await heatMapService.getDatasets(user.tenantId);
      const activeLayerIds = activeHeatMapLayers.map(layer => layer.dataset.id);
      setAvailableLayers(datasets.filter(d => 
        d.status === 'active' && !activeLayerIds.includes(d.id)
      ));
    } catch (err) {
      console.error('Error refreshing layers:', err);
    }
  };

  useEffect(() => {
    refreshLayers();
  }, [user?.tenantId, activeHeatMapLayers.length]);

  useEffect(() => {
    fetchLayers();
  }, [user?.tenantId]);

  const handleLayerToggle = (datasetId: string, visible: boolean) => {
    toggleHeatMapLayer(datasetId, visible);
  };

  const handleLayerRemove = (layer: ActiveHeatMapLayer) => {
    removeHeatMapLayer(layer.dataset.id);
    setAvailableLayers(prev => [...prev, layer.dataset]);
  };

  const handleLayerAdd = async (dataset: HeatMapDataset) => {
    addHeatMapLayer({
      ...dataset,
      settings: {
        visible: true,
        minWeight: dataset.metadata.minWeight,
        maxWeight: dataset.metadata.maxWeight,
        gradient: gradientOptions[0].gradient
      }
    });
    setAvailableLayers(prev => prev.filter(d => d.id !== dataset.id));
  };

  const handleLayerDelete = async (dataset: HeatMapDataset) => {
    if (!user?.tenantId) return;
    try {
      await heatMapService.archiveDataset(user.tenantId, dataset.id);
      setAvailableLayers(prev => prev.filter(d => d.id !== dataset.id));
      setEditingLayer(null);
    } catch (err) {
      console.error('Error archiving dataset:', err);
    }
  };

  const handleLayerSave = async (name: string) => {
    if (!user?.tenantId || !editingLayer) return;
    
    try {
      await heatMapService.updateDataset(user.tenantId, editingLayer.id, { name });
      
      // Update the local state with the new name
      setAvailableLayers(prev => 
        prev.map(layer => 
          layer.id === editingLayer.id 
            ? { ...layer, name }
            : layer
        )
      );
      
      // If the layer is also active, update it there as well
      const activeLayer = activeHeatMapLayers.find(l => l.dataset.id === editingLayer.id);
      if (activeLayer) {
        updateHeatMapLayerSettings(editingLayer.id, {
          ...activeLayer.settings,
          dataset: { ...activeLayer.dataset, name }
        });
      }
      
      setEditingLayer(null);
    } catch (err) {
      console.error('Error updating layer:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
        {error}
      </Typography>
    );
  }

  // Filter out layers that are already active
  const inactiveLayers = availableLayers.filter(
    layer => !activeHeatMapLayers.some(active => active.dataset.id === layer.id)
  );

  return (
    <Box>
      {inactiveLayers.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Available Layers
          </Typography>
          {inactiveLayers.map((dataset, index) => (
            <AvailableLayerItem
              key={`available-${dataset.id}`}
              dataset={dataset}
              onActivate={() => handleLayerAdd(dataset)}
              onEdit={() => setEditingLayer(dataset)}
            />
          ))}
        </Box>
      )}

      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Active Layers
      </Typography>
      {activeHeatMapLayers.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No active heat map layers. Click on an available layer above to add it.
        </Typography>
      ) : (
        activeHeatMapLayers.map((layer) => (
          <HeatMapLayerItem
            key={`active-${layer.dataset.id}`}
            layer={layer}
            onToggle={(visible) => handleLayerToggle(layer.dataset.id, visible)}
            onRemove={() => handleLayerRemove(layer)}
            onSettingsChange={(settings) => updateHeatMapLayerSettings(layer.dataset.id, settings)}
          />
        ))
      )}

      {editingLayer && (
        <EditLayerModal
          open={true}
          onClose={() => setEditingLayer(null)}
          layer={editingLayer}
          onDelete={() => handleLayerDelete(editingLayer)}
          onSave={handleLayerSave}
        />
      )}
    </Box>
  );
}

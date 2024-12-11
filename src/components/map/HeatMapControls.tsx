import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { HeatmapControlSettings, HeatmapVisualizationMode } from '../../types/heatMapControls';
import { HEATMAP_CONTROL_LIMITS } from '../../constants/heatmapEnhanced';

interface HeatMapControlsProps {
  settings: HeatmapControlSettings;
  onSettingsChange: (settings: Partial<HeatmapControlSettings>) => void;
}

export function HeatMapControls({ settings, onSettingsChange }: HeatMapControlsProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Visualization Controls
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Radius
        </Typography>
        <Slider
          value={settings.radius}
          min={HEATMAP_CONTROL_LIMITS.radius.min}
          max={HEATMAP_CONTROL_LIMITS.radius.max}
          onChange={(_, value) => onSettingsChange({ radius: value as number })}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Opacity
        </Typography>
        <Slider
          value={settings.opacity}
          min={HEATMAP_CONTROL_LIMITS.opacity.min}
          max={HEATMAP_CONTROL_LIMITS.opacity.max}
          step={0.1}
          onChange={(_, value) => onSettingsChange({ opacity: value as number })}
          valueLabelDisplay="auto"
        />
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Visualization Mode</InputLabel>
        <Select
          value={settings.mode}
          label="Visualization Mode"
          onChange={(e) => onSettingsChange({ mode: e.target.value as HeatmapVisualizationMode })}
        >
          <MenuItem value="hotspot">Hotspot</MenuItem>
          <MenuItem value="continuous">Continuous</MenuItem>
          <MenuItem value="contour">Contour</MenuItem>
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Switch
            checked={settings.zoomScale}
            onChange={(e) => onSettingsChange({ zoomScale: e.target.checked })}
            size="small"
          />
        }
        label={
          <Typography variant="body2">
            Scale with zoom
          </Typography>
        }
      />

      <FormControlLabel
        control={
          <Switch
            checked={settings.dissipating}
            onChange={(e) => onSettingsChange({ dissipating: e.target.checked })}
            size="small"
          />
        }
        label={
          <Typography variant="body2">
            Heat dissipation
          </Typography>
        }
      />
    </Box>
  );
}

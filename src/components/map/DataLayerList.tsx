import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Delete,
  Edit,
  InfoOutlined,
} from '@mui/icons-material';
import { useMap } from '../../contexts/MapContext';
import { EditDataLayerModal } from './EditDataLayerModal';
import { ProcessingStatusDialog } from './ProcessingStatusDialog';
import { useGeocodingProgress } from '../../stores/geocodingProgressStore';

export function DataLayerList() {
  const { dataLayers, toggleDataLayerVisibility, removeDataLayer } = useMap();
  const [editingLayer, setEditingLayer] = useState<string | null>(null);
  const [processingDetailsLayer, setProcessingDetailsLayer] = useState<string | null>(null);
  const geocodingProgress = useGeocodingProgress();

  if (!dataLayers || dataLayers.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          No data layers added yet. Click "Add Data Layer" to get started.
        </Typography>
      </Box>
    );
  }

  const getStatusLabel = (status: string, layer: any) => {
    if (status === 'processing') {
      if (layer.processingDetails) {
        return `Processing ${layer.processingDetails.completed}/${layer.processingDetails.total}`;
      }
      return 'Processing';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      case 'processing':
        return 'primary';
      default:
        return 'warning';
    }
  };

  return (
    <>
      <List>
        {dataLayers.map((layer) => {
          const isProcessing = layer.status === 'processing';
          const progress = layer.processingDetails
            ? (layer.processingDetails.completed / layer.processingDetails.total) * 100
            : 0;

          return (
            <ListItem
              key={layer.id}
              sx={{
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              <Box sx={{ flexGrow: 1, pr: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body1" component="span">
                    {layer.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={getStatusLabel(layer.status, layer)}
                    color={getStatusColor(layer.status)}
                    onClick={isProcessing ? () => setProcessingDetailsLayer(layer.id) : undefined}
                    sx={isProcessing ? {
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    } : undefined}
                  />
                  {layer.processingDetails?.lastError && (
                    <Tooltip title={layer.processingDetails.lastError}>
                      <IconButton size="small" color="error">
                        <InfoOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                {isProcessing && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                      {layer.processingDetails?.completed || 0} of {layer.processingDetails?.total || 0} addresses processed
                    </Typography>
                  </Box>
                )}
              </Box>
              <ListItemSecondaryAction>
                <Tooltip 
                  title={isProcessing ? "Cannot edit while processing addresses" : "Edit layer"}
                  placement="top"
                >
                  <span>
                    <IconButton
                      edge="end"
                      onClick={() => setEditingLayer(layer.id)}
                      disabled={isProcessing}
                    >
                      <Edit />
                    </IconButton>
                  </span>
                </Tooltip>
                <IconButton
                  edge="end"
                  onClick={() => toggleDataLayerVisibility(layer.id)}
                >
                  {layer.visible ? <Visibility /> : <VisibilityOff />}
                </IconButton>
                <Tooltip 
                  title={isProcessing ? "Cannot delete while processing addresses" : "Delete layer"}
                  placement="top"
                >
                  <span>
                    <IconButton
                      edge="end"
                      onClick={() => removeDataLayer(layer.id)}
                      disabled={isProcessing}
                    >
                      <Delete />
                    </IconButton>
                  </span>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>

      {editingLayer && (
        <EditDataLayerModal
          open={true}
          onClose={() => setEditingLayer(null)}
          dataLayer={dataLayers.find(layer => layer.id === editingLayer)!}
        />
      )}

      {processingDetailsLayer && (
        <ProcessingStatusDialog
          open={true}
          onClose={() => setProcessingDetailsLayer(null)}
          dataLayer={dataLayers.find(layer => layer.id === processingDetailsLayer)!}
        />
      )}
    </>
  );
}

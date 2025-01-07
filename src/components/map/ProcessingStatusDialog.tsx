import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  IconButton,
} from '@mui/material';
import { DataLayer } from '../../services/dataLayerService';
import { Close, Info, Error as ErrorIcon, CheckCircle } from '@mui/icons-material';
import { useGeocodingProgress } from '../../stores/geocodingProgressStore';

interface ProcessingStatusDialogProps {
  open: boolean;
  onClose: () => void;
  dataLayer: DataLayer;
}

export function ProcessingStatusDialog({ open, onClose, dataLayer }: ProcessingStatusDialogProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const geocodingProgress = useGeocodingProgress();

  const progress = dataLayer.processingDetails
    ? (dataLayer.processingDetails.completed / dataLayer.processingDetails.total) * 100
    : 0;

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (autoScroll) {
      const logsContainer = document.getElementById('geocoding-logs');
      if (logsContainer) {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }
    }
  }, [dataLayer.processingDetails?.logs, autoScroll]);

  const getStatusColor = () => {
    switch (dataLayer.status) {
      case 'completed':
        return 'success.main';
      case 'error':
        return 'error.main';
      case 'processing':
        return 'primary.main';
      default:
        return 'warning.main';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLogIcon = (type: 'info' | 'error' | 'success') => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'success':
        return <CheckCircle color="success" fontSize="small" />;
      default:
        return <Info color="info" fontSize="small" />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Processing Status: {dataLayer.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Status: {dataLayer.status.charAt(0).toUpperCase() + dataLayer.status.slice(1)}
            </Typography>
            {dataLayer.status === 'processing' && (
              <Typography variant="body2" color="textSecondary">
                ({dataLayer.processingDetails?.completed || 0} of {dataLayer.processingDetails?.total || 0} addresses)
              </Typography>
            )}
          </Box>

          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getStatusColor()
              }
            }} 
          />
        </Box>

        <Typography variant="h6" gutterBottom>
          Processing Logs
        </Typography>
        
        <Paper 
          variant="outlined" 
          sx={{ 
            height: '300px',
            overflow: 'auto',
            bgcolor: 'grey.50',
            p: 2
          }}
          id="geocoding-logs"
        >
          <List dense>
            {dataLayer.processingDetails?.logs?.map((log, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getLogIcon(log.type)}
                      <Typography variant="body2" component="span">
                        {log.message}
                      </Typography>
                    </Box>
                  }
                  secondary={formatTimestamp(log.timestamp)}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {dataLayer.processingDetails?.errors && dataLayer.processingDetails.errors.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {dataLayer.processingDetails.errors.length} address(es) failed to geocode. 
            These addresses will be marked with errors in the data layer.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={() => setAutoScroll(!autoScroll)} 
          color="inherit"
        >
          {autoScroll ? 'Disable Auto-scroll' : 'Enable Auto-scroll'}
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

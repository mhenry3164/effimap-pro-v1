import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Paper,
  Grid,
} from '@mui/material';
import { DataLayer } from '../../services/dataLayerService';

interface DataLayerStatusDialogProps {
  dataLayer: DataLayer;
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
}

export const DataLayerStatusDialog: React.FC<DataLayerStatusDialogProps> = ({
  dataLayer,
  open,
  onClose,
  onRetry,
}) => {
  const {
    name,
    status,
    processingDetails,
  } = dataLayer;

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'processing':
        return '#2196f3';
      default:
        return '#ff9800';
    }
  };

  const getProgress = () => {
    if (!processingDetails) return 0;
    const { total, completed } = processingDetails;
    return total ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Data Layer Status: {name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Status:
                  <Typography
                    component="span"
                    sx={{
                      ml: 1,
                      color: getStatusColor(),
                      fontWeight: 'bold',
                    }}
                  >
                    {status.toUpperCase()}
                  </Typography>
                </Typography>
              </Grid>

              {processingDetails && (
                <>
                  <Grid item xs={12}>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Progress: {getProgress()}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={getProgress()}
                        color={status === 'error' ? 'error' : 'primary'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Processed: {processingDetails.completed} / {processingDetails.total}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Failed: {processingDetails.failed}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>

          {status === 'error' && processingDetails?.lastError && (
            <Alert severity="error">
              {processingDetails.lastError}
            </Alert>
          )}

          {processingDetails?.errors && processingDetails.errors.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Failed Addresses
              </Typography>
              <List>
                {processingDetails.errors.map((item, index) => (
                  <ListItem key={index} divider={index < processingDetails.errors.length - 1}>
                    <ListItemText
                      primary={item.address}
                      secondary={
                        <Typography color="error" variant="body2">
                          {item.error}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {onRetry && status === 'error' && (
          <Button onClick={onRetry} color="primary">
            Retry Failed Addresses
          </Button>
        )}
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

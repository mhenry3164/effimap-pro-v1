import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Typography,
  Box,
} from '@mui/material';
import { useGeocodingProgress } from '../../stores/geocodingProgressStore';

interface GeocodingProgressModalProps {
  open: boolean;
  onClose: () => void;
  onContinueInBackground: () => void;
}

export function GeocodingProgressModal({
  open,
  onClose,
  onContinueInBackground,
}: GeocodingProgressModalProps) {
  const {
    total,
    completed,
    failed,
    isProcessing,
    currentBatch,
    totalBatches,
    errors,
    status,
  } = useGeocodingProgress();

  const progress = total > 0 ? ((completed + failed) / total) * 100 : 0;
  const canClose = status === 'completed' || status === 'error';

  return (
    <Dialog
      open={open}
      onClose={canClose ? onClose : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {status === 'completed'
          ? 'Geocoding Complete'
          : status === 'error'
          ? 'Geocoding Error'
          : 'Geocoding in Progress'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={failed > 0 ? 'warning' : 'primary'}
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress: {Math.round(progress)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Batch: {currentBatch + 1} of {totalBatches}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Processed: {completed + failed} of {total} addresses
            </Typography>
            {failed > 0 && (
              <Typography variant="body2" color="error">
                Failed: {failed} addresses
              </Typography>
            )}
          </Box>

          {errors.length > 0 && (
            <Box sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
              <Typography variant="subtitle2" color="error">
                Errors:
              </Typography>
              {errors.map((error, index) => (
                <Typography
                  key={index}
                  variant="caption"
                  display="block"
                  color="error"
                >
                  {error}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {isProcessing && (
          <Button onClick={onContinueInBackground}>
            Continue in Background
          </Button>
        )}
        {canClose && <Button onClick={onClose}>Close</Button>}
      </DialogActions>
    </Dialog>
  );
}

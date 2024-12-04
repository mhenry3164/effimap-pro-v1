import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { zipCodeService } from '../../../services/zipCodeService';
import { heatMapService } from '../../../services/heatMapService';
import { ZipCodeTotal } from '../../../types/zipCode';
import { NewHeatMapDataset, HeatMapDataset } from '../../../types/heatMap';
import { Map } from '../../territory/Map';
import { useMap } from '../../../contexts/MapContext';
import { useStore } from '../../../store';
import type { ParseResult } from 'papaparse';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface CSVRow {
  [key: string]: string | undefined;
  zip?: string;
  ZIP?: string;
  zipcode?: string;
  ZIPCODE?: string;
  total?: string;
  TOTAL?: string;
  value?: string;
  VALUE?: string;
}

export default function AdvancedMapping() {
  const { setHeatMapLayerVisible, setHeatMapData, heatMapLayerVisible } = useMap();
  const { user } = useStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDataset, setCurrentDataset] = useState<HeatMapDataset | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadHeatMapData = async () => {
      if (!user?.tenantId) {
        setInitialLoading(false);
        return;
      }

      try {
        setInitialLoading(true);
        setError(null);
        const datasets = await heatMapService.getDatasets(user.tenantId);
        const activeDataset = datasets
          .filter(d => d.status === 'active')
          .sort((a, b) => b.metadata.updatedAt.toMillis() - a.metadata.updatedAt.toMillis())[0];

        if (activeDataset) {
          setCurrentDataset(activeDataset);
          setHeatMapData({
            points: activeDataset.points,
            maxWeight: activeDataset.metadata.maxWeight,
            minWeight: activeDataset.metadata.minWeight
          });
          setHeatMapLayerVisible(true);
        }
      } catch (err) {
        console.error('Error loading heat map data:', err);
        setError('Failed to load existing heat map data');
      } finally {
        setInitialLoading(false);
      }
    };

    loadHeatMapData();
  }, [user?.tenantId, setHeatMapData, setHeatMapLayerVisible]);

  const handleDeleteConfirm = async () => {
    if (!user?.tenantId || !currentDataset) return;

    try {
      setLoading(true);
      await heatMapService.deleteDataset(user.tenantId, currentDataset.id);
      setCurrentDataset(null);
      setHeatMapData(null);
      setHeatMapLayerVisible(false);
    } catch (err) {
      console.error('Error deleting dataset:', err);
      setError('Failed to delete dataset');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const toggleHeatMapVisibility = () => {
    setHeatMapLayerVisible(!heatMapLayerVisible);
  };

  const processCSV = async (csvText: string) => {
    if (!user?.tenantId) {
      setError('No tenant ID found');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data }: ParseResult<CSVRow> = Papa.parse(csvText, { 
        header: true,
        skipEmptyLines: true
      });
      
      const zipTotals: ZipCodeTotal[] = data.map((row: CSVRow, index: number) => {
        const zip = row.zip || row.ZIP || row.zipcode || row.ZIPCODE;
        const total = row.total || row.TOTAL || row.value || row.VALUE;
        
        if (!zip || !total) {
          throw new Error(`Row ${index + 1}: Missing zip code or total value`);
        }

        const parsedTotal = parseFloat(total);
        if (isNaN(parsedTotal)) {
          throw new Error(`Row ${index + 1}: Invalid total value "${total}"`);
        }

        return {
          zip: zip.toString().trim(),
          total: parsedTotal
        };
      });

      if (zipTotals.length === 0) {
        throw new Error('No data found in CSV file');
      }

      const { valid, invalid } = await zipCodeService.validateZipCodes(
        zipTotals.map(zt => zt.zip)
      );

      if (invalid.length > 0) {
        setError(`Warning: ${invalid.length} invalid zip codes found: ${invalid.slice(0, 5).join(', ')}${invalid.length > 5 ? '...' : ''}`);
      }

      const validZipTotals = zipTotals.filter(zt => valid.includes(zt.zip));
      
      if (validZipTotals.length === 0) {
        throw new Error('No valid locations found in the CSV file');
      }

      const existingDatasets = await heatMapService.getDatasets(user.tenantId);
      const activeDatasets = existingDatasets.filter(d => d.status === 'active');
      for (const dataset of activeDatasets) {
        await heatMapService.archiveDataset(user.tenantId, dataset.id);
      }

      const newDataset: NewHeatMapDataset = {
        name: `Heat Map ${new Date().toLocaleDateString()}`,
        description: `Imported from CSV with ${validZipTotals.length} locations`,
        points: []
      };

      const dataset = await heatMapService.createFromZipTotals(
        user.tenantId,
        newDataset,
        validZipTotals
      );

      setCurrentDataset(dataset);
      setHeatMapData({
        points: dataset.points,
        maxWeight: dataset.metadata.maxWeight,
        minWeight: dataset.metadata.minWeight
      });
      setHeatMapLayerVisible(true);
    } catch (err) {
      console.error('Error processing CSV:', err);
      setError(err instanceof Error ? err.message : 'Error processing CSV file');
      setHeatMapData(null);
      setHeatMapLayerVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          await processCSV(text);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  if (initialLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Advanced Territory Mapping
        </Typography>
        <Stack direction="row" spacing={2}>
          {currentDataset && (
            <>
              <Button
                variant="outlined"
                color="primary"
                onClick={toggleHeatMapVisibility}
                startIcon={heatMapLayerVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                disabled={loading}
              >
                {heatMapLayerVisible ? 'Hide Heatmap' : 'Show Heatmap'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
                startIcon={<DeleteIcon />}
                disabled={loading}
              >
                Delete Heatmap
              </Button>
            </>
          )}
        </Stack>
      </Box>

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          mb: 3,
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <UploadIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
            <Typography variant="body1" sx={{ mb: 1 }}>
              {isDragActive
                ? 'Drop the CSV file here'
                : 'Drag and drop a CSV file here, or click to select'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              File should contain columns for zip code (zip, ZIP, zipcode, or ZIPCODE) and total value (total, TOTAL, value, or VALUE)
            </Typography>
          </>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {currentDataset && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">{currentDataset.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {currentDataset.description}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Points: {currentDataset.metadata.totalPoints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created: {currentDataset.metadata.createdAt.toDate().toLocaleDateString()}
            </Typography>
          </Box>
        </Alert>
      )}

      <Box sx={{ height: '500px', mb: 3 }}>
        <Map />
      </Box>

      {loading && (
        <Box sx={{ textAlign: 'center', my: 2 }}>
          <CircularProgress size={24} />
          <Typography sx={{ mt: 1 }}>Processing data...</Typography>
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Heatmap</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this heatmap? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

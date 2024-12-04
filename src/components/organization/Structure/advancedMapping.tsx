import React, { useState, useCallback } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { zipCodeService } from '../../../services/zipCodeService';
import { heatMapService } from '../../../services/heatMapService';
import { ZipCodeTotal } from '../../../types/zipCode';
import { NewHeatMapDataset } from '../../../types/heatMap';
import { Map } from '../../territory/Map';
import { useMap } from '../../../contexts/MapContext';
import { useStore } from '../../../store';
import type { ParseResult } from 'papaparse';

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
  const { setHeatMapLayerVisible, setHeatMapData } = useMap();
  const { user } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processCSV = async (csvText: string) => {
    if (!user?.tenantId) {
      setError('No tenant ID found');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse CSV
      const { data }: ParseResult<CSVRow> = Papa.parse(csvText, { 
        header: true,
        skipEmptyLines: true
      });
      
      // Validate CSV structure
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

      // Validate zip codes
      const { valid, invalid } = await zipCodeService.validateZipCodes(
        zipTotals.map(zt => zt.zip)
      );

      if (invalid.length > 0) {
        setError(`Warning: ${invalid.length} invalid zip codes found: ${invalid.slice(0, 5).join(', ')}${invalid.length > 5 ? '...' : ''}`);
      }

      // Process valid zip codes
      const validZipTotals = zipTotals.filter(zt => valid.includes(zt.zip));
      
      if (validZipTotals.length === 0) {
        throw new Error('No valid locations found in the CSV file');
      }

      // Create heat map dataset
      const newDataset: NewHeatMapDataset = {
        name: `Heat Map ${new Date().toLocaleDateString()}`,
        description: `Imported from CSV with ${validZipTotals.length} locations`,
        points: [] // Will be populated by the service
      };

      const dataset = await heatMapService.createFromZipTotals(
        user.tenantId,
        newDataset,
        validZipTotals
      );

      // Update heat map data in context
      setHeatMapData({
        points: dataset.points,
        maxWeight: dataset.metadata.maxWeight,
        minWeight: dataset.metadata.minWeight
      });

      // Automatically show the heat map layer when data is loaded
      setHeatMapLayerVisible(true);

      console.log('Created heat map dataset with', dataset.points.length, 'points');
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        Advanced Territory Mapping
      </Typography>

      {/* File Upload */}
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

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Map */}
      <Box sx={{ height: '500px', mb: 3 }}>
        <Map />
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ textAlign: 'center', my: 2 }}>
          <CircularProgress size={24} />
          <Typography sx={{ mt: 1 }}>Processing data...</Typography>
        </Box>
      )}
    </Box>
  );
}

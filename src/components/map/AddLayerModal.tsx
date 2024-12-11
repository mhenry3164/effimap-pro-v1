import React, { useState, useCallback } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { zipCodeService } from '../../services/zipCodeService';
import { heatMapService } from '../../services/heatMapService';
import { ZipCodeTotal } from '../../types/zipCode';
import { NewHeatMapDataset } from '../../types/heatMap';
import { useMap } from '../../contexts/MapContext';
import { useStore } from '../../store';
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

interface AddLayerModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddLayerModal: React.FC<AddLayerModalProps> = ({ open, onClose }) => {
  const { addHeatMapLayer } = useMap();
  const { user } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layerName, setLayerName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      // Use filename (without extension) as default layer name
      const defaultName = acceptedFiles[0].name.replace(/\.[^/.]+$/, "");
      setLayerName(defaultName);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const processFile = async () => {
    if (!file || !user?.tenantId) return;
    
    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const { data }: ParseResult<CSVRow> = Papa.parse(text, { 
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

      const newDataset: NewHeatMapDataset = {
        name: layerName,
        description: `Imported from ${file.name} with ${validZipTotals.length} locations`,
        points: []
      };

      const dataset = await heatMapService.createFromZipTotals(
        user.tenantId,
        newDataset,
        validZipTotals
      );

      addHeatMapLayer({
        dataset,
        settings: {
          visible: true,
          minWeight: Math.min(...validZipTotals.map(zt => zt.total)),
          maxWeight: Math.max(...validZipTotals.map(zt => zt.total))
        }
      });

      onClose();
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'Error processing file');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!layerName.trim()) {
      setError('Please enter a layer name');
      return;
    }
    if (!file) {
      setError('Please select a file');
      return;
    }
    await processFile();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add New Heatmap Layer</DialogTitle>
      <DialogContent>
        <Box className="space-y-4 py-4">
          <TextField
            label="Layer Name"
            value={layerName}
            onChange={(e) => setLayerName(e.target.value)}
            fullWidth
            required
            disabled={loading}
          />

          <Box
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} disabled={loading} />
            {file ? (
              <Typography>{file.name}</Typography>
            ) : isDragActive ? (
              <Typography>Drop the file here</Typography>
            ) : (
              <Typography>
                Drag and drop a CSV file here, or click to select
              </Typography>
            )}
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !file || !layerName.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Layer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

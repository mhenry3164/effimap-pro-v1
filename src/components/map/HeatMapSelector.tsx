import React, { useEffect, useState } from 'react';
import { useMap } from '../../contexts/MapContext';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Box } from '@mui/material';
import { heatMapService } from '../../services/heatMapService';
import { HeatMapDataset } from '../../types/heatMap';

export function HeatMapSelector() {
  const { addHeatMapLayer } = useMap();
  const [allDatasets, setAllDatasets] = useState<HeatMapDataset[]>([]);

  // Load all datasets from Firestore
  useEffect(() => {
    const loadAllDatasets = async () => {
      try {
        // Fetch all datasets from the heatMaps collection
        const datasets = await heatMapService.getDatasets('heavy-machines');
        console.log('All datasets loaded:', datasets);
        
        // Sort datasets by creation date (newest first)
        const sortedDatasets = datasets.sort((a, b) => 
          b.metadata.createdAt.toMillis() - a.metadata.createdAt.toMillis()
        );
        
        setAllDatasets(sortedDatasets);
      } catch (error) {
        console.error('Error loading heat map datasets:', error);
      }
    };

    loadAllDatasets();
  }, []); // Only load once on mount

  const handleChange = (event: SelectChangeEvent) => {
    const selectedId = event.target.value;
    const dataset = allDatasets.find(ds => ds.id === selectedId);
    
    if (dataset) {
      console.log('Adding dataset to layers:', dataset);
      addHeatMapLayer(dataset);
    }
  };

  return (
    <Box>
      <FormControl fullWidth size="small">
        <InputLabel id="heatmap-selector-label">Add Heat Map Layer</InputLabel>
        <Select
          labelId="heatmap-selector-label"
          id="heatmap-selector"
          value=""
          label="Add Heat Map Layer"
          onChange={handleChange}
        >
          {allDatasets.length === 0 ? (
            <MenuItem disabled value="">
              No datasets found
            </MenuItem>
          ) : (
            allDatasets.map(dataset => (
              <MenuItem key={dataset.id} value={dataset.id}>
                {dataset.name || `Heat Map ${dataset.metadata.createdAt.toDate().toLocaleDateString()}`}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
    </Box>
  );
}

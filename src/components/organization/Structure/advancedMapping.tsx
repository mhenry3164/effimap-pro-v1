import React, { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Map } from '../../territory/Map';
import { useMap } from '../../../contexts/MapContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import { HeatMapLayersList } from '../../map/HeatMapLayersList';
import { AddLayerModal } from '../../map/AddLayerModal';

export default function AdvancedMapping() {
  const { setHeatMapLayerVisible, heatMapLayerVisible } = useMap();
  const [addLayerModalOpen, setAddLayerModalOpen] = useState(false);

  const toggleHeatMapVisibility = () => {
    setHeatMapLayerVisible(!heatMapLayerVisible);
  };

  return (
    <Box className="flex h-full overflow-hidden">
      {/* Left Panel - Fixed Width */}
      <Box className="w-96 h-full flex flex-col overflow-hidden border-r">
        {/* Header */}
        <Box className="p-4 bg-white border-b">
          <Typography variant="h6" sx={{ mb: 2 }}>
            Advanced Territory Mapping
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddLayerModalOpen(true)}
              fullWidth
            >
              Add Layer
            </Button>
            <Button
              variant="outlined"
              onClick={toggleHeatMapVisibility}
              startIcon={heatMapLayerVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
            >
              {heatMapLayerVisible ? 'Hide All' : 'Show All'}
            </Button>
          </Stack>
        </Box>
        
        {/* Layers List - Scrollable */}
        <Box className="flex-1 overflow-auto">
          <Box className="p-4">
            <HeatMapLayersList />
          </Box>
        </Box>
      </Box>

      {/* Map Area - Flexible Width */}
      <Box className="flex-1">
        <Map />
      </Box>

      {/* Add Layer Modal */}
      <AddLayerModal
        open={addLayerModalOpen}
        onClose={() => setAddLayerModalOpen(false)}
      />
    </Box>
  );
}

import React, { useState } from 'react';
import { Box, Button, Stack, Typography, Tabs, Tab } from '@mui/material';
import { Map } from '../../territory/Map';
import { useMap } from '../../../contexts/MapContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import { HeatMapLayersList } from '../../map/HeatMapLayersList';
import { AddLayerModal } from '../../map/AddLayerModal';
import { DataLayerList } from '../../map/DataLayerList';
import { AddDataLayerModal } from '../../map/AddDataLayerModal';

export default function AdvancedMapping() {
  const { setHeatMapLayerVisible, heatMapLayerVisible, dataLayers, setDataLayers } = useMap();
  const [addLayerModalOpen, setAddLayerModalOpen] = useState(false);
  const [addDataLayerModalOpen, setAddDataLayerModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const toggleHeatMapVisibility = () => {
    setHeatMapLayerVisible(!heatMapLayerVisible);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
          
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Heat Maps" />
            <Tab label="Data Layers" />
          </Tabs>

          {activeTab === 0 && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddLayerModalOpen(true)}
                fullWidth
              >
                Add Heat Map Layer
              </Button>
              <Button
                variant="outlined"
                onClick={toggleHeatMapVisibility}
                startIcon={heatMapLayerVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              >
                {heatMapLayerVisible ? 'Hide All' : 'Show All'}
              </Button>
            </Stack>
          )}

          {activeTab === 1 && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddDataLayerModalOpen(true)}
                fullWidth
              >
                Add Data Layer
              </Button>
            </Stack>
          )}
        </Box>
        
        {/* Layers List - Scrollable */}
        <Box className="flex-1 overflow-auto">
          <Box className="p-4">
            {activeTab === 0 ? (
              <HeatMapLayersList />
            ) : (
              <DataLayerList />
            )}
          </Box>
        </Box>
      </Box>

      {/* Map Area - Flexible Width */}
      <Box className="flex-1">
        <Map />
      </Box>

      {/* Modals */}
      <AddLayerModal
        open={addLayerModalOpen}
        onClose={() => setAddLayerModalOpen(false)}
      />
      <AddDataLayerModal
        open={addDataLayerModalOpen}
        onClose={() => setAddDataLayerModalOpen(false)}
      />
    </Box>
  );
}

import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Stack, IconButton, Dialog, DialogContent, DialogTitle, DialogActions, TextField, FormControlLabel, Checkbox, Radio, RadioGroup, FormControl, FormLabel, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import { useToast } from '../../../contexts/ToastContext';
import { useMap } from '../../../contexts/MapContext';
import { useTenant } from '../../../contexts/TenantContext';
import { territoryService } from '../../../services/territoryService';
import { territoryTypeService } from '../../../services/territoryTypeService';
import { geoAnalysisService } from '../../../services/geoAnalysisService';
import { TerritoryList } from '../../territory/TerritoryList';
import { DashboardMap } from '../../dashboard/DashboardMap';
import Map from '../../territory/Map';
import { Territory } from '../../../types/territory';

export default function TerritoryManagementNew() {
  const { tenant } = useTenant();
  const { showToast } = useToast();
  const { setIsDrawingMode } = useMap();
  const [territoryTypes, setTerritoryTypes] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [isTypesDialogOpen, setIsTypesDialogOpen] = useState(false);
  const [newType, setNewType] = useState({ name: '', code: '', color: '#2196F3', description: '' });
  const [editingType, setEditingType] = useState(null);
  const [addingChildTo, setAddingChildTo] = useState(null);
  const [isCategory, setIsCategory] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // Export menu state
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'geojson'>('csv');
  const [analysisType, setAnalysisType] = useState<'zip' | 'county'>('zip');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTerritories, setSelectedTerritories] = useState([]);

  useEffect(() => {
    const initializeTypes = async () => {
      if (!tenant?.id) {
        setTerritoryTypes([]); // Clear territory types if no tenant
        return;
      }
      
      try {
        await territoryTypeService.initializeDefaultTypes(tenant.id);
        const types = await territoryTypeService.getAll(tenant.id);
        const uniqueTypes = Object.values(
          types.reduce((acc, type) => {
            const existing = acc[type.code];
            if (!existing || (type.updatedAt && existing.updatedAt && type.updatedAt > existing.updatedAt)) {
              acc[type.code] = type;
            }
            return acc;
          }, {})
        );
        setTerritoryTypes(uniqueTypes);
      } catch (error) {
        console.error('Error initializing territory types:', error);
        setTerritoryTypes([]); // Reset on error
        showToast({
          title: 'Error',
          description: 'Failed to initialize territory types. Please ensure you are logged in with proper permissions.',
          variant: 'destructive',
        });
      }
    };

    initializeTypes();
  }, [tenant?.id, showToast]);

  useEffect(() => {
    const loadTerritories = async () => {
      if (!tenant?.id) return;
      
      try {
        console.log(`Loading territories for tenant: ${tenant.id}`);
        const data = await territoryService.getAll(tenant.id);
        console.log(`Loaded ${data.length} territories:`, data);
        setTerritories(data);
      } catch (error) {
        console.error('Error loading territories:', error);
      }
    };
    
    loadTerritories();
  }, [tenant?.id]);

  const loadTerritoryTypes = async () => {
    if (!tenant?.id) return;
    
    try {
      const types = await territoryTypeService.getAll(tenant.id);
      const uniqueTypes = Object.values(
        types.reduce((acc, type) => {
          const existing = acc[type.code];
          if (!existing || (type.updatedAt && existing.updatedAt && type.updatedAt > existing.updatedAt)) {
            acc[type.code] = type;
          }
          return acc;
        }, {})
      );
      setTerritoryTypes(uniqueTypes);
    } catch (error) {
      console.error('Error loading territory types:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load territory types',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTerritory = () => {
    setShowMap(true);
    setIsDrawingMode(true);
  };

  const handleImport = () => {
    console.log('Import clicked');
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportOptionClick = (type) => {
    if (type === 'geojson') {
      setExportFormat('geojson');
      handleExportGeoJson();
      handleExportMenuClose();
    } else {
      setAnalysisType(type);
      setExportFormat('csv');
      setExportDialogOpen(true);
      handleExportMenuClose();
    }
  };

  const handleExportGeoJson = async () => {
    if (!tenant?.id) return;
    
    try {
      setIsAnalyzing(true);
      
      const territoriesToExport = selectedTerritories.length > 0
        ? territories.filter(t => selectedTerritories.includes(t.id))
        : territories;
      
      if (territoriesToExport.length === 0) {
        showToast({
          title: 'No territories to export',
          description: 'Please select at least one territory to export.',
          variant: 'destructive',
        });
        setIsAnalyzing(false);
        return;
      }
      
      console.log(`Exporting ${territoriesToExport.length} territories as GeoJSON`, territoriesToExport);
      
      // Generate GeoJSON from territories
      const geoJson = geoAnalysisService.territoriesToGeoJson(territoriesToExport);
      
      // Create download link
      const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/geo+json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `territories_export.geojson`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast({
        title: 'GeoJSON Export Complete',
        description: `${territoriesToExport.length} territories exported successfully`,
      });
    } catch (error) {
      console.error('Error exporting GeoJSON:', error);
      showToast({
        title: 'Export Failed',
        description: 'Failed to export territory data as GeoJSON',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeAndExport = async () => {
    if (!tenant?.id) return;
    
    try {
      setIsAnalyzing(true);
      
      const territoriesToAnalyze = selectedTerritories.length > 0
        ? territories.filter(t => selectedTerritories.includes(t.id))
        : territories;
      
      if (territoriesToAnalyze.length === 0) {
        showToast({
          title: 'No territories to analyze',
          description: 'Please select at least one territory to analyze.',
          variant: 'destructive',
        });
        setIsAnalyzing(false);
        return;
      }
      
      // Debug: Check if territories have boundary data
      territoriesToAnalyze.forEach((territory, index) => {
        console.log(`Territory ${index}: ${territory.name} (${territory.id})`, {
          hasBoundary: !!territory.boundary,
          coordinatesLength: territory.boundary?.coordinates?.length || 0,
          sampleCoordinates: territory.boundary?.coordinates?.slice(0, 3) || []
        });
      });
      
      console.log(`Analyzing ${territoriesToAnalyze.length} territories for ${analysisType}s`, territoriesToAnalyze);
      
      // Ensure we're passing a valid analysisType
      const validAnalysisType: 'zip' | 'county' = analysisType === 'zip' ? 'zip' : 'county';
      
      const data = await geoAnalysisService.analyzeMultipleTerritories(
        territoriesToAnalyze,
        validAnalysisType
      );
      
      console.log(`Analysis complete, found entities:`, data);
      console.log(`Data length: ${data.length} analysis results`);
      data.forEach((result, index) => {
        console.log(`Result ${index} for territory ${result.territory.name}: ${result.entities.length} entities found`);
      });
      
      if (exportFormat === 'csv') {
        // Generate CSV
        const csv = geoAnalysisService.generateCSV(data);
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `territories_${analysisType}_analysis.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (exportFormat === 'geojson') {
        // Generate GeoJSON that includes both territories and contained entities
        const geoJson = geoAnalysisService.generateGeoJson(data, territoriesToAnalyze);
        
        // Create download link
        const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/geo+json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `territories_${analysisType}_analysis.geojson`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      setExportDialogOpen(false);
      showToast({
        title: 'Export Complete',
        description: exportFormat === 'csv'
          ? `${analysisType === 'zip' ? 'ZIP code' : 'County'} data exported successfully`
          : 'GeoJSON data exported successfully',
      });
    } catch (error) {
      console.error('Error analyzing territories:', error);
      showToast({
        title: 'Export Failed',
        description: 'Failed to analyze and export territory data',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTerritorySelection = (territoryIds) => {
    console.log('Selected territories:', territoryIds);
    setSelectedTerritories(territoryIds);
  };

  const handleOpenTypesDialog = () => {
    setIsTypesDialogOpen(true);
  };

  const handleCloseTypesDialog = () => {
    setIsTypesDialogOpen(false);
    setNewType({ name: '', code: '', color: '#2196F3', description: '' });
    setEditingType(null);
    setAddingChildTo(null);
    setIsCategory(false);
  };

  const handleSaveType = async () => {
    if (!tenant?.id) return;

    try {
      if (editingType) {
        await territoryTypeService.update(tenant.id, editingType.id, {
          name: newType.name,
          code: newType.code,
          color: newType.color,
          description: newType.description,
        });
      } else {
        await territoryTypeService.create(tenant.id, {
          ...newType,
          isCategory: isCategory,
          parentType: addingChildTo,
        });
      }
      await loadTerritoryTypes();
      handleCloseTypesDialog();
      showToast({
        title: 'Success',
        description: `Territory type ${editingType ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving territory type:', error);
      showToast({
        title: 'Error',
        description: `Failed to ${editingType ? 'update' : 'create'} territory type`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteType = async (type) => {
    if (!tenant?.id || type.isSystem) return;

    try {
      await territoryTypeService.delete(tenant.id, type.id);
      await loadTerritoryTypes();
      showToast({
        title: 'Success',
        description: 'Territory type deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting territory type:', error);
      showToast({
        title: 'Error',
        description: 'Failed to delete territory type',
        variant: 'destructive',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Territory Management
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateTerritory}
          >
            CREATE TERRITORY
          </Button>
          <IconButton onClick={handleExport}>
            <DownloadIcon />
          </IconButton>
          <IconButton onClick={handleImport}>
            <UploadIcon />
          </IconButton>
          <IconButton onClick={handleOpenTypesDialog}>
            <SettingsIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Main Content */}
      <Box 
        elevation={0} 
        sx={{ 
          backgroundColor: 'background.default',
          border: 1,
          borderColor: 'divider',
          height: 'calc(100vh - 180px)', 
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Map Section */}
          <Box sx={{ height: '400px', position: 'relative', mb: 3 }}>
            <DashboardMap />
          </Box>

          {/* Territory List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <TerritoryList onSelectTerritories={handleTerritorySelection} />
          </Box>
        </Box>
      </Box>

      {/* Territory Types Dialog */}
      <Dialog 
        open={isTypesDialogOpen} 
        onClose={handleCloseTypesDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Territory Types
        </DialogTitle>
        <DialogContent>
          {/* Current Types Section */}
          <Box sx={{ mb: 4, mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Current Types
            </Typography>
            <Stack spacing={2}>
              {/* System Types */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {territoryTypes
                  .filter(type => type.isSystem)
                  .map((type) => (
                    <Box key={type.id}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {type.name}
                      </Typography>
                    </Box>
                  ))}
              </Stack>

              {/* Category Types and their children */}
              {territoryTypes
                .filter(type => type.isCategory && !type.isSystem)
                .map((category) => (
                  <Box key={category.id}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body1">
                        {category.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setNewType({
                            name: '',
                            code: '',
                            color: category.color || '#2196F3',
                            description: '',
                          });
                          setEditingType(null);
                          setAddingChildTo(category.code);
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    {/* Child Types */}
                    <Box sx={{ pl: 3 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {territoryTypes
                          .filter(type => type.parentType === category.code)
                          .map((type) => (
                            <Box key={type.id}>
                              <Typography variant="body1" sx={{ mb: 1 }}>
                                {type.name}
                              </Typography>
                            </Box>
                          ))}
                      </Stack>
                    </Box>
                  </Box>
                ))}

              {/* Standalone Types */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {territoryTypes
                  .filter(type => !type.isSystem && !type.isCategory && !type.parentType)
                  .map((type) => (
                    <Box key={type.id}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {type.name}
                      </Typography>
                    </Box>
                  ))}
              </Stack>
            </Stack>
          </Box>

          {/* Add/Edit Type Form */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              {editingType ? 'Edit Type' : addingChildTo ? `Add Brand to ${territoryTypes.find(t => t.code === addingChildTo)?.name}` : 'Add New Type'}
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Name"
                value={newType.name}
                onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Code"
                value={newType.code}
                onChange={(e) => setNewType({ ...newType, code: e.target.value.toLowerCase() })}
                fullWidth
                size="small"
                helperText="Unique identifier for this type (lowercase)"
              />
              {!addingChildTo && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCategory}
                      onChange={(e) => setIsCategory(e.target.checked)}
                    />
                  }
                  label="This is a category (e.g., OEM Territories)"
                />
              )}
              <Box>
                <Typography variant="caption" display="block" gutterBottom>
                  Color
                </Typography>
                <TextField
                  type="color"
                  value={newType.color}
                  onChange={(e) => setNewType({ ...newType, color: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Box>
              <TextField
                label="Description"
                value={newType.description}
                onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTypesDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveType} 
            variant="contained" 
            disabled={!newType.name || !newType.code}
          >
            {editingType ? 'Update' : 'Add'} Type
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog 
        open={exportDialogOpen} 
        onClose={() => !isAnalyzing && setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Export {analysisType === 'zip' ? 'ZIP Codes' : 'Counties'} {exportFormat === 'csv' ? '(CSV)' : '(GeoJSON)'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              This will analyze the selected territories and export all {analysisType === 'zip' ? 'ZIP codes' : 'counties'} that fall within them.
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {selectedTerritories.length === 0 
                ? 'All territories will be analyzed.' 
                : `${selectedTerritories.length} territory/-ies selected for analysis.`}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Analysis Type</FormLabel>
                <RadioGroup
                  row
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value as 'zip' | 'county')}
                >
                  <FormControlLabel value="zip" control={<Radio />} label="ZIP Codes" />
                  <FormControlLabel value="county" control={<Radio />} label="Counties" />
                </RadioGroup>
              </FormControl>
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportFormat === 'geojson'}
                    onChange={(e) => setExportFormat(e.target.checked ? 'geojson' : 'csv')}
                  />
                }
                label="Export as GeoJSON instead of CSV"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                GeoJSON is a standard format for representing geographic data that can be imported into GIS software.
              </Typography>
            </Box>
            
            {isAnalyzing && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CircularProgress size={24} />
                  <Typography>Analyzing territories...</Typography>
                </Stack>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} disabled={isAnalyzing}>
            Cancel
          </Button>
          <Button 
            onClick={handleAnalyzeAndExport} 
            variant="contained" 
            disabled={isAnalyzing}
            startIcon={<DownloadIcon />}
          >
            Analyze & Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Map Overlay */}
      {showMap && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 1000,
            backgroundColor: 'white'
          }}
        >
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1001 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setShowMap(false);
                setIsDrawingMode(false);
              }}
            >
              Close
            </Button>
          </div>
          <Map />
        </div>
      )}
    </Box>
  );
}

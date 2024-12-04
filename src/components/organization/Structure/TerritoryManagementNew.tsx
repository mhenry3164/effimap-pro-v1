import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageLayout from '../../layout/PageLayout';
import { TerritoryList } from '../../territory/TerritoryList';
import { DashboardMap } from '../../dashboard/DashboardMap';
import Map from '../../territory/Map';
import { territoryTypeService, TerritoryTypeDefinition } from '../../../services/territoryTypeService';
import { useTenant } from '../../../contexts/TenantContext';
import { useToast } from '../../ui/use-toast';
import { useMap } from '../../../contexts/MapContext';

export default function TerritoryManagementNew() {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const { setIsDrawingMode } = useMap();
  const [territoryTypes, setTerritoryTypes] = useState<TerritoryTypeDefinition[]>([]);
  const [isTypesDialogOpen, setIsTypesDialogOpen] = useState(false);
  const [newType, setNewType] = useState({ name: '', code: '', color: '#2196F3', description: '' });
  const [editingType, setEditingType] = useState<TerritoryTypeDefinition | null>(null);
  const [addingChildTo, setAddingChildTo] = useState<string | null>(null);
  const [isCategory, setIsCategory] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const initializeTypes = async () => {
      if (!tenant?.id) return;
      
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
          }, {} as { [key: string]: TerritoryTypeDefinition })
        );
        setTerritoryTypes(uniqueTypes);
      } catch (error) {
        console.error('Error initializing territory types:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize territory types',
          variant: 'destructive',
        });
      }
    };

    initializeTypes();
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
        }, {} as { [key: string]: TerritoryTypeDefinition })
      );
      setTerritoryTypes(uniqueTypes);
    } catch (error) {
      console.error('Error loading territory types:', error);
      toast({
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
    console.log('Export clicked');
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
      toast({
        title: 'Success',
        description: `Territory type ${editingType ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving territory type:', error);
      toast({
        title: 'Error',
        description: `Failed to ${editingType ? 'update' : 'create'} territory type`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteType = async (type: TerritoryTypeDefinition) => {
    if (!tenant?.id || type.isSystem) return;

    try {
      await territoryTypeService.delete(tenant.id, type.id);
      await loadTerritoryTypes();
      toast({
        title: 'Success',
        description: 'Territory type deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting territory type:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete territory type',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageLayout>
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
              <FileDownloadIcon />
            </IconButton>
            <IconButton onClick={handleImport}>
              <FileUploadIcon />
            </IconButton>
            <IconButton onClick={handleOpenTypesDialog}>
              <SettingsIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Main Content */}
        <Paper 
          elevation={0} 
          sx={{ 
            backgroundColor: 'background.default',
            border: 1,
            borderColor: 'divider'
          }}
        >
          <Box sx={{ p: 3 }}>
            {/* Map Section */}
            <Box sx={{ height: '400px', position: 'relative', mb: 3 }}>
              <DashboardMap />
            </Box>

            {/* Territory List */}
            <TerritoryList />
          </Box>
        </Paper>
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
                    <Chip
                      key={type.id}
                      label={type.name}
                      sx={{
                        bgcolor: type.color || '#2196F3',
                        color: 'white',
                        mb: 1,
                      }}
                    />
                  ))}
              </Stack>

              {/* Category Types and their children */}
              {territoryTypes
                .filter(type => type.isCategory && !type.isSystem)
                .map((category) => (
                  <Box key={category.id}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip
                        label={category.name}
                        sx={{
                          bgcolor: category.color || '#2196F3',
                          color: 'white',
                        }}
                        onDelete={() => handleDeleteType(category)}
                        onClick={() => {
                          setEditingType(category);
                          setNewType({
                            name: category.name,
                            code: category.code,
                            color: category.color || '#2196F3',
                            description: category.description || '',
                          });
                        }}
                      />
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
                            <Chip
                              key={type.id}
                              label={type.name}
                              sx={{
                                bgcolor: type.color || category.color || '#2196F3',
                                color: 'white',
                                mb: 1,
                              }}
                              onDelete={() => handleDeleteType(type)}
                              onClick={() => {
                                setEditingType(type);
                                setNewType({
                                  name: type.name,
                                  code: type.code,
                                  color: type.color || category.color || '#2196F3',
                                  description: type.description || '',
                                });
                              }}
                            />
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
                    <Chip
                      key={type.id}
                      label={type.name}
                      sx={{
                        bgcolor: type.color || '#2196F3',
                        color: 'white',
                        mb: 1,
                      }}
                      onDelete={() => handleDeleteType(type)}
                      onClick={() => {
                        setEditingType(type);
                        setNewType({
                          name: type.name,
                          code: type.code,
                          color: type.color || '#2196F3',
                          description: type.description || '',
                        });
                      }}
                    />
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
    </PageLayout>
  );
}

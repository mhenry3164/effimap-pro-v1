import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Checkbox,
  Toolbar,
  Tooltip,
  alpha,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { territoryService } from '../../services/territoryService';
import type { Territory, TerritoryType } from '../../types/territory';

const getTypeChipProps = (type: TerritoryType) => {
  return {
    label: type,
    size: 'small' as const,
    variant: 'outlined' as const,
    sx: {
      borderRadius: 1,
      textTransform: 'lowercase',
      backgroundColor: 'transparent',
    }
  };
};

const getStatusChipProps = (status: string) => {
  return {
    label: status,
    size: 'small' as const,
    sx: {
      borderRadius: 1,
      backgroundColor: status === 'active' ? '#2E7D32' : '#757575',
      color: 'white',
      textTransform: 'lowercase',
    }
  };
};

export interface TerritoryListProps {
  onSelectTerritories?: (territoryIds: string[]) => void;
}

export const TerritoryList: React.FC<TerritoryListProps> = ({ onSelectTerritories }) => {
  const navigate = useNavigate();
  const { tenant, error: tenantError } = useTenant();
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);

  useEffect(() => {
    const fetchTerritories = async () => {
      if (!tenant?.id) {
        setError(tenantError?.message || 'No tenant selected');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const territoriesData = await territoryService.getAll(tenant.id);
        setTerritories(territoriesData);
      } catch (err) {
        console.error('Error fetching territories:', err);
        setError('Failed to load territories');
      } finally {
        setLoading(false);
      }
    };

    fetchTerritories();
  }, [tenant?.id, tenantError]);

  const handleDelete = async (territoryId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!tenant?.id) return;
    
    try {
      await territoryService.delete(tenant.id, territoryId);
      setTerritories(territories.filter(t => t.id !== territoryId));
      // Remove from selection if selected
      if (selectedTerritories.includes(territoryId)) {
        const newSelection = selectedTerritories.filter(id => id !== territoryId);
        setSelectedTerritories(newSelection);
        if (onSelectTerritories) {
          onSelectTerritories(newSelection);
        }
      }
    } catch (err) {
      console.error('Error deleting territory:', err);
    }
  };

  const handleSelectTerritory = (territoryId: string, checked?: boolean) => {
    const newSelected = checked !== undefined 
      ? (checked ? [...selectedTerritories, territoryId] : selectedTerritories.filter(id => id !== territoryId)) 
      : selectedTerritories.includes(territoryId) 
        ? selectedTerritories.filter(id => id !== territoryId) 
        : [...selectedTerritories, territoryId];
      
    setSelectedTerritories(newSelected);
    
    if (onSelectTerritories) {
      onSelectTerritories(newSelected);
    }
  };

  const handleSelectAll = () => {
    if (selectedTerritories.length === territories.length) {
      setSelectedTerritories([]);
      if (onSelectTerritories) {
        onSelectTerritories([]);
      }
    } else {
      const allIds = territories.map(t => t.id);
      setSelectedTerritories(allIds);
      if (onSelectTerritories) {
        onSelectTerritories(allIds);
      }
    }
  };

  const clearSelection = () => {
    setSelectedTerritories([]);
    if (onSelectTerritories) {
      onSelectTerritories([]);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (territories.length === 0) {
    return (
      <Box p={3}>
        <Typography>No territories found.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Selection Toolbar */}
      {onSelectTerritories && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selectedTerritories.length > 0 && {
              bgcolor: (theme) =>
                alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
            }),
            mb: 1,
          }}
        >
          {selectedTerritories.length > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selectedTerritories.length} {selectedTerritories.length === 1 ? 'territory' : 'territories'} selected
            </Typography>
          ) : (
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="subtitle1"
              component="div"
            >
              Select territories to export
            </Typography>
          )}
          
          <Tooltip title="Select All">
            <IconButton onClick={handleSelectAll}>
              <SelectAllIcon />
            </IconButton>
          </Tooltip>
          
          {selectedTerritories.length > 0 && (
            <Tooltip title="Clear Selection">
              <IconButton onClick={clearSelection}>
                <ClearIcon />
              </IconButton>
          </Tooltip>
          )}
        </Toolbar>
      )}

      {/* Territory Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {onSelectTerritories && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedTerritories.length > 0 && selectedTerritories.length < territories.length}
                    checked={selectedTerritories.length > 0 && selectedTerritories.length === territories.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Assignments</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {territories.map((territory) => (
              <TableRow 
                key={territory.id} 
                hover
                selected={selectedTerritories.includes(territory.id)}
                onClick={() => onSelectTerritories && handleSelectTerritory(territory.id)}
                sx={{ cursor: onSelectTerritories ? 'pointer' : 'default' }}
              >
                {onSelectTerritories && (
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedTerritories.includes(territory.id)}
                      onChange={(e) => handleSelectTerritory(territory.id, e.target.checked)}
                    />
                  </TableCell>
                )}
                <TableCell>{territory.name}</TableCell>
                <TableCell>
                  <Chip {...getTypeChipProps(territory.type)} />
                </TableCell>
                <TableCell>
                  {territory.assignedTo?.map((assignmentId) => (
                    <Chip
                      key={assignmentId}
                      label={assignmentId}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5, borderRadius: 1 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <Chip {...getStatusChipProps(territory.status)} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => navigate(`/territories/map?id=${territory.id}`)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => navigate(`/territories/${territory.id}/edit`)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={(e) => handleDelete(territory.id, e)}>
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

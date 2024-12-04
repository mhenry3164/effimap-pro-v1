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
  Stack,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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

export const TerritoryList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerritories = async () => {
      if (!tenant?.id) return;
      
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
  }, [tenant?.id]);

  const handleDelete = async (territoryId: string) => {
    if (!tenant?.id) return;
    
    try {
      await territoryService.delete(tenant.id, territoryId);
      setTerritories(territories.filter(t => t.id !== territoryId));
    } catch (err) {
      console.error('Error deleting territory:', err);
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

  return (
    <Box>
      {/* List Header */}
      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mb: 2 }}>
        <IconButton size="small">
          <SearchIcon />
        </IconButton>
        <IconButton size="small">
          <FilterListIcon />
        </IconButton>
      </Stack>

      {/* Territory Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Assignments</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {territories.map((territory) => (
              <TableRow key={territory.id} hover>
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
                  <IconButton size="small" onClick={() => handleDelete(territory.id)}>
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

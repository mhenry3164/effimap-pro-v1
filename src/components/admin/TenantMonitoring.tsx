import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Select,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { adminService, TenantData } from '../../services/adminService';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

interface TenantMetrics {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'trial';
  userCount: number;
  storageUsed: string;
  lastActivity: Date;
  subscription: {
    plan: string;
    mrr: number;
    status: string;
  };
  health: {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
  };
}

const TenantMonitoring: React.FC = () => {
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const result = await adminService.getTenants(10);
      const processedTenants = result.tenants.map((tenant) => ({
        ...tenant,
        status: tenant.status || 'unknown',
        userCount: tenant.userCount || 0,
        storageUsed: tenant.storageUsed || '0 MB',
        subscription: {
          plan: tenant.subscription?.plan || 'free',
          mrr: tenant.subscription?.mrr || 0,
          status: tenant.subscription?.status || 'unknown',
        },
        health: {
          status: tenant.health?.status || 'unknown',
          issues: tenant.health?.issues || [],
        },
      }));
      setTenants(processedTenants);
      setLastDoc(result.lastDoc);
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreTenants = async () => {
    if (!lastDoc) return;

    try {
      const result = await adminService.getTenants(10, lastDoc);
      const processedTenants = result.tenants.map((tenant) => ({
        ...tenant,
        status: tenant.status || 'unknown',
        userCount: tenant.userCount || 0,
        storageUsed: tenant.storageUsed || '0 MB',
        subscription: {
          plan: tenant.subscription?.plan || 'free',
          mrr: tenant.subscription?.mrr || 0,
          status: tenant.subscription?.status || 'unknown',
        },
        health: {
          status: tenant.health?.status || 'unknown',
          issues: tenant.health?.issues || [],
        },
      }));
      setTenants((prev) => [...prev, ...processedTenants]);
      setLastDoc(result.lastDoc);
    } catch (error) {
      console.error('Error loading more tenants:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      await loadTenants();
      return;
    }

    try {
      setIsLoading(true);
      const results = await adminService.searchTenants(searchQuery);
      const processedTenants = results.map((tenant) => ({
        ...tenant,
        status: tenant.status || 'unknown',
        userCount: tenant.userCount || 0,
        storageUsed: tenant.storageUsed || '0 MB',
        subscription: {
          plan: tenant.subscription?.plan || 'free',
          mrr: tenant.subscription?.mrr || 0,
          status: tenant.subscription?.status || 'unknown',
        },
        health: {
          status: tenant.health?.status || 'unknown',
          issues: tenant.health?.issues || [],
        },
      }));
      setTenants(processedTenants);
      setLastDoc(null); // Disable pagination for search results
    } catch (error) {
      console.error('Error searching tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'trial':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getHealthColor = (health: TenantMetrics['health']['status']) => {
    switch (health) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box p={3}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Tenant Monitoring</Typography>
                <Box>
                  <TextField
                    size="small"
                    placeholder="Search tenants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    sx={{ mr: 2 }}
                  />
                  <Select
                    size="small"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ mr: 2 }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="trial">Trial</MenuItem>
                  </Select>
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    startIcon={<SearchIcon />}
                  >
                    Search
                  </Button>
                </Box>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Users</TableCell>
                      <TableCell>Storage</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell>MRR</TableCell>
                      <TableCell>Health</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>{tenant.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={tenant.status}
                            size="small"
                            color={getStatusColor(tenant.status)}
                          />
                        </TableCell>
                        <TableCell>{tenant.userCount}</TableCell>
                        <TableCell>{tenant.storageUsed}</TableCell>
                        <TableCell>
                          <Chip
                            label={tenant.subscription?.plan || 'free'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>${tenant.subscription?.mrr || 0}</TableCell>
                        <TableCell>
                          <Chip
                            label={tenant.health?.status || 'unknown'}
                            size="small"
                            color={getHealthColor(tenant.health?.status || 'unknown')}
                            icon={
                              tenant.health?.status !== 'healthy' ? (
                                <WarningIcon />
                              ) : undefined
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setDetailsDialog(true);
                            }}
                          >
                            <InfoIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Tenant Details Dialog */}
          <Dialog
            open={detailsDialog}
            onClose={() => setDetailsDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Tenant Details: {selectedTenant?.name}
            </DialogTitle>
            <DialogContent>
              {selectedTenant && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Health Issues
                  </Typography>
                  {selectedTenant.health?.issues.map((issue, index) => (
                    <Typography key={index} color="error">
                      • {issue}
                    </Typography>
                  ))}

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Activity Metrics
                  </Typography>
                  {/* Add activity metrics */}

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Resource Usage
                  </Typography>
                  {/* Add resource usage metrics */}

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Support History
                  </Typography>
                  {/* Add support ticket history */}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(false)}>Close</Button>
              <Button variant="contained" color="primary">
                View Full Analytics
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default TenantMonitoring;

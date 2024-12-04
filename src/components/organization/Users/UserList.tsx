import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useRBAC } from '../../../hooks/useRBAC';
import { collection, getDocs, query, where, getFirestore, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useStore } from '../../../store';

interface User {
  id: string;
  email: string;
  displayName: string;
  organizationRoles: string[];
  platformRole?: string;
  status?: 'active' | 'inactive' | 'pending';
  divisionId?: string;
  branchId?: string;
  tenantId: string;
  metadata?: {
    createdAt: any;
    updatedAt: any;
    lastLoginAt?: any;
  };
}

const UserList: React.FC = () => {
  const { hasPermission } = useRBAC();
  const { user: currentUser } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    displayName: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser?.tenantId) {
        setError('User not authenticated or no organization access');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const db = getFirestore();
        const usersRef = collection(db, 'tenants', currentUser.tenantId, 'users');
        const usersQuery = query(usersRef);
        const usersSnapshot = await getDocs(usersQuery);
        
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser?.tenantId]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({ email: '', role: '', displayName: '' });
    setOpenDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      role: user.organizationRoles[0] || '',
      displayName: user.displayName || '',
    });
    setOpenDialog(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!currentUser?.tenantId) return;
    
    if (window.confirm(`Are you sure you want to delete ${user.displayName || user.email}?`)) {
      try {
        setLoading(true);
        const db = getFirestore();
        const userRef = doc(db, 'tenants', currentUser.tenantId, 'users', user.id);
        await deleteDoc(userRef);
        
        // Update local state
        setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveUser = async () => {
    if (!currentUser?.tenantId) return;

    try {
      setLoading(true);
      const db = getFirestore();
      
      if (selectedUser) {
        // Update existing user
        const userRef = doc(db, 'tenants', currentUser.tenantId, 'users', selectedUser.id);
        await updateDoc(userRef, {
          displayName: formData.displayName,
          organizationRoles: [formData.role],
          metadata: {
            ...selectedUser.metadata,
            updatedAt: new Date(),
          },
        });

        // Update local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === selectedUser.id
              ? {
                  ...user,
                  displayName: formData.displayName,
                  organizationRoles: [formData.role],
                  metadata: {
                    ...user.metadata,
                    updatedAt: new Date(),
                  },
                }
              : user
          )
        );
      }

      setOpenDialog(false);
      setSelectedUser(null);
      setFormData({ email: '', role: '', displayName: '' });
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const getRoleDisplay = (user: User) => {
    if (user.platformRole === 'orgAdmin') return 'Organization Admin';
    return user.organizationRoles?.[0] || 'No Role';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Users</Typography>
        {hasPermission('users.create') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
          >
            Add User
          </Button>
        )}
      </Box>

      {users.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>No users found</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Division/Branch</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleDisplay(user)}
                      color={user.platformRole === 'orgAdmin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.divisionId && `Division: ${user.divisionId}`}
                    {user.branchId && user.divisionId && <br />}
                    {user.branchId && `Branch: ${user.branchId}`}
                  </TableCell>
                  <TableCell>
                    {user.metadata?.updatedAt?.toDate().toLocaleDateString() || 'N/A'}
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: '100px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="Edit user">
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                          sx={{ '&:hover': { color: 'primary.main' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete user">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user)}
                          sx={{ '&:hover': { color: 'error.main' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{selectedUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, pb: 1 }}>
            <TextField
              fullWidth
              label="Display Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              disabled={!!selectedUser}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="representative">Representative</MenuItem>
                <MenuItem value="branchManager">Branch Manager</MenuItem>
                <MenuItem value="divisionManager">Division Manager</MenuItem>
                <MenuItem value="orgAdmin">Organization Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            {selectedUser ? 'Save Changes' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList;

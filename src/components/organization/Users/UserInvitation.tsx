import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { getFirestore, collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useStore } from '../../../store';
import { useRBAC } from '../../../hooks/useRBAC';

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'expired' | 'accepted';
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  tenantId: string;
}

const UserInvitation: React.FC = () => {
  const { user } = useStore();
  const { hasPermission } = useRBAC();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: 'user',
  });

  // Fetch invitations
  useEffect(() => {
    if (!user?.tenantId || !hasPermission({ resource: 'users', action: 'invite' })) return;

    setLoading(true);
    const db = getFirestore();
    const invitationsRef = collection(db, 'tenants', user.tenantId, 'invitations');
    const invitationsQuery = query(invitationsRef, where('tenantId', '==', user.tenantId));

    const unsubscribe = onSnapshot(invitationsQuery,
      (snapshot) => {
        const invitationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          invitedAt: doc.data().invitedAt?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate(),
        })) as Invitation[];
        
        setInvitations(invitationsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching invitations:', err);
        setError('Failed to load invitations');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.tenantId, hasPermission]);

  const handleCreateInvitation = async () => {
    if (!user?.tenantId || !hasPermission({ resource: 'users', action: 'invite' })) {
      setError('You do not have permission to create invitations');
      return;
    }

    try {
      setLoading(true);
      const db = getFirestore();
      const invitationsRef = collection(db, 'tenants', user.tenantId, 'invitations');

      // Create expiration date (48 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      await addDoc(invitationsRef, {
        email: newInvitation.email.toLowerCase(),
        role: newInvitation.role,
        status: 'pending',
        invitedBy: user.email,
        invitedAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt),
        tenantId: user.tenantId,
      });

      setOpenDialog(false);
      setNewInvitation({ email: '', role: 'user' });
      // TODO: Trigger email sending logic here
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError('Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    if (!user?.tenantId || !hasPermission({ resource: 'users', action: 'invite' })) {
      setError('You do not have permission to resend invitations');
      return;
    }

    try {
      setLoading(true);
      const db = getFirestore();
      const invitationRef = doc(db, 'tenants', user.tenantId, 'invitations', invitationId);

      // Update expiration date (48 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      await updateDoc(invitationRef, {
        status: 'pending',
        invitedAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt),
      });

      // TODO: Trigger email sending logic here
    } catch (err) {
      console.error('Error resending invitation:', err);
      setError('Failed to resend invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!user?.tenantId || !hasPermission({ resource: 'users', action: 'invite' })) {
      setError('You do not have permission to delete invitations');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this invitation?')) return;

    try {
      setLoading(true);
      const db = getFirestore();
      const invitationRef = doc(db, 'tenants', user.tenantId, 'invitations', invitationId);
      await deleteDoc(invitationRef);
    } catch (err) {
      console.error('Error deleting invitation:', err);
      setError('Failed to delete invitation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Invitation['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'expired':
        return 'error';
      case 'accepted':
        return 'success';
      default:
        return 'default';
    }
  };

  const isExpired = (expiresAt: Date) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        mt: -1 
      }}>
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 500 }}>
          User Invitations
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={loading || !hasPermission({ resource: 'users', action: 'invite' })}
          size="medium"
          sx={{ 
            textTransform: 'none',
            px: 2
          }}
        >
          Invite User
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ 
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mt: 1
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Invited By</TableCell>
              <TableCell>Invited At</TableCell>
              <TableCell>Expires</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invitations.map(invitation => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  <Chip
                    label={invitation.role}
                    size="small"
                    color={invitation.role === 'admin' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={invitation.status}
                    size="small"
                    color={getStatusColor(invitation.status)}
                  />
                </TableCell>
                <TableCell>{invitation.invitedBy}</TableCell>
                <TableCell>
                  {invitation.invitedAt.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Typography
                    color={isExpired(invitation.expiresAt) ? 'error' : 'inherit'}
                  >
                    {invitation.expiresAt.toLocaleDateString()}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {!loading && invitations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No pending invitations
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={() => !loading && setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invite New User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={newInvitation.email}
              onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
              disabled={loading}
            />
            <TextField
              fullWidth
              select
              label="Role"
              value={newInvitation.role}
              onChange={(e) => setNewInvitation({ ...newInvitation, role: e.target.value })}
              disabled={loading}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateInvitation}
            disabled={loading || !newInvitation.email}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserInvitation;

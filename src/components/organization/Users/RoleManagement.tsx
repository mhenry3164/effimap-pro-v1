import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useRBAC } from '../../../hooks/useRBAC';
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useStore } from '../../../store';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
  conditions?: Record<string, any>;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

const defaultRoles: Role[] = [
  {
    id: 'org-admin',
    name: 'Organization Admin',
    description: 'Full access to all organization resources',
    permissions: [],
    isSystem: true,
  },
  {
    id: 'division-admin',
    name: 'Division Admin',
    description: 'Manage division resources and users',
    permissions: ['users.view', 'users.create', 'users.update'],
    isSystem: true,
  },
  {
    id: 'branch-admin',
    name: 'Branch Admin',
    description: 'Manage branch resources',
    permissions: [],
    isSystem: true,
  },
  {
    id: 'territory-manager',
    name: 'Territory Manager',
    description: 'Manage assigned territories',
    permissions: [],
    isSystem: true,
  },
];

const availablePermissions: Permission[] = [
  {
    id: 'users.view',
    resource: 'users',
    action: 'view',
    description: 'View users in the organization',
  },
  {
    id: 'users.create',
    resource: 'users',
    action: 'create',
    description: 'Create new users',
  },
  {
    id: 'users.update',
    resource: 'users',
    action: 'update',
    description: 'Update existing users',
  },
  {
    id: 'users.delete',
    resource: 'users',
    action: 'delete',
    description: 'Delete users',
  },
  {
    id: 'roles.view',
    resource: 'roles',
    action: 'view',
    description: 'View roles and permissions',
  },
  {
    id: 'roles.create',
    resource: 'roles',
    action: 'create',
    description: 'Create new roles',
  },
  {
    id: 'roles.update',
    resource: 'roles',
    action: 'update',
    description: 'Update existing roles',
  },
  {
    id: 'roles.delete',
    resource: 'roles',
    action: 'delete',
    description: 'Delete roles',
  },
];

const RoleManagement: React.FC = () => {
  const { hasPermission } = useRBAC();
  const { user } = useStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [editedRoles, setEditedRoles] = useState<Record<string, {
    name: string;
    description: string;
    permissions: string[];
  }>>({});

  // Fetch roles from Firestore
  useEffect(() => {
    if (!user?.tenantId) return;

    const fetchRoles = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        const rolesRef = collection(db, 'tenants', user.tenantId, 'roles');
        
        // First, check if the user has permission to view roles
        if (!hasPermission({ resource: 'roles', action: 'view' })) {
          setError('You do not have permission to view roles');
          return;
        }

        const rolesQuery = query(rolesRef, where('tenantId', '==', user.tenantId));
        const unsubscribe = onSnapshot(rolesQuery, 
          (snapshot) => {
            const rolesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Role[];
            
            // Combine system roles with custom roles, ensuring system roles come first
            const allRoles = [...defaultRoles, ...rolesData.filter(role => !role.isSystem)];
            setRoles(allRoles);
            
            // Initialize edited roles state
            const initialEditState = allRoles.reduce((acc, role) => ({
              ...acc,
              [role.id]: {
                name: role.name,
                description: role.description || '',
                permissions: role.permissions || [],
              }
            }), {});
            setEditedRoles(initialEditState);
            
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error('Error fetching roles:', err);
            setError('Failed to load roles. Please try again.');
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error('Error in fetchRoles:', err);
        setError('Failed to initialize roles. Please try again.');
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user?.tenantId, hasPermission]);

  const handleAccordionChange = (roleId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    if (!hasPermission({ resource: 'roles', action: 'update' })) {
      setError('You do not have permission to edit roles');
      return;
    }

    if (!isExpanded) {
      setExpandedRole(null);
      return;
    }
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) return;
    setExpandedRole(roleId);
  };

  const handlePermissionChange = (roleId: string, permissionId: string) => {
    if (!hasPermission({ resource: 'roles', action: 'update' })) {
      setError('You do not have permission to modify role permissions');
      return;
    }

    const currentRole = editedRoles[roleId];
    if (!currentRole) return;

    const newPermissions = currentRole.permissions.includes(permissionId)
      ? currentRole.permissions.filter(p => p !== permissionId)
      : [...currentRole.permissions, permissionId];

    setEditedRoles({
      ...editedRoles,
      [roleId]: {
        ...currentRole,
        permissions: newPermissions,
      }
    });
  };

  const handleSaveRole = async (roleId: string) => {
    if (!user?.tenantId) return;
    if (!hasPermission({ resource: 'roles', action: 'update' })) {
      setError('You do not have permission to save role changes');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore();
      const roleRef = doc(db, 'tenants', user.tenantId, 'roles', roleId);
      
      const updatedRole = editedRoles[roleId];
      await updateDoc(roleRef, {
        ...updatedRole,
        updatedAt: new Date(),
        updatedBy: user.id,
      });

      setExpandedRole(null);
      setError('Role updated successfully');
    } catch (err) {
      console.error('Error saving role:', err);
      setError('Failed to save role changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !roles.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Role Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {/* TODO: Implement new role creation */}}
        >
          Add Custom Role
        </Button>
      </Box>

      {roles.map((role) => (
        <Accordion
          key={role.id}
          expanded={expandedRole === role.id}
          onChange={handleAccordionChange(role.id)}
          sx={{ 
            mb: 1,
            '&.Mui-disabled': {
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
            },
            '& .MuiAccordionSummary-root': {
              cursor: role.isSystem ? 'not-allowed' : 'pointer',
              minHeight: '64px',
              '&.Mui-expanded': {
                minHeight: '64px',
              }
            },
            '& .MuiAccordionSummary-content': {
              margin: '12px 0',
              '&.Mui-expanded': {
                margin: '12px 0'
              }
            }
          }}
          disabled={role.isSystem}
        >
          <AccordionSummary 
            expandIcon={!role.isSystem && <ExpandMoreIcon />}
            sx={{
              '&.Mui-disabled': {
                opacity: 1,
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              width: '100%',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 500 }}>{role.name}</Typography>
                {role.isSystem && (
                  <Chip
                    label="System Role"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '50%' }}>
                {role.description}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, pb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Role Name"
                value={editedRoles[role.id]?.name || ''}
                onChange={(e) => setEditedRoles({
                  ...editedRoles,
                  [role.id]: { ...editedRoles[role.id], name: e.target.value }
                })}
                disabled={role.isSystem || loading}
              />
              
              <TextField
                fullWidth
                label="Description"
                value={editedRoles[role.id]?.description || ''}
                onChange={(e) => setEditedRoles({
                  ...editedRoles,
                  [role.id]: { ...editedRoles[role.id], description: e.target.value }
                })}
                multiline
                rows={2}
                disabled={role.isSystem || loading}
              />

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1">Permissions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {availablePermissions.map((permission) => (
                  <FormControlLabel
                    key={permission.id}
                    control={
                      <Checkbox
                        checked={editedRoles[role.id]?.permissions.includes(permission.id)}
                        onChange={() => handlePermissionChange(role.id, permission.id)}
                        disabled={role.isSystem || loading}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">{permission.description}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {`${permission.resource}.${permission.action}`}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>

              {!role.isSystem && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveRole(role.id)}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default RoleManagement;

import React from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  AccountTree as RolesIcon,
  LocationCity as BranchIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRBAC } from '../../hooks/useRBAC';
import { useState } from 'react';

const OrganizationNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useRBAC();
  const [open, setOpen] = useState(true);

  const isSelected = (path: string) => location.pathname === `/organization${path}`;

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <BusinessIcon />
        </ListItemIcon>
        <ListItemText primary="Organization" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {hasPermission({ resource: 'organization', action: 'read' }) && (
            <ListItemButton
              sx={{ pl: 4 }}
              selected={isSelected('/')}
              onClick={() => navigate('/organization')}
            >
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          )}

          {hasPermission({ resource: 'users', action: 'read' }) && (
            <ListItemButton
              sx={{ pl: 4 }}
              selected={isSelected('/users')}
              onClick={() => navigate('/organization/users')}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>
          )}

          {hasPermission({ resource: 'roles', action: 'read' }) && (
            <ListItemButton
              sx={{ pl: 4 }}
              selected={isSelected('/roles')}
              onClick={() => navigate('/organization/roles')}
            >
              <ListItemIcon>
                <RolesIcon />
              </ListItemIcon>
              <ListItemText primary="Roles" />
            </ListItemButton>
          )}

          {hasPermission({ resource: 'branches', action: 'read' }) && (
            <ListItemButton
              sx={{ pl: 4 }}
              selected={isSelected('/branches')}
              onClick={() => navigate('/organization/branches')}
            >
              <ListItemIcon>
                <BranchIcon />
              </ListItemIcon>
              <ListItemText primary="Branches" />
            </ListItemButton>
          )}
        </List>
      </Collapse>
    </>
  );
};

export default OrganizationNav;

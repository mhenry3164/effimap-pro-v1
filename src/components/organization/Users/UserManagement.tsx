import React from 'react';
import { Box, Typography, Tabs, Tab, Container, Paper } from '@mui/material';
import UserList from './UserList';
import RoleManagement from './RoleManagement';
import UserInvitation from './UserInvitation';
import { useStore } from '../../../store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-management-tabpanel-${index}`}
      aria-labelledby={`user-management-tab-${index}`}
      {...other}
      style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `user-management-tab-${index}`,
    'aria-controls': `user-management-tabpanel-${index}`,
  };
}

export default function UserManagement() {
  const [value, setValue] = React.useState(0);
  const { user } = useStore();
  const isOrgAdmin = user?.organizationRoles?.includes('orgAdmin');

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (!user?.tenantId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <Typography>Please select an organization to continue.</Typography>
      </Box>
    );
  }

  if (!isOrgAdmin) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <Typography>Only organization administrators can access user management.</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ height: '100%', py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Manage users, roles, and permissions for your organization
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', height: 'calc(100vh - 250px)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="user management tabs"
            sx={{ px: 2 }}
          >
            <Tab label="Users" {...a11yProps(0)} />
            <Tab label="Roles & Permissions" {...a11yProps(1)} />
            <Tab label="Invitations" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        <TabPanel value={value} index={0}>
          <UserList />
        </TabPanel>
        
        <TabPanel value={value} index={1}>
          <RoleManagement />
        </TabPanel>
        
        <TabPanel value={value} index={2}>
          <UserInvitation />
        </TabPanel>
      </Paper>
    </Container>
  );
}

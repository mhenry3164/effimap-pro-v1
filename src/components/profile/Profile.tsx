import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import { Camera, Settings, Bell, Shield } from 'lucide-react';
import { useStore } from '../../store';
import ProfileInfo from './ProfileInfo';
import SecuritySettings from './SecuritySettings';
import NotificationPreferences from './NotificationPreferences';
import ProfileHeader from './ProfileHeader';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useStore();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <ProfileHeader user={user} />
      
      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="profile settings tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
          }}
        >
          <Tab
            icon={<Camera className="h-4 w-4" />}
            label="Profile Info"
            {...a11yProps(0)}
          />
          <Tab
            icon={<Shield className="h-4 w-4" />}
            label="Security"
            {...a11yProps(1)}
          />
          <Tab
            icon={<Bell className="h-4 w-4" />}
            label="Notifications"
            {...a11yProps(2)}
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <ProfileInfo user={user} />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <SecuritySettings user={user} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <NotificationPreferences user={user} />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;

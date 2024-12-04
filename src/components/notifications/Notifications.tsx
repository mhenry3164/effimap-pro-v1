import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { BellDot, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { notificationService, type Notification } from '../../services/notificationService';
import NotificationList from './NotificationList';
import { useNavigate } from 'react-router-dom';

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
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `notification-tab-${index}`,
    'aria-controls': `notification-tabpanel-${index}`,
  };
}

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;

    // Subscribe to notifications
    notificationService.subscribeToNotifications(user.uid, (newNotifications) => {
      setNotifications(newNotifications);
    });

    return () => {
      notificationService.unsubscribe();
    };
  }, [user?.uid]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
    }

    // Handle navigation based on notification type/metadata
    if (notification.metadata?.link) {
      navigate(notification.metadata.link);
    }
  };

  const handleClearAll = async () => {
    if (!user?.uid) return;
    const notificationsToDelete = activeTab === 1 
      ? notifications.filter(n => n.read)
      : notifications;
    
    await Promise.all(
      notificationsToDelete.map(n => notificationService.deleteNotification(n.id))
    );
  };

  const filteredNotifications = notifications.filter(n => 
    activeTab === 0 ? !n.read : n.read
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BellDot className="h-6 w-6 text-primary mr-2" />
          <Typography variant="h5" component="h1">
            Notifications
          </Typography>
          {filteredNotifications.length > 0 && (
            <Button
              startIcon={<Trash2 className="h-4 w-4" />}
              onClick={handleClearAll}
              sx={{ ml: 'auto' }}
            >
              Clear {activeTab === 0 ? 'Unread' : 'Read'}
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="notification tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Unread" {...a11yProps(0)} />
          <Tab label="Read" {...a11yProps(1)} />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <NotificationList
            notifications={notifications.filter(n => !n.read)}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={(id) => notificationService.markAsRead(id)}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <NotificationList
            notifications={notifications.filter(n => n.read)}
            onNotificationClick={handleNotificationClick}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Notifications;

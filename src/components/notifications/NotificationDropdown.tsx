import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Popper,
  Grow,
  ClickAwayListener,
  Button,
  Typography,
  IconButton,
  Badge,
} from '@mui/material';
import { BellDot, X } from 'lucide-react';
import { useStore } from '../../store';
import { notificationService, type Notification } from '../../services/notificationService';
import NotificationList from './NotificationList';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;

    // Subscribe to notifications
    notificationService.subscribeToNotifications(user.uid, (newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter((n) => !n.read).length);
    });

    return () => {
      notificationService.unsubscribe();
    };
  }, [user?.uid]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
    }

    // Handle navigation based on notification type/metadata
    if (notification.metadata?.link) {
      navigate(notification.metadata.link);
    }

    setOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;
    await notificationService.markAllAsRead(user.uid);
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleToggle}
        className={className}
        color="inherit"
      >
        <Badge badgeContent={unreadCount} color="error">
          <BellDot className="h-5 w-5" />
        </Badge>
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
        transition
        disablePortal
        style={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper
              sx={{
                width: 360,
                maxWidth: '100%',
                mt: 1,
                maxHeight: 'calc(100vh - 100px)',
                display: 'flex',
                flexDirection: 'column',
              }}
              elevation={8}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="h6">Notifications</Typography>
                    <Box>
                      {unreadCount > 0 && (
                        <Button
                          size="small"
                          onClick={handleMarkAllAsRead}
                          sx={{ mr: 1 }}
                        >
                          Mark all as read
                        </Button>
                      )}
                      <IconButton size="small" onClick={handleClose as any}>
                        <X className="h-4 w-4" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <NotificationList
                      notifications={notifications}
                      onNotificationClick={handleNotificationClick}
                      onMarkAsRead={(id) => notificationService.markAsRead(id)}
                    />
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default NotificationDropdown;

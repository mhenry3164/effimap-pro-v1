import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Divider,
} from '@mui/material';
import {
  Info as InfoIcon,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Circle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type Notification } from '../../services/notificationService';

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  maxHeight?: string | number;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  maxHeight = 400,
}) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <InfoIcon className="text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" />;
      case 'error':
        return <AlertCircle className="text-red-500" />;
      case 'success':
        return <CheckCircle className="text-green-500" />;
      default:
        return <InfoIcon className="text-blue-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'rgb(59, 130, 246)';
      case 'warning':
        return 'rgb(234, 179, 8)';
      case 'error':
        return 'rgb(239, 68, 68)';
      case 'success':
        return 'rgb(34, 197, 94)';
      default:
        return 'rgb(59, 130, 246)';
    }
  };

  return (
    <List
      sx={{
        width: '100%',
        maxHeight,
        overflow: 'auto',
        padding: 0,
        '& .MuiListItem-root': {
          borderLeft: '4px solid transparent',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      }}
    >
      {notifications.length === 0 ? (
        <ListItem>
          <ListItemText
            primary={
              <Typography variant="body1" color="textSecondary">
                No notifications
              </Typography>
            }
          />
        </ListItem>
      ) : (
        notifications.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <ListItem
              sx={{
                borderLeftColor: notification.read
                  ? 'transparent'
                  : getNotificationColor(notification.type),
                backgroundColor: notification.read
                  ? 'transparent'
                  : 'rgba(0, 0, 0, 0.02)',
              }}
              onClick={() => onNotificationClick(notification)}
              className="cursor-pointer"
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: notification.read ? 'normal' : 'bold',
                    }}
                  >
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ display: 'block' }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      {formatDistanceToNow(notification.createdAt, {
                        addSuffix: true,
                      })}
                    </Typography>
                  </>
                }
              />
              {!notification.read && onMarkAsRead && (
                <Tooltip title="Mark as read">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                  >
                    <Circle className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton edge="end" size="small">
                <MoreVertical className="h-4 w-4" />
              </IconButton>
            </ListItem>
            {index < notifications.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))
      )}
    </List>
  );
};

export default NotificationList;

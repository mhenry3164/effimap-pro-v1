import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Tooltip } from '@mui/material';
import { Edit, Add, Delete, PersonAdd, Settings, AssignmentInd, Business, Map, Person } from '@mui/icons-material';
import { format } from 'date-fns';
import { Activity, ActivityType } from '../../services/activityService';

interface RecentActivityFeedProps {
  activities: Activity[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: ActivityType) => {
    const [entity] = type.split('.');
    
    // First, get the entity-specific icon
    const entityIcon = () => {
      switch (entity) {
        case 'territory':
          return <Map />;
        case 'branch':
          return <Business />;
        case 'user':
          return <Person />;
        case 'settings':
          return <Settings />;
        default:
          return <Edit />;
      }
    };

    // Then, get the action-specific color
    const getIconColor = (type: ActivityType) => {
      if (type.includes('create')) return "success";
      if (type.includes('delete')) return "error";
      return "primary";
    };

    return React.cloneElement(entityIcon(), { color: getIconColor(type) });
  };

  const getActivityText = (activity: Activity) => {
    const [entity, action] = activity.type.split('.');
    
    // Format the entity type to be more readable
    const formatEntity = (entity: string) => {
      switch (entity) {
        case 'territory':
          return 'Territory';
        case 'branch':
          return 'Branch';
        case 'user':
          return 'User';
        case 'settings':
          return 'Settings';
        default:
          return entity;
      }
    };

    // Get a user-friendly action description
    const getActionDescription = (action: string, entity: string) => {
      switch (action) {
        case 'create':
          return `created a new ${formatEntity(entity)}`;
        case 'edit':
          return `modified ${formatEntity(entity)}`;
        case 'delete':
          return `deleted ${formatEntity(entity)}`;
        case 'assign':
          return `assigned ${formatEntity(entity)}`;
        case 'invite':
          return 'invited a new user';
        case 'update':
          return 'updated settings';
        default:
          return action;
      }
    };

    const actionText = getActionDescription(action, entity);
    const userName = activity.userName || 'Unknown User';
    
    return (
      <Box>
        <Typography component="span" fontWeight="600" color="text.primary">
          {userName}
        </Typography>
        <Typography component="span" color="text.primary" sx={{ ml: 1 }}>
          {actionText}
        </Typography>
        {activity.entityName && (
          <Typography component="span" fontStyle="italic" color="text.secondary" sx={{ ml: 1 }}>
            "{activity.entityName}"
          </Typography>
        )}
      </Box>
    );
  };

  const getActivityDetails = (activity: Activity) => {
    if (!activity.details) return null;
    
    const details = [];
    
    if (activity.details.reason) {
      details.push(`Reason: ${activity.details.reason}`);
    }
    
    if (activity.details.changes) {
      const changes = Object.entries(activity.details.changes)
        .map(([field, { old, new: newVal }]) => {
          const formatValue = (val: any) => val === undefined ? 'none' : val;
          return `${field}: ${formatValue(old)} → ${formatValue(newVal)}`;
        });
      details.push(...changes);
    }
    
    return details.length > 0 ? details.join('\n') : null;
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: 'text.primary',
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -1,
            left: 0,
            width: 32,
            height: 2,
            bgcolor: 'primary.main',
          },
        }}
      >
        Recent Activity
      </Typography>
      
      <List sx={{ 
        flex: 1,
        overflow: 'auto',
        width: '100%',
        mx: -2, // Compensate for parent padding
        px: 2, // Add padding back to content
      }}>
        {activities.map((activity) => (
          <ListItem 
            key={activity.id}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 1,
              mb: 1,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'action.hover',
                boxShadow: 2,
              },
              transition: theme => theme.transitions.create(['background-color', 'box-shadow'], {
                duration: theme.transitions.duration.shortest,
              }),
            }}
          >
            <ListItemAvatar>
              <Avatar 
                sx={{ 
                  bgcolor: 'background.default',
                  boxShadow: 1,
                  '& .MuiSvgIcon-root': {
                    fontSize: 24,
                  }
                }}
              >
                {getActivityIcon(activity.type)}
              </Avatar>
            </ListItemAvatar>
            <Tooltip 
              title={getActivityDetails(activity) || ''}
              placement="bottom-start"
              arrow
            >
              <ListItemText
                primary={getActivityText(activity)}
                secondary={format(activity.timestamp, 'MMM dd, yyyy HH:mm')}
                secondaryTypographyProps={{
                  sx: { 
                    color: 'text.secondary',
                    mt: 0.5,
                    fontSize: '0.75rem'
                  }
                }}
                sx={{ 
                  m: 0,
                  '& .MuiListItemText-primary': { 
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    lineHeight: 1.5,
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

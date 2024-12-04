import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  Grid,
} from '@mui/material';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { User } from '../../types/user';
import { useStore } from '../../store';

interface NotificationPreferencesProps {
  user: User;
}

interface NotificationSettings {
  email: {
    assignments: boolean;
    updates: boolean;
    reminders: boolean;
    security: boolean;
  };
  push: {
    assignments: boolean;
    updates: boolean;
    reminders: boolean;
    security: boolean;
  };
  sms: {
    assignments: boolean;
    security: boolean;
  };
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  user,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      assignments: true,
      updates: true,
      reminders: true,
      security: true,
    },
    push: {
      assignments: true,
      updates: true,
      reminders: true,
      security: true,
    },
    sms: {
      assignments: false,
      security: true,
    },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { updateUser } = useStore();

  const handleToggle =
    (channel: keyof NotificationSettings, type: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSettings((prev) => ({
        ...prev,
        [channel]: {
          ...prev[channel],
          [type]: event.target.checked,
        },
      }));
    };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUser({
        ...user,
        notificationPreferences: settings,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update notification preferences'
      );
    } finally {
      setSaving(false);
    }
  };

  const NotificationSection = ({
    title,
    icon,
    channel,
  }: {
    title: string;
    icon: React.ReactNode;
    channel: keyof NotificationSettings;
  }) => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <FormGroup>
        {Object.entries(settings[channel]).map(([type, enabled]) => (
          <FormControlLabel
            key={type}
            control={
              <Switch
                checked={enabled}
                onChange={handleToggle(channel, type)}
              />
            }
            label={
              <Box>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {type}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Receive notifications for {type.toLowerCase()} activities
                </Typography>
              </Box>
            }
          />
        ))}
      </FormGroup>
    </Paper>
  );

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Notification preferences updated successfully
        </Alert>
      )}

      <NotificationSection
        title="Email Notifications"
        icon={<Mail className="h-5 w-5 text-primary" />}
        channel="email"
      />

      <NotificationSection
        title="Push Notifications"
        icon={<Bell className="h-5 w-5 text-primary" />}
        channel="push"
      />

      <NotificationSection
        title="SMS Notifications"
        icon={<Smartphone className="h-5 w-5 text-primary" />}
        channel="sms"
      />

      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving}
        sx={{ mt: 2 }}
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </Box>
  );
};

export default NotificationPreferences;

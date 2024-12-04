import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface PlatformSettings {
  subscriptionPlans: {
    basic: {
      enabled: boolean;
      maxUsers: number;
      price: number;
    };
    professional: {
      enabled: boolean;
      maxUsers: number;
      price: number;
    };
    enterprise: {
      enabled: boolean;
      maxUsers: number;
      price: number;
    };
  };
  features: {
    userInvitations: boolean;
    apiAccess: boolean;
    customBranding: boolean;
    advancedAnalytics: boolean;
  };
  systemNotifications: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    systemAlert: string;
  };
}

const PlatformSettings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    subscriptionPlans: {
      basic: { enabled: true, maxUsers: 5, price: 10 },
      professional: { enabled: true, maxUsers: 20, price: 25 },
      enterprise: { enabled: true, maxUsers: 100, price: 100 },
    },
    features: {
      userInvitations: true,
      apiAccess: true,
      customBranding: true,
      advancedAnalytics: false,
    },
    systemNotifications: {
      maintenanceMode: false,
      maintenanceMessage: '',
      systemAlert: '',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'platform', 'settings'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as PlatformSettings);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setSnackbar({
        open: true,
        message: 'Error loading settings',
        severity: 'error',
      });
    }
  };

  const saveSettings = async () => {
    try {
      await updateDoc(doc(db, 'platform', 'settings'), settings);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({
        open: true,
        message: 'Error saving settings',
        severity: 'error',
      });
    }
  };

  const handlePlanChange = (plan: keyof PlatformSettings['subscriptionPlans'], field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      subscriptionPlans: {
        ...prev.subscriptionPlans,
        [plan]: {
          ...prev.subscriptionPlans[plan],
          [field]: value,
        },
      },
    }));
  };

  const handleFeatureToggle = (feature: keyof PlatformSettings['features']) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature],
      },
    }));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Platform Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Subscription Plans */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subscription Plans
              </Typography>
              {Object.entries(settings.subscriptionPlans).map(([plan, details]) => (
                <Box key={plan} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                    {plan} Plan
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={details.enabled}
                            onChange={(e) => handlePlanChange(plan as any, 'enabled', e.target.checked)}
                          />
                        }
                        label="Enabled"
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        label="Max Users"
                        type="number"
                        value={details.maxUsers}
                        onChange={(e) => handlePlanChange(plan as any, 'maxUsers', parseInt(e.target.value))}
                        size="small"
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        label="Price"
                        type="number"
                        value={details.price}
                        onChange={(e) => handlePlanChange(plan as any, 'price', parseInt(e.target.value))}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Feature Flags */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Feature Flags
              </Typography>
              {Object.entries(settings.features).map(([feature, enabled]) => (
                <FormControlLabel
                  key={feature}
                  control={
                    <Switch
                      checked={enabled}
                      onChange={() => handleFeatureToggle(feature as keyof PlatformSettings['features'])}
                    />
                  }
                  label={feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                />
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* System Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.systemNotifications.maintenanceMode}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      systemNotifications: {
                        ...prev.systemNotifications,
                        maintenanceMode: e.target.checked,
                      },
                    }))}
                  />
                }
                label="Maintenance Mode"
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Maintenance Message"
                value={settings.systemNotifications.maintenanceMessage}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  systemNotifications: {
                    ...prev.systemNotifications,
                    maintenanceMessage: e.target.value,
                  },
                }))}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="System Alert"
                value={settings.systemNotifications.systemAlert}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  systemNotifications: {
                    ...prev.systemNotifications,
                    systemAlert: e.target.value,
                  },
                }))}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={saveSettings}
          disabled={isLoading}
        >
          Save Settings
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity as 'success' | 'error'}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlatformSettings;

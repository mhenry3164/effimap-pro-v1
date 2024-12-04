import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  InputAdornment,
  Switch,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import { ChromePicker } from 'react-color';
import { useTenant } from '../../../providers/TenantProvider';
import { useRBAC } from '../../../hooks/useRBAC';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const OrganizationSettings: React.FC = () => {
  const { tenant } = useTenant();
  const { checkPermission, loading: rbacLoading } = useRBAC();
  const [activeTab, setActiveTab] = useState(0);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [canUpdateSettings, setCanUpdateSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    general: {
      name: tenant.name || '',
      timezone: tenant.settings?.timezone || 'UTC',
      dateFormat: tenant.settings?.dateFormat || 'MM/DD/YYYY',
    },
    branding: {
      primaryColor: tenant.settings?.branding?.primaryColor || '#003f88',
      logo: tenant.settings?.branding?.logo || '',
      favicon: tenant.settings?.branding?.favicon || '',
    },
    api: {
      rateLimit: tenant.settings?.api?.rateLimit || 100,
      enabled: tenant.settings?.api?.enabled || false,
      webhookUrl: tenant.settings?.api?.webhookUrl || '',
    },
    map: {
      defaultCenter: tenant.settings?.map?.center || [0, 0],
      defaultZoom: tenant.settings?.map?.zoom || 4,
      showTraffic: tenant.settings?.map?.showTraffic || false,
      clusterMarkers: tenant.settings?.map?.clusterMarkers || true,
    },
  });

  useEffect(() => {
    const checkSettingsPermission = async () => {
      const hasPermission = await checkPermission({ resource: 'settings', action: 'update' });
      setCanUpdateSettings(hasPermission);
    };
    checkSettingsPermission();
  }, [checkPermission]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!canUpdateSettings) return;
    
    setLoading(true);
    setError(null);
    try {
      // Save settings logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      // TODO: Implement actual settings update
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(typeof err === 'string' ? err : err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        {(loading || rbacLoading) && <LinearProgress />}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="General" />
          <Tab label="Branding" />
          <Tab label="API Settings" />
          <Tab label="Map Defaults" />
        </Tabs>

        {/* General Settings */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Organization Name"
                value={settings.general.name}
                onChange={(e) => handleSettingChange('general', 'name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.general.timezone}
                  label="Timezone"
                  onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">Eastern Time</MenuItem>
                  <MenuItem value="America/Chicago">Central Time</MenuItem>
                  <MenuItem value="America/Denver">Mountain Time</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={settings.general.dateFormat}
                  label="Date Format"
                  onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Branding Settings */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Primary Color
                </Typography>
                <Button
                  onClick={() => setColorPickerOpen(!colorPickerOpen)}
                  style={{
                    backgroundColor: settings.branding.primaryColor,
                    width: 100,
                    height: 40,
                  }}
                />
                {colorPickerOpen && (
                  <Box position="absolute" zIndex={1}>
                    <ChromePicker
                      color={settings.branding.primaryColor}
                      onChange={(color) => handleSettingChange('branding', 'primaryColor', color.hex)}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Logo URL"
                value={settings.branding.logo}
                onChange={(e) => handleSettingChange('branding', 'logo', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Favicon URL"
                value={settings.branding.favicon}
                onChange={(e) => handleSettingChange('branding', 'favicon', e.target.value)}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* API Settings */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.api.enabled}
                    onChange={(e) => handleSettingChange('api', 'enabled', e.target.checked)}
                  />
                }
                label="Enable API Access"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Rate Limit (requests per hour)"
                value={settings.api.rateLimit}
                onChange={(e) => handleSettingChange('api', 'rateLimit', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">req/hour</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Webhook URL"
                value={settings.api.webhookUrl}
                onChange={(e) => handleSettingChange('api', 'webhookUrl', e.target.value)}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Map Defaults */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Default Latitude"
                value={settings.map.defaultCenter[0]}
                onChange={(e) => {
                  const newCenter = [...settings.map.defaultCenter];
                  newCenter[0] = parseFloat(e.target.value);
                  handleSettingChange('map', 'defaultCenter', newCenter);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Default Longitude"
                value={settings.map.defaultCenter[1]}
                onChange={(e) => {
                  const newCenter = [...settings.map.defaultCenter];
                  newCenter[1] = parseFloat(e.target.value);
                  handleSettingChange('map', 'defaultCenter', newCenter);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Default Zoom Level"
                value={settings.map.defaultZoom}
                onChange={(e) => handleSettingChange('map', 'defaultZoom', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.map.showTraffic}
                    onChange={(e) => handleSettingChange('map', 'showTraffic', e.target.checked)}
                  />
                }
                label="Show Traffic Layer by Default"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.map.clusterMarkers}
                    onChange={(e) => handleSettingChange('map', 'clusterMarkers', e.target.checked)}
                  />
                }
                label="Enable Marker Clustering"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <Divider />

        <Box p={2} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={loading || rbacLoading || !canUpdateSettings}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrganizationSettings;

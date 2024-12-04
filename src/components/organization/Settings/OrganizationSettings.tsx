import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
} from '@mui/material';
import { useSubscriptionFeatures } from '../../../hooks/useSubscriptionFeatures';
import FeatureGate from '../../common/FeatureGate';
import { useTenant } from '../../../providers/TenantProvider';

const OrganizationSettings: React.FC = () => {
  const { features } = useSubscriptionFeatures();
  const { tenant, updateTenant } = useTenant();

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    // Implement settings update logic
  };

  return (
    <Box component="form" onSubmit={handleSaveSettings}>
      <Grid container spacing={3}>
        {/* Basic Organization Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Organization Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Organization Name"
                    defaultValue={tenant.name}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Primary Contact Email"
                    defaultValue={tenant.contactEmail}
                    type="email"
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* API Access Settings */}
        <Grid item xs={12}>
          <FeatureGate feature="hasApiAccess">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  API Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="API Key"
                      value={tenant.apiKey || 'No API Key Generated'}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="outlined" color="primary">
                      Generate New API Key
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Rate Limit (requests per minute)"
                      defaultValue={tenant.settings?.rateLimit || 60}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </FeatureGate>
        </Grid>

        {/* Custom Branding */}
        <Grid item xs={12}>
          <FeatureGate feature="hasCustomBranding">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Branding
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Primary Color"
                      type="color"
                      defaultValue={tenant.branding?.primaryColor || '#1976d2'}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Secondary Color"
                      type="color"
                      defaultValue={tenant.branding?.secondaryColor || '#dc004e'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="outlined" component="label">
                      Upload Logo
                      <input type="file" hidden accept="image/*" />
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </FeatureGate>
        </Grid>

        {/* Organization-wide Defaults */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Default Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        defaultChecked={tenant.settings?.autoAssignTerritories}
                      />
                    }
                    label="Auto-assign territories to new users"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        defaultChecked={tenant.settings?.enableNotifications}
                      />
                    }
                    label="Enable email notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Default User Role"
                    defaultValue={tenant.settings?.defaultRole || 'member'}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="member">Member</option>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrganizationSettings;

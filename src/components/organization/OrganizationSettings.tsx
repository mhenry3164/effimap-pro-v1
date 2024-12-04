import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../hooks/useAuth';

const OrganizationSettings: React.FC = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();

  // Default features if not provided by tenant
  const features = [
    { name: 'Territory Management', enabled: true },
    { name: 'User Management', enabled: true },
    { name: 'Reports & Analytics', enabled: tenant?.settings?.enableReports ?? false },
    { name: 'Mobile Access', enabled: tenant?.settings?.enableMobileAccess ?? false },
  ];

  return (
    <div className="p-6">
      <Typography variant="h4" className="mb-6">
        Organization Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Organization Details
              </Typography>
              <div className="space-y-4">
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Organization Name
                  </Typography>
                  <Typography>{tenant?.name}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Organization ID
                  </Typography>
                  <Typography>{tenant?.id}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Your Role
                  </Typography>
                  <Typography>
                    {user?.organizationRoles?.join(', ') || 'No role assigned'}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Features & Permissions
              </Typography>
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.name}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {feature.name}
                    </Typography>
                    <Typography>{feature.enabled ? 'Enabled' : 'Disabled'}</Typography>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default OrganizationSettings;

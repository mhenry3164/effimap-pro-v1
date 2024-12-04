import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Alert,
  Typography,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Key, Shield, Smartphone } from 'lucide-react';
import { User } from '../../types/user';
import { auth } from '../../firebase';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

interface SecuritySettingsProps {
  user: User;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser?.email) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, passwordForm.newPassword);

      setSuccess(true);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update password'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTwoFactorToggle = () => {
    // TODO: Implement 2FA toggle logic
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Security settings updated successfully
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Key className="h-5 w-5 text-primary mr-2" />
              <Typography variant="h6" color="primary">
                Change Password
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handlePasswordSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{ mt: 1 }}
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Smartphone className="h-5 w-5 text-primary mr-2" />
              <Typography variant="h6" color="primary">
                Two-Factor Authentication
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={twoFactorEnabled}
                  onChange={handleTwoFactorToggle}
                />
              }
              label="Enable Two-Factor Authentication"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Add an extra layer of security to your account by requiring both your
              password and a verification code from your phone.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecuritySettings;

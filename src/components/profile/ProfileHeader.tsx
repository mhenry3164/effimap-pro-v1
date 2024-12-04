import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  IconButton,
  Badge,
} from '@mui/material';
import { Camera, Edit } from 'lucide-react';
import { User } from '../../types/user';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useStore } from '../../store';

interface ProfileHeaderProps {
  user: User;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const [uploading, setUploading] = useState(false);
  const { updateUser } = useStore();

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user.uid) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      // Update user profile with new photo URL
      await updateUser({
        ...user,
        photoURL,
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        position: 'relative',
        backgroundImage: 'linear-gradient(to right, #4F46E5, #7C3AED)',
        color: 'white',
      }}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <label htmlFor="avatar-upload">
            <input
              accept="image/*"
              id="avatar-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
              disabled={uploading}
            />
            <IconButton
              component="span"
              sx={{
                bgcolor: 'white',
                '&:hover': { bgcolor: 'grey.100' },
              }}
              disabled={uploading}
            >
              <Camera className="h-4 w-4 text-gray-600" />
            </IconButton>
          </label>
        }
      >
        <Avatar
          src={user.photoURL || undefined}
          sx={{
            width: 80,
            height: 80,
            border: '4px solid white',
          }}
        >
          {user.email?.[0].toUpperCase()}
        </Avatar>
      </Badge>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          {user.displayName || user.email}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          {user.organizationRoles?.[0] || user.platformRole}
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<Edit className="h-4 w-4" />}
        sx={{
          ml: 'auto',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        Edit Profile
      </Button>
    </Paper>
  );
};

export default ProfileHeader;

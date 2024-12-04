import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import AuthForm from './AuthForm';
import LoadingScreen from '../shared/LoadingScreen';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, initAuth } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!loading.auth && !user) {
      navigate('/login');
    }
  }, [user, loading.auth, navigate]);

  if (loading.auth) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
}
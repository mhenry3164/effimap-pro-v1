import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Navigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { auth, db } from '../../firebase';
import { useStore } from '../../store';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { User } from '../../types/user';

interface AuthFormProps {
  type?: 'login' | 'signup';
}

export default function AuthForm({ type = 'login' }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, initAuth } = useStore();

  useEffect(() => {
    const init = async () => {
      try {
        await initAuth();
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };
    init();
  }, [initAuth]);

  // Handle successful authentication
  const handleAuthSuccess = async (firebaseUser: any) => {
    try {
      console.log('Handling auth success for user:', firebaseUser.uid);
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      // Create initial user data
      const initialUserData = {
        displayName: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        tenantId: firebaseUser.email?.endsWith('@heavy-llc.com') ? 'heavy-machines' : '',
        organizationRoles: ['orgAdmin'],
        platformRole: 'orgAdmin',
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active'
        }
      };

      let userData;
      
      try {
        // First try to get existing user document
        const userDoc = await getDoc(userDocRef);
        console.log('Attempting to fetch user document...');
        
        if (userDoc.exists()) {
          console.log('User document found');
          userData = userDoc.data();
        } else {
          console.log('No user document found, creating new one...');
          // Create new user document
          await setDoc(userDocRef, initialUserData);
          userData = initialUserData;
        }
      } catch (error: any) {
        console.error('Firestore error:', error);
        
        if (error.code === 'permission-denied') {
          // Handle permission denied error specifically
          console.log('Permission denied, attempting to proceed with initial data');
          // Use the initial data as fallback
          userData = initialUserData;
          
          // Create the user object with initial data
          const appUser: User = {
            id: firebaseUser.uid,
            ...initialUserData
          };
          
          setUser(appUser);
          console.log('Proceeding with default user profile');
          
          // Navigate based on email domain
          if (firebaseUser.email?.endsWith('@heavy-llc.com')) {
            navigate('/organization/dashboard');
            return;
          } else {
            navigate('/dashboard');
            return;
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
      
      // Create the user object for our application state
      const appUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: userData.displayName || firebaseUser.displayName || '',
        photoURL: userData.photoURL || firebaseUser.photoURL || '',
        tenantId: userData.tenantId || '',
        organizationRoles: userData.organizationRoles || [],
        platformRole: userData.platformRole || 'user',
        metadata: userData.metadata || {
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active'
        }
      };
      
      console.log('Setting user in store:', appUser);
      setUser(appUser);
      
      // Determine redirect based on user role
      if (appUser.platformRole === 'platformAdmin') {
        navigate('/platform/dashboard');
      } else if (appUser.organizationRoles?.includes('orgAdmin')) {
        navigate('/organization/dashboard');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Detailed error in handleAuthSuccess:', error);
      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied') {
          setError('Firestore access denied. Please contact support.');
        } else {
          setError(`Firebase error: ${error.message}`);
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error loading user profile');
      }
      setUser(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Starting sign in process...');
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('Firebase auth successful:', userCredential.user.email);
      await handleAuthSuccess(userCredential.user);
    } catch (err: any) {
      console.error('Detailed sign in error:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'An error occurred during sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, redirect
  if (user) {
    if (user.platformRole === 'platformAdmin') {
      return <Navigate to="/platform/dashboard" replace />;
    }
    if (user.organizationRoles?.includes('orgAdmin')) {
      return <Navigate to="/organization/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
                Sign in with Google
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
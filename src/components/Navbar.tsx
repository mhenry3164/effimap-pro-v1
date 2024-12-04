import React from 'react';
import { useStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import { 
  LogOut, 
  Map as MapIcon,
  Bell,
  Settings,
  User,
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <MapIcon className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">EffiMap Pro</span>
          </Link>
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Link
            to="/notifications"
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Profile'}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
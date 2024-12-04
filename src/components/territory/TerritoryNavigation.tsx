import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Map, List, Plus } from 'lucide-react';

const TerritoryNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isRepresentative = user?.organizationRoles?.includes('representative');

  const baseClass = "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors";
  const activeClass = "bg-primary text-white";
  const inactiveClass = "hover:bg-gray-100";

  return (
    <nav className="flex gap-4 mb-6">
      {!isRepresentative && (
        <NavLink
          to="/territories"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <List className="w-5 h-5" />
          <span>Territory List</span>
        </NavLink>
      )}
      
      <NavLink
        to="/territories/map"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        <Map className="w-5 h-5" />
        <span>{isRepresentative ? 'My Territory' : 'Territory Map'}</span>
      </NavLink>

      {!isRepresentative && (
        <NavLink
          to="/territories/new"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <Plus className="w-5 h-5" />
          <span>New Territory</span>
        </NavLink>
      )}
    </nav>
  );
};

export default TerritoryNavigation;

import {
  LayoutDashboard,
  Users2,
  Building2,
  Map,
  Settings,
  BarChart2,
  Globe,
  Target,
  Loader2
} from 'lucide-react';
import { useStore } from '../../store';
import { useRBAC } from '../../hooks/useRBAC';
import { NavMenu } from "../ui/nav-menu";
import { useSidebar } from '../ui/sidebar';

export function RoleNavigation() {
  const { hasPermission } = useRBAC();
  const { user, tenant, loading } = useStore();
  const { isCollapsed, open } = useSidebar();

  // Show loading state while auth is initializing
  if (loading.auth) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user || !tenant) {
    console.log('No user or tenant found:', { user, tenant });
    return null;
  }

  console.log('Current user:', user);
  console.log('Current tenant:', tenant);

  const navigationItems = [];

  // Dashboard is available to everyone
  navigationItems.push({
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  });

  // Platform admin navigation
  if (user.platformRole === 'platformAdmin') {
    console.log('Adding platform admin navigation items');
    navigationItems.push(
      {
        title: "Organizations",
        href: "/organizations",
        icon: Building2,
      },
      {
        title: "Users",
        href: "/users",
        icon: Users2,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      }
    );
  } else {
    // Organization role navigation
    console.log('Adding organization role navigation items');
    
    if (hasPermission({ action: 'view', resource: 'territories' })) {
      navigationItems.push({
        title: "Map Viewer",
        href: "/map",
        icon: Map,
      });

      // Add Territory Management for authorized roles
      if (user.organizationRoles?.some(role => 
        ['orgAdmin', 'divisionAdmin', 'branchAdmin'].includes(role)
      )) {
        navigationItems.push({
          title: "Territory Management",
          href: "/territory-management",
          icon: Target,
        });
      }
    }

    if (hasPermission({ action: 'view', resource: 'divisions' })) {
      navigationItems.push({
        title: "Divisions",
        href: "/divisions",
        icon: Globe,
      });
    }

    if (hasPermission({ action: 'view', resource: 'branches' })) {
      navigationItems.push({
        title: "Branches",
        href: "/branches",
        icon: Building2,
      });
    }

    if (hasPermission({ action: 'view', resource: 'users' })) {
      navigationItems.push({
        title: "Users",
        href: "/users",
        icon: Users2,
      });
    }

    if (hasPermission({ action: 'view', resource: 'reports' })) {
      navigationItems.push({
        title: "Reports",
        href: "/reports",
        icon: BarChart2,
      });
    }

    // Add My Territory for sales representatives
    if (user.organizationRoles?.includes('salesRepresentative')) {
      navigationItems.push({
        title: "My Territory",
        href: "/my-territory",
        icon: Target,
      });
    }

    // Add Settings if user has permission
    if (hasPermission({ action: 'view', resource: 'settings' })) {
      navigationItems.push({
        title: "Settings",
        href: "/settings",
        icon: Settings,
      });
    }

    // Add Advanced Mapping for orgAdmin
    if (user.organizationRoles?.includes('orgAdmin')) {
      navigationItems.push({
        title: "Advanced Mapping",
        href: "/organization/advanced-mapping",
        icon: Map,
      });
    }
  }

  console.log('Navigation items:', navigationItems);

  return (
    <div className="py-2">
      <NavMenu 
        items={navigationItems} 
        collapsed={isCollapsed || !open}
      />
    </div>
  );
}

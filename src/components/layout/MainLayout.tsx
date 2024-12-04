import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SidebarProvider, useSidebar } from '../ui/sidebar';
import { AppSidebar, MobileNav } from '../../components/app-sidebar'; 
import { cn } from '../../lib/utils';
import { MapProvider } from '../../contexts/MapContext';

const MainContent = () => {
  const { open, isCollapsed } = useSidebar();
  
  return (
    <main
      className={cn(
        "flex-1 h-screen overflow-hidden transition-all duration-300 ease-in-out",
        "relative"
      )}
      style={{
        marginLeft: isCollapsed ? '4rem' : (open ? '16rem' : '4rem'),
        width: `calc(100% - ${isCollapsed ? '4rem' : (open ? '16rem' : '4rem')})`
      }}
    >
      <div className="absolute inset-0">
        <Outlet />
      </div>
    </main>
  );
};

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  if (!user) return null;

  return (
    <MapProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen overflow-hidden bg-background">
          <AppSidebar className="fixed top-0 left-0 z-40 h-screen border-r" />
          <MobileNav isOpen={isMobileNavOpen} setIsOpen={setIsMobileNavOpen} />
          <MainContent />
        </div>
      </SidebarProvider>
    </MapProvider>
  );
};

export default MainLayout;

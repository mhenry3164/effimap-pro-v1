import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNav } from './PublicNav';

interface PublicLayoutProps {
}

const PublicLayout: React.FC<PublicLayoutProps> = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1">
        <div className="container relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PublicLayout;

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSidebar } from '../ui/sidebar';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullScreen?: boolean;
}

export default function PageLayout({ 
  children, 
  className,
  fullScreen = false 
}: PageLayoutProps) {
  const { open, isCollapsed } = useSidebar();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "flex flex-col w-full transition-all duration-300 ease-in-out",
        !fullScreen && "container mx-auto space-y-8 p-8",
        fullScreen && "h-full absolute inset-0",
        className
      )}
      style={fullScreen ? {
        width: open && !isCollapsed ? 'calc(100% - 16rem)' : 'calc(100% - 4rem)',
        left: open && !isCollapsed ? '16rem' : '4rem'
      } : undefined}
    >
      {children}
    </motion.div>
  );
}

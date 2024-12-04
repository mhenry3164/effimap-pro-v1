import React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={cn('flex items-center', className)} {...props}>
      <MapPin className="h-full w-full text-primary" />
    </div>
  );
}

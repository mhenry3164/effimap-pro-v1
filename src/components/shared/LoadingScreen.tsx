import React from 'react';
import { MapPin } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <MapPin className="h-12 w-12 text-indigo-600 animate-bounce" />
      <h2 className="mt-4 text-xl font-semibold text-gray-900">
        Loading Territory Manager...
      </h2>
    </div>
  );
}
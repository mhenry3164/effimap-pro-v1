import { PaletteOptions } from '@mui/material';

// Colors from your existing Google Maps configuration
const mapColors = {
  states: {
    primary: '#08519c',
    secondary: '#377eb8',
  },
  counties: {
    primary: '#238b45',
    secondary: '#4daf4a',
  },
  zipCodes: {
    primary: '#d94801',
    secondary: '#ff7f00',
  },
};

export const palette: PaletteOptions = {
  primary: {
    main: '#2563eb', // Blue 600
    light: '#60a5fa', // Blue 400
    dark: '#1d4ed8', // Blue 700
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#4f46e5', // Indigo 600
    light: '#818cf8', // Indigo 400
    dark: '#4338ca', // Indigo 700
    contrastText: '#ffffff',
  },
  error: {
    main: '#dc2626', // Red 600
    light: '#f87171', // Red 400
    dark: '#b91c1c', // Red 700
  },
  warning: {
    main: '#d97706', // Amber 600
    light: '#fbbf24', // Amber 400
    dark: '#b45309', // Amber 700
  },
  info: {
    main: '#0284c7', // Light Blue 600
    light: '#38bdf8', // Light Blue 400
    dark: '#0369a1', // Light Blue 700
  },
  success: {
    main: '#059669', // Emerald 600
    light: '#34d399', // Emerald 400
    dark: '#047857', // Emerald 700
  },
  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  background: {
    default: '#ffffff',
    paper: '#f9fafb',
  },
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    disabled: '#9ca3af',
  },
  divider: '#e5e7eb',
  // Custom colors for map features
  customColors: {
    map: mapColors,
  },
};

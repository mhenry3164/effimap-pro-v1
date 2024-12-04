import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { components } from './components';

// Extend the theme to include custom colors
declare module '@mui/material/styles' {
  interface Theme {
    customColors: {
      map: {
        states: {
          primary: string;
          secondary: string;
        };
        counties: {
          primary: string;
          secondary: string;
        };
        zipCodes: {
          primary: string;
          secondary: string;
        };
      };
    };
  }

  interface ThemeOptions {
    customColors?: {
      map?: {
        states?: {
          primary: string;
          secondary: string;
        };
        counties?: {
          primary: string;
          secondary: string;
        };
        zipCodes?: {
          primary: string;
          secondary: string;
        };
      };
    };
  }
}

const themeOptions: ThemeOptions = {
  palette,
  typography,
  components,
  shape: {
    borderRadius: 6,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    ...Array(18).fill('none'), // Fill remaining shadows with 'none'
  ],
};

export const theme = createTheme(themeOptions);

export type AppTheme = Theme;

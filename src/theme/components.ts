import { Components, Theme } from '@mui/material';

export const components: Components<Theme> = {
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: '0.375rem',
        textTransform: 'none',
        fontWeight: 500,
      },
      contained: {
        '&:hover': {
          boxShadow: 'none',
        },
      },
      sizeLarge: {
        padding: '0.75rem 1.5rem',
      },
      sizeMedium: {
        padding: '0.5rem 1rem',
      },
      sizeSmall: {
        padding: '0.25rem 0.75rem',
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'medium',
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '0.375rem',
        },
      },
    },
  },
  MuiCheckbox: {
    defaultProps: {
      color: 'primary',
    },
    styleOverrides: {
      root: {
        padding: '0.5rem',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      rounded: {
        borderRadius: '0.5rem',
      },
    },
  },
  MuiSelect: {
    defaultProps: {
      variant: 'outlined',
    },
    styleOverrides: {
      outlined: {
        borderRadius: '0.375rem',
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 42,
        height: 26,
        padding: 0,
        '& .MuiSwitch-switchBase': {
          padding: 0,
          margin: 2,
          transitionDuration: '300ms',
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: 0.5,
            },
          },
        },
        '& .MuiSwitch-thumb': {
          boxSizing: 'border-box',
          width: 22,
          height: 22,
        },
        '& .MuiSwitch-track': {
          borderRadius: 26 / 2,
          opacity: 1,
          transition: 'background-color 500ms',
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: 'rgb(17 24 39 / 0.9)',
        padding: '0.5rem 0.75rem',
        fontSize: '0.75rem',
      },
      arrow: {
        color: 'rgb(17 24 39 / 0.9)',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '0.75rem',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: 'rgb(229 231 235)',
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgb(249 250 251)',
        '& .MuiTableCell-root': {
          color: 'rgb(17 24 39)',
          fontWeight: 600,
        },
      },
    },
  },
};

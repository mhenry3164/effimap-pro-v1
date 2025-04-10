import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert, Snackbar, Typography, Box } from '@mui/material';

// Toast types
export type ToastSeverity = 'success' | 'info' | 'warning' | 'error';
export type ToastVariant = 'default' | 'destructive';

// Toast message interface
export interface ToastMessage {
  id: number;
  title?: string;
  message: string;
  description?: string;
  severity: ToastSeverity;
  variant?: ToastVariant;
  autoHideDuration?: number;
}

// Toast options for object-based API
export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  severity?: ToastSeverity;
  duration?: number;
}

// Context interface
interface ToastContextProps {
  showToast: ((message: string, severity?: ToastSeverity, autoHideDuration?: number) => void) & 
             ((options: ToastOptions) => void);
  hideToast: (id: number) => void;
  toasts: ToastMessage[];
}

// Create context with default values
const ToastContext = createContext<ToastContextProps>({
  showToast: (() => {}) as any,
  hideToast: () => {},
  toasts: [],
});

// Toast provider props
interface ToastProviderProps {
  children: ReactNode;
}

// Provider component
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  let nextId = 0;

  // Function to handle both simple and object-based API
  const showToast = (
    messageOrOptions: string | ToastOptions,
    severityArg?: ToastSeverity,
    autoHideDurationArg?: number
  ) => {
    const id = nextId++;
    
    if (typeof messageOrOptions === 'string') {
      // Simple API: showToast(message, severity, duration)
      setToasts((prev) => [
        ...prev, 
        { 
          id, 
          message: messageOrOptions, 
          severity: severityArg || 'info', 
          autoHideDuration: autoHideDurationArg || 6000 
        }
      ]);
    } else {
      // Object API: showToast({ title, description, variant, ... })
      const { title, description, variant = 'default', severity = 'info', duration = 6000 } = messageOrOptions;
      
      // Convert variant to severity if needed
      const finalSeverity = variant === 'destructive' ? 'error' : severity;
      
      setToasts((prev) => [
        ...prev, 
        { 
          id, 
          title, 
          message: description || '', 
          severity: finalSeverity, 
          variant,
          autoHideDuration: duration 
        }
      ]);
    }
    
    return id;
  };

  const hideToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast: showToast as any, hideToast, toasts }}>
      {children}
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.autoHideDuration}
          onClose={() => hideToast(toast.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => hideToast(toast.id)}
            severity={toast.severity}
            sx={{ width: '100%' }}
          >
            {toast.title && (
              <Typography variant="subtitle2" component="div" fontWeight="bold">
                {toast.title}
              </Typography>
            )}
            {toast.title && toast.message ? (
              <Box mt={0.5}>{toast.message}</Box>
            ) : (
              toast.message
            )}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;

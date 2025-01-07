import React, { useEffect, useRef } from 'react';
import { Button } from '../ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements?.length) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div 
        className="fixed inset-0 bg-black bg-opacity-25"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 id="dialog-title" className="text-lg font-semibold mb-4">
          {title}
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

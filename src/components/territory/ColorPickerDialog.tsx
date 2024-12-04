import React, { useState } from 'react';
import { ColorPicker } from '../ui/color-picker';

interface ColorPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fillColor: string, strokeColor: string, fillOpacity: number) => void;
  initialColors: {
    fillColor: string;
    strokeColor: string;
    fillOpacity: number;
  };
}

export const ColorPickerDialog: React.FC<ColorPickerDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialColors,
}) => {
  const [fillColor, setFillColor] = useState(initialColors.fillColor);
  const [strokeColor, setStrokeColor] = useState(initialColors.strokeColor);
  const [fillOpacity, setFillOpacity] = useState(initialColors.fillOpacity);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Territory Colors</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fill Color
            </label>
            <ColorPicker
              color={fillColor}
              onChange={setFillColor}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stroke Color
            </label>
            <ColorPicker
              color={strokeColor}
              onChange={setStrokeColor}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fill Opacity ({Math.round(fillOpacity * 100)}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={fillOpacity * 100}
              onChange={(e) => setFillOpacity(Number(e.target.value) / 100)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(fillColor, strokeColor, fillOpacity)}
            className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  className = '',
  disabled = false,
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          h-10 w-full cursor-pointer rounded-md border border-input
          bg-transparent px-3 py-2 text-sm ring-offset-background
          file:border-0 file:bg-transparent file:text-sm file:font-medium
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
        `}
      />
      <div
        className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
        style={{ backgroundColor: color }}
      >
        <div className="w-6 h-6 rounded-sm border border-gray-300" />
      </div>
    </div>
  );
};

export default ColorPicker;

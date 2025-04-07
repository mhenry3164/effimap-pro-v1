import React, { useEffect, useState } from 'react';

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
  // Maintain internal state for the color value to ensure updates are reflected
  const [currentColor, setCurrentColor] = useState(color);
  
  // Update the internal state when the prop changes
  useEffect(() => {
    if (color !== currentColor) {
      setCurrentColor(color);
    }
  }, [color]);
  
  // Handle color changes
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    onChange(newColor);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <input
        type="color"
        value={currentColor}
        onChange={handleColorChange}
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
        style={{ backgroundColor: currentColor }}
      >
        <div className="w-6 h-6 rounded-sm border border-gray-300" />
      </div>
    </div>
  );
};

// Make sure we're exporting the component correctly
export default ColorPicker;

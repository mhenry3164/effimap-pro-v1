import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../utils/cn';

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  error?: string;
  description?: string;
  formatValue?: (value: number) => string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      label,
      error,
      description,
      formatValue = String,
      value,
      ...props
    },
    ref
  ) => {
    const displayValue = Array.isArray(value) ? value[0] : value;

    return (
      <div className="grid gap-2 w-full">
        <div className="flex justify-between">
          {label && (
            <label
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                error && 'text-destructive'
              )}
            >
              {label}
            </label>
          )}
          {typeof displayValue !== 'undefined' && (
            <span className="text-sm text-muted-foreground">
              {formatValue(displayValue)}
            </span>
          )}
        </div>
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            'relative flex w-full touch-none select-none items-center',
            className
          )}
          value={value}
          {...props}
        >
          <SliderPrimitive.Track
            className={cn(
              'relative h-2 w-full grow overflow-hidden rounded-full bg-secondary',
              error && 'bg-destructive/20'
            )}
          >
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className={cn(
              'block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              error && 'border-destructive'
            )}
          />
        </SliderPrimitive.Root>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };

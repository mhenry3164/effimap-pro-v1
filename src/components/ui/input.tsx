import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  description?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, description, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={`
            flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm 
            ring-offset-background file:border-0 file:bg-transparent 
            file:text-sm file:font-medium placeholder:text-muted-foreground 
            focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-ring focus-visible:ring-offset-2 
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
        {description && !error && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

import React from 'react';
import clsx from 'clsx';

type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  asChild?: boolean;
  // Add the standard button props to handle attributes like type, disabled, etc.
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
};

const Button = ({
  children,
  variant = 'primary',
  asChild = false,
  type = 'button',
  disabled = false,
  className = '',
}: ButtonProps) => {
  if (asChild) {
    return <>{children}</>;  // Just render the children directly if asChild is true
  }

  return (
    <button
      type={type}  // Use the type prop here
      disabled={disabled}  // Handle disabled state
      className={clsx(
        'px-4 py-2 rounded',
        variant === 'primary' && 'bg-blue-600 text-white',
        variant === 'outline' && 'border border-blue-600 text-blue-600',
        className  // Allow for additional custom className if provided
      )}
    >
      {children}
    </button>
  );
};

export default Button;

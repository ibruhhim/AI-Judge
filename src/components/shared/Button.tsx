/**
 * Button Component
 * 
 * Reusable button component with variants
 */

import { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: ReactNode;
}

function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  icon,
}: ButtonProps) {
  const { theme } = useTheme();
  
  const getShadowStyle = () => {
    if (theme === 'dark' && (variant === 'primary' || variant === 'danger')) {
      return {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 107, 53, 0.4), 0 0 30px rgba(255, 107, 53, 0.2)',
      };
    }
    return {};
  };
  
  const variantClasses = {
    primary: `bg-button-bg hover:bg-button-bg-hover text-button-text ${
      theme === 'dark' ? '' : 'shadow-lg'
    }`,
    secondary: `glass hover:bg-glass-dark text-text-primary ${
      theme === 'dark' ? '' : 'shadow-md'
    }`,
    danger: `bg-danger hover:bg-danger-hover text-button-text ${
      theme === 'dark' ? '' : 'shadow-lg'
    }`,
    ghost: `glass-dark hover:bg-glass-dark text-text-primary ${
      theme === 'dark' ? '' : 'shadow-md'
    }`,
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const baseClasses = 'rounded-xl font-semibold transition-smooth hover-scale disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={getShadowStyle()}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default Button;

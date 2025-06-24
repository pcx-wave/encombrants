import React, { ButtonHTMLAttributes, useCallback } from 'react';

interface TouchOptimizedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hapticFeedback?: boolean;
}

const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  hapticFeedback = true,
  className,
  disabled,
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 touch-manipulation';
  
  const variantClasses = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm hover:shadow active:bg-emerald-800',
    secondary: 'bg-teal-100 text-teal-800 hover:bg-teal-200 focus:ring-teal-500 active:bg-teal-300',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-emerald-500 shadow-sm hover:shadow active:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow active:bg-red-800',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow active:bg-green-800'
  };
  
  // Mobile-optimized sizes with larger touch targets
  const sizeClasses = {
    sm: 'px-4 py-3 text-sm min-h-[44px]', // 44px minimum for iOS accessibility
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  
  const disabledClasses = (disabled || isLoading) 
    ? 'opacity-60 cursor-not-allowed active:scale-100' 
    : '';

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    
    // Haptic feedback for mobile devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onClick?.(e);
  }, [disabled, isLoading, hapticFeedback, onClick]);

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${disabledClasses}
        ${className || ''}
        ${isLoading ? 'relative !text-transparent' : ''}
      `}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
        </div>
      )}
      
      <span className={`flex items-center ${isLoading ? 'invisible' : ''}`}>
        {!isLoading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        
        {children}
        
        {!isLoading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </span>
    </button>
  );
};

export default TouchOptimizedButton;
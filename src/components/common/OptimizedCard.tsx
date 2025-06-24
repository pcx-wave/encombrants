import React, { memo, ReactNode } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface OptimizedCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  hover?: boolean;
  isLoading?: boolean;
  error?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  lazy?: boolean;
}

const OptimizedCard: React.FC<OptimizedCardProps> = memo(({
  children,
  title,
  subtitle,
  footer,
  hover = false,
  isLoading = false,
  error,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  lazy = false
}) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  // If lazy loading is enabled and not in view, render placeholder
  if (lazy && !isIntersecting) {
    return (
      <div
        ref={elementRef}
        className={`
          bg-white rounded-lg shadow-md overflow-hidden animate-pulse
          ${hover ? 'hover:shadow-lg transition-shadow duration-300' : ''}
          ${className}
        `}
        style={{ minHeight: '200px' }}
      >
        <div className="p-6 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        ref={elementRef}
        className={`
          bg-white rounded-lg shadow-md overflow-hidden animate-pulse
          ${hover ? 'hover:shadow-lg transition-shadow duration-300' : ''}
          ${className}
        `}
      >
        {title && (
          <div className={`px-6 py-4 ${headerClassName}`}>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            {subtitle && <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>}
          </div>
        )}
        <div className={`px-6 py-4 space-y-4 ${bodyClassName}`}>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        {footer && (
          <div className={`px-6 py-4 bg-gray-50 border-t border-gray-100 ${footerClassName}`}>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div
        ref={elementRef}
        className={`
          bg-white rounded-lg shadow-md overflow-hidden
          ${hover ? 'hover:shadow-lg transition-shadow duration-300' : ''}
          ${className}
        `}
      >
        <div className="p-6 text-center">
          <div className="text-red-600 mb-2">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-emerald-600 hover:text-emerald-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        ${hover ? 'hover:shadow-lg transition-shadow duration-300' : ''}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className={`px-6 py-4 ${headerClassName}`}>
          {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      
      <div className={`px-6 py-4 ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`px-6 py-4 bg-gray-50 border-t border-gray-100 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
});

OptimizedCard.displayName = 'OptimizedCard';

export default OptimizedCard;
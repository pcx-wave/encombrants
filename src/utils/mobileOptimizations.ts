// Mobile-specific optimizations and utilities

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

// Optimize images for mobile
export const getOptimizedImageUrl = (url: string, width?: number, quality?: number): string => {
  if (!url.includes('pexels.com')) return url;
  
  const baseUrl = url.split('?')[0];
  const params = new URLSearchParams();
  
  if (width) {
    params.set('w', width.toString());
  }
  
  if (quality) {
    params.set('q', quality.toString());
  }
  
  // Auto-format for WebP on supported browsers
  if ('WebP' in window || CSS.supports('image-rendering', 'pixelated')) {
    params.set('fm', 'webp');
  }
  
  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
};

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Preload critical resources
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Optimize API requests for mobile
export const createOptimizedFetch = (baseURL: string) => {
  return async (endpoint: string, options: RequestInit = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };
};

// Battery-aware optimizations
export const getBatteryInfo = async (): Promise<{
  level: number;
  charging: boolean;
} | null> => {
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: battery.level,
        charging: battery.charging
      };
    } catch {
      return null;
    }
  }
  return null;
};

// Network-aware optimizations
export const getNetworkInfo = (): {
  effectiveType: string;
  downlink: number;
  saveData: boolean;
} | null => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      saveData: connection.saveData || false
    };
  }
  
  return null;
};

// Reduce animations on low-end devices
export const shouldReduceMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Memory usage optimization
export const cleanupUnusedResources = () => {
  // Force garbage collection if available (Chrome DevTools)
  if ('gc' in window) {
    (window as any).gc();
  }
  
  // Clear unused image cache
  const images = document.querySelectorAll('img[data-cleanup="true"]');
  images.forEach(img => {
    if (img instanceof HTMLImageElement) {
      img.src = '';
    }
  });
};

// Touch gesture helpers
export const addTouchGesture = (
  element: HTMLElement,
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void
) => {
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;
  
  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };
  
  const handleTouchEnd = (e: TouchEvent) => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        onSwipe(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        onSwipe(deltaY > 0 ? 'down' : 'up');
      }
    }
  };
  
  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
  };
};
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

interface TemporaryDisplayProps {
  /** Content to display */
  children: React.ReactNode;
  /** Duration in milliseconds before the content disappears */
  duration?: number;
  /** Whether the content is initially visible */
  isVisible?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Function to call when the display is closed (either by timer or manually) */
  onClose?: () => void;
  /** Position of the display (defaults to bottom-right) */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
}

/**
 * A component that displays content for a specified duration and then hides it automatically
 */
export function TemporaryDisplay({
  children,
  duration = 5000, // Default 5 seconds
  isVisible = true,
  className,
  onClose,
  position = 'bottom-right'
}: TemporaryDisplayProps) {
  const [visible, setVisible] = useState(isVisible);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountTimeRef = useRef<number>(Date.now());
  
  // Force close after duration regardless of state changes
  const forceClose = () => {
    setVisible(false);
    if (onClose) onClose();
    
    // Clear any existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Set up timer to hide after duration
  useEffect(() => {
    // Start a timer when the component becomes visible
    if (visible && duration > 0) {
      // Clear any existing timer first
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Record the mount time
      mountTimeRef.current = Date.now();
      
      // Set the timer
      timerRef.current = setTimeout(() => {
        forceClose();
        console.log('Auto-closed after timer completion');
      }, duration);
      
      // Additional safety timer that's slightly longer
      setTimeout(() => {
        if (visible) {
          console.log('Safety timer triggered forced close');
          forceClose();
        }
      }, duration + 1000); // 1 second extra for safety
    }
    
    return () => {
      // Clean up timer on unmount
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, duration, onClose]);

  // Reset visibility when isVisible prop changes
  useEffect(() => {
    if (isVisible !== visible) {
      setVisible(isVisible);
      
      // If becoming visible, reset the mount time
      if (isVisible) {
        mountTimeRef.current = Date.now();
      }
    }
  }, [isVisible, visible]);

  // Handle manual close
  const handleClose = () => {
    forceClose();
    console.log('Manually closed');
  };

  // Define position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={cn(
            'fixed z-50 max-w-md',
            positionClasses[position],
            className
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative shadow-lg border-primary/10">
            <button 
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <CardContent className="p-4">
              {children}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Example usage:
 * 
 * <TemporaryDisplay duration={5000} position="top-right" onClose={() => console.log('Closed')}>
 *   <div className="flex items-center space-x-2">
 *     <Icon />
 *     <div>
 *       <h4 className="font-semibold">Title</h4>
 *       <p className="text-sm text-gray-500">This will disappear after 5 seconds</p>
 *     </div>
 *   </div>
 * </TemporaryDisplay>
 */

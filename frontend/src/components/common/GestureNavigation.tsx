import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface GestureNavigationProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
}

export const GestureNavigation: React.FC<GestureNavigationProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = ''
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [-5, 5]);
  const rotateY = useTransform(x, [-100, 100], [5, -5]);

  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    const velocity = 500;

    // Horizontal swipes
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > velocity) {
      if (info.offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (info.offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    // Vertical swipes
    if (Math.abs(info.offset.y) > threshold || Math.abs(info.velocity.y) > velocity) {
      if (info.offset.y > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (info.offset.y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    // Reset position
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`select-none ${className}`}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onPanEnd={handlePanEnd}
      style={{ x, y, rotateX, rotateY }}
      whileDrag={{ scale: 0.95 }}
    >
      {children}
      
      {/* Gesture Hints (optional visual feedback) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Swipe indicators can be added here if needed */}
      </div>
    </motion.div>
  );
};

// Quick swipe actions component for dashboard
interface QuickSwipeActionsProps {
  onNavigate?: (screen: string, params?: any) => void;
}

export const QuickSwipeActions: React.FC<QuickSwipeActionsProps> = ({ onNavigate }) => {
  return (
    <GestureNavigation
      onSwipeLeft={() => onNavigate?.('analytics')}
      onSwipeRight={() => onNavigate?.('investments')}
      onSwipeUp={() => onNavigate?.('new-investment')}
      onSwipeDown={() => onNavigate?.('crypto')}
      className="min-h-screen"
    >
      {/* Gesture hints overlay */}
      <div className="fixed top-4 right-4 text-xs text-gray-500 bg-gray-800/80 rounded-lg p-2 z-40">
        <div>← Analytics</div>
        <div>→ Investments</div>
        <div>↑ Quick Invest</div>
        <div>↓ Crypto Wallet</div>
      </div>
    </GestureNavigation>
  );
};
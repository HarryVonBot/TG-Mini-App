import React from 'react';
// REMOVED: framer-motion dependency (gesture navigation will be replaced with simple navigation)

interface GestureNavigationProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const GestureNavigation: React.FC<GestureNavigationProps> = ({
  onSwipeLeft,
  onSwipeRight,
  children,
  className = ''
}) => {
  // For now, we'll disable gesture navigation and just render the children
  // In the future, this could be replaced with CSS-only touch gestures or a different library
  
  return (
    <div 
      className={`gesture-navigation ${className}`}
      // TODO: Add touch event handlers if gesture navigation is needed
    >
      {children}
    </div>
  );
};
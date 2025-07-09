import React from 'react';
// REMOVED: framer-motion dependency
import type { Achievement } from '../../services/AchievementService';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'medium',
  showProgress = false,
  onClick,
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-12 h-12 text-xs',
    medium: 'w-16 h-16 text-sm',
    large: 'w-20 h-20 text-base'
  };

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
  };

  const isUnlocked = !!achievement.unlocked_at;

  return (
    <div 
      className={`achievement-badge ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`
        achievement-icon ${sizeClasses[size]} 
        rounded-full bg-gradient-to-br ${rarityColors[achievement.rarity]}
        flex items-center justify-center text-white font-bold
        transition-transform duration-200 hover:scale-105
        ${isUnlocked ? 'opacity-100' : 'opacity-40'}
      `}>
        {achievement.icon}
      </div>
      
      {showProgress && achievement.progress !== undefined && achievement.total && (
        <div className="progress-bar mt-1 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-blue-400 to-purple-600 h-1 rounded-full transition-all duration-300"
          />
        </div>
      )}
      
      {size !== 'small' && (
        <div className="achievement-text text-center mt-1">
          <div className="font-medium text-xs">{achievement.name}</div>
          {size === 'large' && (
            <div className="text-xs text-gray-400 mt-1">{achievement.description}</div>
          )}
        </div>
      )}
    </div>
  );
};

// RECREATED: AchievementToast component (was accidentally deleted during framer-motion cleanup)
interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onClose
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="achievement-toast fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm animate-slide-in-down">
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-500 rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <AchievementBadge achievement={achievement} size="medium" />
          <div className="flex-1">
            <div className="font-bold text-white mb-1">
              🎉 Achievement Unlocked!
            </div>
            <div className="text-purple-200 font-semibold">
              {achievement.name}
            </div>
            <div className="text-purple-300 text-sm">
              {achievement.description}
            </div>
            {achievement.reward && (
              <div className="text-yellow-400 text-xs mt-1">
                {achievement.reward}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
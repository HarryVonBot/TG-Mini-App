import React from 'react';
// REMOVED: framer-motion dependency

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked_at?: string;
  progress?: number;
  total?: number;
}

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
    legendary: 'from-yellow-400 to-orange-600'
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
            style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
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
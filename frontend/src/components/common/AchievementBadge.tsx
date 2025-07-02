import React from 'react';
import { motion } from 'framer-motion';
import type { Achievement } from '../../services/AchievementService';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showProgress = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  const rarityColors = {
    common: 'from-gray-600 to-gray-700 border-gray-500',
    rare: 'from-blue-600 to-blue-700 border-blue-500',
    epic: 'from-purple-600 to-purple-700 border-purple-500',
    legendary: 'from-yellow-600 to-yellow-700 border-yellow-500'
  };

  const isUnlocked = !!achievement.unlockedAt;

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          flex items-center justify-center 
          border-2 
          bg-gradient-to-br 
          ${isUnlocked ? rarityColors[achievement.rarity] : 'from-gray-800 to-gray-900 border-gray-700'}
          ${isUnlocked ? 'shadow-lg' : 'opacity-60'}
          transition-all duration-300
        `}
        whileHover={isUnlocked ? { scale: 1.1 } : {}}
        whileTap={isUnlocked ? { scale: 0.95 } : {}}
      >
        <span className={isUnlocked ? 'text-white' : 'text-gray-500'}>
          {achievement.icon}
        </span>
        
        {/* Rarity glow effect */}
        {isUnlocked && achievement.rarity !== 'common' && (
          <motion.div
            className={`absolute inset-0 rounded-full blur-md opacity-50 bg-gradient-to-br ${rarityColors[achievement.rarity]}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* Progress bar for locked achievements */}
      {!isUnlocked && showProgress && achievement.progress !== undefined && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-full">
          <div className="w-full bg-gray-700 rounded-full h-1">
            <motion.div
              className="bg-blue-500 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${achievement.progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Rarity indicator */}
      {size === 'lg' && (
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${
          isUnlocked ? rarityColors[achievement.rarity].split(' ')[0] : 'bg-gray-600'
        }`} />
      )}
    </div>
  );
};

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
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm"
    >
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-500 rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <AchievementBadge achievement={achievement} size="md" />
          <div className="flex-1">
            <div className="font-bold text-white mb-1">
              🎉 Achievement Unlocked!
            </div>
            <div className="text-purple-200 font-semibold">
              {achievement.title}
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
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
};

interface AchievementGridProps {
  achievements: Achievement[];
  showProgress?: boolean;
  className?: string;
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  showProgress = false,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-4 gap-4 ${className}`}>
      {achievements.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center"
        >
          <AchievementBadge
            achievement={achievement}
            showProgress={showProgress}
          />
          <div className="text-center mt-2">
            <div className="text-xs font-semibold text-white">
              {achievement.title}
            </div>
            <div className="text-xs text-gray-400">
              {achievement.description}
            </div>
            {showProgress && achievement.progress !== undefined && !achievement.unlockedAt && (
              <div className="text-xs text-blue-400 mt-1">
                {Math.round(achievement.progress)}% complete
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
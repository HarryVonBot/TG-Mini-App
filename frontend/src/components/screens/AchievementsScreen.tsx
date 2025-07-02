import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ScreenProps } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { MobileLayout } from '../layout/MobileLayout';
import { AchievementGrid, AchievementBadge } from '../common/AchievementBadge';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../context/AppContext';
import { achievementService, type Achievement } from '../../services/AchievementService';

export const AchievementsScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [nextAchievements, setNextAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { t } = useLanguage();
  const { user, membershipStatus } = useApp();

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = () => {
    // Mock investments data - in production this would come from API
    const mockInvestments = [
      { id: '1', user_id: user?.id || '', name: 'Investment 1', amount: 25000, rate: 6, term: 12, status: 'active' as const, created_at: '2024-01-01' }
    ];

    const unlocked = achievementService.checkAchievements(user || {}, mockInvestments, membershipStatus);
    const next = achievementService.getNextAchievements(user || {}, mockInvestments, membershipStatus, unlocked.map(a => a.id));
    const points = achievementService.getAchievementPoints(unlocked);

    setUnlockedAchievements(unlocked);
    setNextAchievements(next);
    setTotalPoints(points);
  };

  const categories = [
    { id: 'all', label: 'All', icon: '🏆' },
    { id: 'investment', label: 'Investment', icon: '💰' },
    { id: 'membership', label: 'Membership', icon: '👑' },
    { id: 'portfolio', label: 'Portfolio', icon: '📈' },
    { id: 'engagement', label: 'Engagement', icon: '🎯' },
    { id: 'milestone', label: 'Milestone', icon: '🚀' }
  ];

  const filteredUnlocked = selectedCategory === 'all' 
    ? unlockedAchievements 
    : unlockedAchievements.filter(a => a.category === selectedCategory);

  const filteredNext = selectedCategory === 'all'
    ? nextAchievements
    : nextAchievements.filter(a => a.category === selectedCategory);

  return (
    <MobileLayout centered maxWidth="xs">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button 
          onClick={onBack} 
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className="mb-6">
        <motion.div 
          className="text-6xl mb-4 text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          🏆
        </motion.div>
        <h1 className="text-2xl font-bold text-center mb-2">
          {t('achievements.title', 'Achievements')}
        </h1>
        <p className="text-center text-sm text-gray-400">
          {t('achievements.subtitle', 'Track your progress and unlock rewards')}
        </p>
      </div>

      <div className="w-full space-y-6">
        {/* Achievement Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {totalPoints.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm mb-3">
              {t('achievements.totalPoints', 'Achievement Points')}
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <div>
                <div className="text-white font-semibold">{unlockedAchievements.length}</div>
                <div className="text-gray-400 text-xs">Unlocked</div>
              </div>
              <div>
                <div className="text-white font-semibold">{nextAchievements.length}</div>
                <div className="text-gray-400 text-xs">In Progress</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Recent Achievements */}
        {filteredUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-800/50 border-gray-600">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>🎉</span>
                {t('achievements.unlocked', 'Unlocked Achievements')}
              </h3>
              
              <AchievementGrid achievements={filteredUnlocked.slice(0, 8)} />
              
              {filteredUnlocked.length > 8 && (
                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600"
                  >
                    View All ({filteredUnlocked.length})
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Next Achievements */}
        {filteredNext.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-800/50 border-gray-600">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>🎯</span>
                {t('achievements.inProgress', 'In Progress')}
              </h3>
              
              <AchievementGrid 
                achievements={filteredNext} 
                showProgress={true}
              />
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            onClick={() => onNavigate?.('new-investment')}
            className="h-12 bg-purple-600 hover:bg-purple-700"
          >
            💰 Invest More
          </Button>
          
          <Button
            onClick={() => onNavigate?.('analytics')}
            variant="outline"
            className="h-12 border-gray-600"
          >
            📊 View Analytics
          </Button>
        </motion.div>
      </div>
    </MobileLayout>
  );
};
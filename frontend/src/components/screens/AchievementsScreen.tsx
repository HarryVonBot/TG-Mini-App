import React, { useState, useEffect } from 'react';
// REMOVED: framer-motion dependency
import type { ScreenProps } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AchievementBadge } from '../common/AchievementBadge';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../hooks/useLanguage';
import { apiService } from '../../services/api';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked_at?: string;
  progress?: number;
  total?: number;
}

export const AchievementsScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { user } = useApp();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await apiService.getAchievements(user?.token);
      if (response.success) {
        setAchievements(response.achievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: t('achievements.categories.all'), icon: '🏆' },
    { id: 'investment', name: t('achievements.categories.investment'), icon: '💰' },
    { id: 'trading', name: t('achievements.categories.trading'), icon: '📈' },
    { id: 'savings', name: t('achievements.categories.savings'), icon: '🏦' },
    { id: 'social', name: t('achievements.categories.social'), icon: '👥' },
    { id: 'milestone', name: t('achievements.categories.milestone'), icon: '🎯' }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked_at).length;
  const totalCount = achievements.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">{t('achievements.title')}</h1>
          <div className="w-10"></div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="achievements-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">{t('achievements.title')}</h1>
        <div className="w-10"></div>
      </div>

      {/* Progress Overview */}
      <Card className="p-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-400 mb-2">
            {unlockedCount}/{totalCount}
          </div>
          <div className="text-sm text-gray-400 mb-4">
            {t('achievements.progress', { unlocked: unlockedCount, total: totalCount })}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            />
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <div className="category-filter">
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }
              `}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid">
        {filteredAchievements.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <div className="text-6xl mb-4">🏆</div>
              <p>{t('achievements.empty')}</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredAchievements.map((achievement) => (
              <div key={achievement.id} className="achievement-item">
                <AchievementBadge
                  achievement={achievement}
                  size="large"
                  showProgress={true}
                />
                
                {achievement.unlocked_at && (
                  <div className="text-xs text-gray-400 mt-2 text-center">
                    {t('achievements.unlockedOn', { 
                      date: new Date(achievement.unlocked_at).toLocaleDateString() 
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      {achievements.filter(a => a.unlocked_at).length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('achievements.recent.title')}</h2>
          <div className="space-y-3">
            {achievements
              .filter(a => a.unlocked_at)
              .sort((a, b) => new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime())
              .slice(0, 3)
              .map((achievement) => (
                <div key={achievement.id} className="recent-achievement flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <AchievementBadge achievement={achievement} size="small" />
                  <div className="flex-1">
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-sm text-gray-400">{achievement.description}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(achievement.unlocked_at!).toLocaleDateString()}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};
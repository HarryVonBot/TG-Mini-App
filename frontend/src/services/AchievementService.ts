// Achievement system for VonVault
import type { User, Investment, MembershipStatus } from '../types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'investment' | 'membership' | 'portfolio' | 'engagement' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  reward?: string;
  conditions: {
    type: string;
    value: number;
    operator: 'gte' | 'lte' | 'eq';
  }[];
}

export interface UserAchievements {
  userId: string;
  unlockedAchievements: Achievement[];
  totalPoints: number;
  lastUpdated: string;
}

class AchievementService {
  private achievements: Achievement[] = [
    // Investment Milestones
    {
      id: 'first_investment',
      title: 'First Steps',
      description: 'Made your first investment',
      icon: '🌱',
      category: 'investment',
      rarity: 'common',
      reward: 'Investment Journey Unlocked',
      conditions: [{ type: 'investment_count', value: 1, operator: 'gte' }]
    },
    {
      id: 'big_investor',
      title: 'Big Investor',
      description: 'Invested over $10,000',
      icon: '💎',
      category: 'investment',
      rarity: 'rare',
      reward: 'Advanced Investor Status',
      conditions: [{ type: 'total_invested', value: 10000, operator: 'gte' }]
    },
    {
      id: 'whale_investor',
      title: 'Crypto Whale',
      description: 'Invested over $100,000',
      icon: '🐋',
      category: 'investment',
      rarity: 'epic',
      reward: 'Elite Investor Recognition',
      conditions: [{ type: 'total_invested', value: 100000, operator: 'gte' }]
    },
    {
      id: 'legendary_investor',
      title: 'Investment Legend',
      description: 'Invested over $250,000',
      icon: '👑',
      category: 'investment',
      rarity: 'legendary',
      reward: 'Legendary Investor Hall of Fame',
      conditions: [{ type: 'total_invested', value: 250000, operator: 'gte' }]
    },

    // Membership Achievements
    {
      id: 'club_member',
      title: 'Club Member',
      description: 'Reached Club membership tier',
      icon: '🥉',
      category: 'membership',
      rarity: 'common',
      reward: 'Club Membership Benefits',
      conditions: [{ type: 'membership_level', value: 1, operator: 'gte' }]
    },
    {
      id: 'premium_member',
      title: 'Premium Member',
      description: 'Reached Premium membership tier',
      icon: '🥈',
      category: 'membership',
      rarity: 'rare',
      reward: 'Premium Membership Perks',
      conditions: [{ type: 'membership_level', value: 2, operator: 'gte' }]
    },
    {
      id: 'vip_member',
      title: 'VIP Member',
      description: 'Reached VIP membership tier',
      icon: '🥇',
      category: 'membership',
      rarity: 'epic',
      reward: 'VIP Access Privileges',
      conditions: [{ type: 'membership_level', value: 3, operator: 'gte' }]
    },
    {
      id: 'elite_member',
      title: 'Elite Member',
      description: 'Reached Elite membership tier',
      icon: '💎',
      category: 'membership',
      rarity: 'legendary',
      reward: '+1200 Achievement Points',
      conditions: [{ type: 'membership_level', value: 4, operator: 'gte' }]
    },

    // Portfolio Performance
    {
      id: 'profit_maker',
      title: 'Profit Maker',
      description: 'Earned your first $100 in profit',
      icon: '📈',
      category: 'portfolio',
      rarity: 'common',
      reward: '+75 Achievement Points',
      conditions: [{ type: 'total_profit', value: 100, operator: 'gte' }]
    },
    {
      id: 'profit_champion',
      title: 'Profit Champion',
      description: 'Earned over $1,000 in profit',
      icon: '🏆',
      category: 'portfolio',
      rarity: 'rare',
      reward: '+250 Achievement Points',
      conditions: [{ type: 'total_profit', value: 1000, operator: 'gte' }]
    },
    {
      id: 'profit_legend',
      title: 'Profit Legend',
      description: 'Earned over $10,000 in profit',
      icon: '⭐',
      category: 'portfolio',
      rarity: 'epic',
      reward: '+750 Achievement Points',
      conditions: [{ type: 'total_profit', value: 10000, operator: 'gte' }]
    },

    // Engagement Achievements
    {
      id: 'crypto_connected',
      title: 'Crypto Pioneer',
      description: 'Connected your first crypto wallet',
      icon: '🔗',
      category: 'engagement',
      rarity: 'common',
      reward: '+50 Achievement Points',
      conditions: [{ type: 'crypto_connected', value: 1, operator: 'eq' }]
    },
    {
      id: 'multi_wallet',
      title: 'Multi-Wallet Master',
      description: 'Connected 3 or more crypto wallets',
      icon: '💼',
      category: 'engagement',
      rarity: 'rare',
      reward: '+200 Achievement Points',
      conditions: [{ type: 'connected_wallets_count', value: 3, operator: 'gte' }]
    },
    {
      id: 'analytics_explorer',
      title: 'Analytics Explorer',
      description: 'Viewed investment analytics 10 times',
      icon: '📊',
      category: 'engagement',
      rarity: 'common',
      reward: '+100 Achievement Points',
      conditions: [{ type: 'analytics_views', value: 10, operator: 'gte' }]
    },

    // Special Milestones
    {
      id: 'early_adopter',
      title: 'Early Adopter',
      description: 'One of the first 1000 users',
      icon: '🚀',
      category: 'milestone',
      rarity: 'epic',
      reward: '+500 Achievement Points',
      conditions: [{ type: 'user_id_number', value: 1000, operator: 'lte' }]
    },
    {
      id: 'consistent_investor',
      title: 'Consistent Investor',
      description: 'Made investments for 6 consecutive months',
      icon: '🎯',
      category: 'milestone',
      rarity: 'epic',
      reward: '+400 Achievement Points',
      conditions: [{ type: 'consecutive_months', value: 6, operator: 'gte' }]
    }
  ];

  public getAllAchievements(): Achievement[] {
    return this.achievements;
  }

  public checkAchievements(
    user: User, 
    investments: Investment[], 
    membershipStatus: MembershipStatus | null
  ): Achievement[] {
    const unlockedAchievements: Achievement[] = [];
    
    // Calculate user stats
    const stats = this.calculateUserStats(user, investments, membershipStatus);
    
    for (const achievement of this.achievements) {
      if (this.isAchievementUnlocked(achievement, stats)) {
        unlockedAchievements.push({
          ...achievement,
          unlockedAt: new Date().toISOString()
        });
      }
    }
    
    return unlockedAchievements;
  }

  private calculateUserStats(
    user: User, 
    investments: Investment[], 
    membershipStatus: MembershipStatus | null
  ) {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalProfit = investments.reduce((sum, inv) => {
      // Calculate profit based on investment duration and rate
      const monthsActive = Math.max(1, Math.floor((Date.now() - new Date(inv.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30)));
      return sum + (inv.amount * (inv.rate / 100) * (monthsActive / 12));
    }, 0);

    const membershipLevelMap: Record<string, number> = {
      'club': 1,
      'premium': 2,
      'vip': 3,
      'elite': 4
    };

    return {
      investment_count: investments.length,
      total_invested: totalInvested,
      total_profit: totalProfit,
      membership_level: membershipLevelMap[membershipStatus?.level?.toLowerCase() || 'basic'] || 0,
      crypto_connected: user.crypto_connected ? 1 : 0,
      connected_wallets_count: user.connected_wallets_count || 0,
      analytics_views: 0, // This would be tracked separately
      user_id_number: parseInt(user.id?.replace(/\D/g, '') || '9999'),
      consecutive_months: 0 // This would be calculated from investment history
    };
  }

  private isAchievementUnlocked(achievement: Achievement, stats: Record<string, number>): boolean {
    return achievement.conditions.every(condition => {
      const value = stats[condition.type] || 0;
      
      switch (condition.operator) {
        case 'gte':
          return value >= condition.value;
        case 'lte':
          return value <= condition.value;
        case 'eq':
          return value === condition.value;
        default:
          return false;
      }
    });
  }

  public getAchievementPoints(achievements: Achievement[]): number {
    return achievements.reduce((total, achievement) => {
      const pointsMap = { common: 50, rare: 150, epic: 400, legendary: 1000 };
      return total + pointsMap[achievement.rarity];
    }, 0);
  }

  public getNextAchievements(
    user: User, 
    investments: Investment[], 
    membershipStatus: MembershipStatus | null,
    unlockedIds: string[]
  ): Achievement[] {
    const stats = this.calculateUserStats(user, investments, membershipStatus);
    
    return this.achievements
      .filter(achievement => !unlockedIds.includes(achievement.id))
      .map(achievement => {
        // Calculate progress for each condition
        const progress = achievement.conditions.map(condition => {
          const current = stats[condition.type] || 0;
          return Math.min(100, (current / condition.value) * 100);
        });
        
        return {
          ...achievement,
          progress: Math.min(...progress),
          maxProgress: 100
        };
      })
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .slice(0, 5); // Show top 5 closest achievements
  }
}

export const achievementService = new AchievementService();
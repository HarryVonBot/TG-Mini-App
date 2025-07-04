import React from 'react';
import { Card } from './Card';

interface InvestmentStatsCardProps {
  totalInvested: number;
  averageAPY: number;
  totalReturn: number;
  activeInvestments: number;
  membershipLevel: string;
  className?: string;
}

const tierColors = {
  club: "text-purple-300",
  premium: "text-purple-400", 
  vip: "text-purple-500",
  elite: "text-purple-600",
  none: "text-purple-400"
};

export const InvestmentStatsCard: React.FC<InvestmentStatsCardProps> = ({
  totalInvested,
  averageAPY,
  totalReturn,
  activeInvestments,
  membershipLevel,
  className = ""
}) => {
  const accentColor = tierColors[membershipLevel as keyof typeof tierColors] || tierColors.none;
  
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <Card variant="gradient" className={className}>
      <div className="grid grid-cols-2 gap-6">
        {/* Total Invested */}
        <div className="text-center group">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-1 transition-transform duration-300 group-hover:scale-110">
            {formatAmount(totalInvested)}
          </div>
          <div className="text-sm text-purple-200">Total Invested</div>
          <div className="w-full h-1 bg-purple-900/50 rounded-full mt-2 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-purple-400 to-purple-600 animate-shimmer"></div>
          </div>
        </div>
        
        {/* Average APY */}
        <div className="text-center group">
          <div className={`text-3xl font-bold ${accentColor} mb-1 transition-transform duration-300 group-hover:scale-110`}>
            {averageAPY.toFixed(1)}%
          </div>
          <div className="text-sm text-purple-200">Average APY</div>
          <div className="w-full h-1 bg-purple-900/50 rounded-full mt-2 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-purple-600 animate-shimmer"></div>
          </div>
        </div>
        
        {/* Projected Returns */}
        <div className="text-center group">
          <div className="text-2xl font-bold text-purple-400 mb-1 transition-transform duration-300 group-hover:scale-110">
            {formatAmount(totalReturn)}
          </div>
          <div className="text-sm text-purple-200">Projected Returns</div>
        </div>
        
        {/* Active Investments */}
        <div className="text-center group">
          <div className="text-2xl font-bold text-purple-400 mb-1 transition-transform duration-300 group-hover:scale-110">
            {activeInvestments}
          </div>
          <div className="text-sm text-purple-200">Active Plans</div>
        </div>
      </div>
      
      {/* Performance indicator */}
      <div className="mt-4 pt-4 border-t border-purple-500/30">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
          <span className="text-sm text-purple-400 font-medium">Performing Well</span>
        </div>
      </div>
    </Card>
  );
};
import React, { useState, useEffect } from 'react';
import type { ScreenProps, InvestmentPlan, MembershipStatus } from '../../types';
import { ScreenHeader } from '../layout/ScreenHeader';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { FullScreenLoader } from '../common/LoadingSpinner';
import { MembershipBadge } from '../common/MembershipBadge';
import { EnhancedProgressBar } from '../common/EnhancedProgressBar';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const MakeNewInvestmentScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const { user, fetchMembershipStatus } = useApp();

  useEffect(() => {
    fetchInvestmentData();
  }, []);

  const fetchInvestmentData = async () => {
    if (!user?.token) return;

    try {
      setLoading(true);
      const response = await apiService.getInvestmentPlans(user.token);
      setPlans(response.plans);
      setMembershipStatus(response.membership);
      
      if (response.plans.length > 0) {
        setSelectedPlan(response.plans[0]);
      }
    } catch (error) {
      console.error('Error fetching investment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatLockPeriod = (days: number) => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  const calculateProjectedReturn = () => {
    if (!amount || !selectedPlan) return 0;
    const principal = parseFloat(amount);
    const annualRate = selectedPlan.rate / 100;
    const timeInYears = selectedPlan.term_days / 365;
    return (principal * (1 + annualRate * timeInYears)).toFixed(2);
  };

  const getTierColorClass = (level: string) => {
    switch (level) {
      case 'club': return 'border-amber-500/50 bg-amber-500/5';
      case 'premium': return 'border-gray-400/50 bg-gray-400/5';
      case 'vip': return 'border-yellow-500/50 bg-yellow-500/5';
      case 'elite': return 'border-purple-500/50 bg-purple-500/5';
      default: return 'border-gray-700 bg-gray-800/50';
    }
  };

  const getTierAccentColor = (level: string) => {
    switch (level) {
      case 'club': return 'text-amber-400';
      case 'premium': return 'text-gray-300';
      case 'vip': return 'text-yellow-400';
      case 'elite': return 'text-purple-300';
      default: return 'text-gray-400';
    }
  };

  const handleInvest = async () => {
    if (!selectedPlan || !amount || parseFloat(amount) < selectedPlan.min_amount) {
      alert(`Minimum investment is ${formatAmount(selectedPlan?.min_amount || 0)}`);
      return;
    }

    if (parseFloat(amount) > selectedPlan.max_amount) {
      alert(`Maximum investment per transaction is ${formatAmount(selectedPlan.max_amount)}`);
      return;
    }

    setInvesting(true);
    try {
      if (user?.token) {
        const investment = {
          name: selectedPlan.name,
          amount: parseFloat(amount),
          rate: selectedPlan.rate,
          term: Math.round(selectedPlan.term_days / 30) // Convert to months for backward compatibility
        };
        
        await apiService.createInvestment(investment, user.token);
        
        // Refresh membership status after investment
        await fetchMembershipStatus();
        
        alert('Investment created successfully! 🎉');
        onBack?.();
      }
    } catch (error: any) {
      console.error('Investment creation error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to create investment. Please try again.';
      alert(errorMessage);
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return <FullScreenLoader text="Loading investment options..." />;
  }

  if (!membershipStatus) {
    return (
      <div className="min-h-screen bg-black text-white px-6 pt-12 pb-8">
        <ScreenHeader title="New Investment" onBack={onBack} />
        <div className="text-center text-gray-400 mt-8">
          Unable to load membership status. Please try again.
        </div>
      </div>
    );
  }

  if (membershipStatus.level === "none") {
    return (
      <div className="min-h-screen bg-black text-white px-6 pt-12 pb-8">
        <ScreenHeader title="New Investment" onBack={onBack} />
        
        <Card className="text-center animate-fade-in-up bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-6xl mb-6 animate-bounce">🚀</div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Start Your Investment Journey
          </h2>
          <p className="text-gray-400 mb-6">
            To become a Club Member and start investing, you need a minimum investment of {formatAmount(20000)}.
          </p>
          <p className="text-sm text-gray-500">
            Current total invested: {formatAmount(membershipStatus.total_invested)}
          </p>
          
          <div className="mt-6">
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const projectedReturn = calculateProjectedReturn();

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-12 pb-8 custom-scrollbar">
      <ScreenHeader title="New Investment" onBack={onBack} />

      {/* Enhanced Membership Status Header */}
      <Card className={`mb-6 ${getTierColorClass(membershipStatus.level)} border-2 card-hover-effect animate-fade-in-up`}>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-4">
            <div className="animate-float">
              <MembershipBadge 
                level={membershipStatus.level} 
                size="lg" 
                showRing={true}
                className="tier-badge-shadow"
              />
            </div>
            <div>
              <div className="font-bold text-xl">{membershipStatus.level_name}</div>
              <div className="text-gray-400 text-sm">
                {formatAmount(membershipStatus.total_invested)} invested
              </div>
            </div>
          </div>
          
          {membershipStatus.next_level && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Next Level</div>
              <div className="font-medium">{membershipStatus.next_level_name}</div>
              <div className="text-sm text-gray-500">
                {formatAmount(membershipStatus.amount_to_next || 0)} more
              </div>
            </div>
          )}
        </div>
        
        {/* Progress to next level */}
        {membershipStatus.next_level && (
          <div className="mt-4">
            <EnhancedProgressBar
              progress={((membershipStatus.total_invested) / (membershipStatus.total_invested + (membershipStatus.amount_to_next || 0))) * 100}
              level={membershipStatus.next_level}
              label="Membership Progress"
              animated={true}
            />
          </div>
        )}
      </Card>

      {/* Enhanced Plan Selection */}
      {plans.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Choose Your Investment Plan
          </h2>
          <div className="space-y-4">
            {plans.map((plan, index) => (
              <Card
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                hover
                className={`border-2 transition-all duration-300 cursor-pointer card-hover-effect animate-fade-in-up ${
                  selectedPlan?.id === plan.id 
                    ? `${getTierColorClass(membershipStatus.level)} ring-2 ring-purple-500/30 scale-105` 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start p-2">
                  <div className="flex items-center gap-3 flex-1">
                    <MembershipBadge level={membershipStatus.level} size="md" />
                    <div className="flex-1">
                      <div className="font-bold text-lg">{plan.name}</div>
                      <div className="text-sm text-gray-400 mt-1">{plan.description}</div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="text-sm">
                          <span className="text-gray-500">Lock Period:</span>
                          <span className="text-white ml-1 font-medium">{formatLockPeriod(plan.term_days)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Range:</span>
                          <span className="text-white ml-1 font-medium">
                            {formatAmount(plan.min_amount)} - {formatAmount(plan.max_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center ml-4">
                    <div className={`text-4xl font-bold ${getTierAccentColor(membershipStatus.level)}`}>
                      {plan.rate}%
                    </div>
                    <div className="text-sm text-gray-400">APY</div>
                  </div>
                </div>
                
                {selectedPlan?.id === plan.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm text-green-400 font-medium">Selected Plan</span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Amount Input */}
      {selectedPlan && (
        <Card className="mb-6 animate-slide-in-left">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">💰</span>
            Investment Amount
          </h3>
          
          <Input
            label="Enter Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            prefix="$"
            className="text-xl"
          />
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-gray-400">Minimum</div>
              <div className="font-bold text-green-400">{formatAmount(selectedPlan.min_amount)}</div>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-gray-400">Maximum</div>
              <div className="font-bold text-red-400">{formatAmount(selectedPlan.max_amount)}</div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Lock Period:</span>
              <span className="text-white font-medium">{formatLockPeriod(selectedPlan.term_days)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Annual Rate:</span>
              <span className={`font-bold ${getTierAccentColor(membershipStatus.level)}`}>{selectedPlan.rate}%</span>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Investment Summary */}
      {amount && selectedPlan && (
        <Card className="mb-6 bg-gradient-to-br from-green-900/30 to-blue-900/30 border-green-500/30 animate-slide-in-right">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">📈</span>
            Investment Summary
          </h3>
          
          <div className="space-y-4">
            {/* Investment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {formatAmount(parseFloat(amount))}
                </div>
                <div className="text-sm text-gray-400">Investment</div>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {formatAmount(parseFloat(String(projectedReturn)))}
                </div>
                <div className="text-sm text-gray-400">Projected Return</div>
              </div>
            </div>
            
            {/* Plan Summary */}
            <div className="p-4 bg-gray-800/30 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan:</span>
                <span className="text-white font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lock Period:</span>
                <span className="text-white font-medium">{formatLockPeriod(selectedPlan.term_days)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">APY Rate:</span>
                <span className={`font-bold ${getTierAccentColor(membershipStatus.level)}`}>{selectedPlan.rate}%</span>
              </div>
              
              <hr className="border-gray-700 my-3" />
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Profit:</span>
                <span className="text-xl font-bold text-green-400">
                  +{formatAmount(parseFloat(projectedReturn) - parseFloat(amount))}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 italic text-center">
              * Returns are projected based on the annual percentage yield and may vary
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Action Buttons */}
      <div className="flex space-x-4">
        <Button 
          onClick={handleInvest}
          disabled={!amount || !selectedPlan || parseFloat(amount) < (selectedPlan?.min_amount || 0)}
          loading={investing}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg py-4"
        >
          {investing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">🚀</span>
              Invest Now
            </span>
          )}
        </Button>
        
        <Button 
          onClick={onBack}
          variant="secondary"
          className="flex-1 py-4"
        >
          Cancel
        </Button>
      </div>
      
      {/* Investment Tips */}
      <Card className="mt-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <span className="text-lg">💡</span>
          Investment Tips
        </h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Higher membership tiers unlock better APY rates</li>
          <li>• Longer lock periods typically offer higher returns</li>
          <li>• Your membership level is based on total invested amount</li>
          <li>• Elite members can make unlimited $250K investments</li>
        </ul>
      </Card>
    </div>
  );
};
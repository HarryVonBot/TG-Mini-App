import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ScreenProps } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { MobileLayout } from '../layout/MobileLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../context/AppContext';
import { autoInvestmentService, type AutoInvestRule } from '../../services/AutoInvestmentService';

export const AutoInvestmentScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const [activeRules, setActiveRules] = useState<AutoInvestRule[]>([]);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [ruleType, setRuleType] = useState<'recurring' | 'threshold'>('recurring');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    triggerAmount: '',
    investmentPercentage: '50',
    targetMembership: 'auto'
  });

  const { t } = useLanguage();
  const { user, membershipStatus } = useApp();

  useEffect(() => {
    loadAutoInvestData();
  }, []);

  const loadAutoInvestData = () => {
    if (user?.id) {
      const rules = autoInvestmentService.getRules(user.id);
      setActiveRules(rules);
      
      const stats = autoInvestmentService.getStatistics(user.id);
      setStatistics(stats);
      
      // Use real crypto ETH balance (not USD value)
      const cryptoEthBalance = user.total_crypto_eth || 0;
      const smartSuggestions = autoInvestmentService.getSuggestions(user, cryptoEthBalance, membershipStatus);
      setSuggestions(smartSuggestions);
    }
  };

  const handleCreateRule = () => {
    if (!user?.id) return;

    const newRule = autoInvestmentService.createRule({
      userId: user.id,
      type: ruleType,
      name: formData.name,
      isActive: true,
      ...(ruleType === 'recurring' ? {
        amount: parseFloat(formData.amount),
        frequency: formData.frequency as 'daily' | 'weekly' | 'monthly'
      } : {
        triggerAmount: parseFloat(formData.triggerAmount),
        investmentPercentage: parseFloat(formData.investmentPercentage)
      }),
      targetMembership: formData.targetMembership
    });

    setActiveRules(prev => [...prev, newRule]);
    setShowCreateRule(false);
    setFormData({
      name: '',
      amount: '',
      frequency: 'monthly',
      triggerAmount: '',
      investmentPercentage: '50',
      targetMembership: 'auto'
    });

    // Refresh data
    loadAutoInvestData();
  };

  const toggleRule = (ruleId: string) => {
    const rule = activeRules.find(r => r.id === ruleId);
    if (rule) {
      autoInvestmentService.updateRule(ruleId, { isActive: !rule.isActive });
      loadAutoInvestData();
    }
  };

  const deleteRule = (ruleId: string) => {
    autoInvestmentService.deleteRule(ruleId);
    loadAutoInvestData();
  };

  const applySuggestion = (suggestion: any) => {
    setRuleType(suggestion.type);
    setFormData({
      name: suggestion.name,
      amount: suggestion.settings.amount?.toString() || '',
      frequency: suggestion.settings.frequency || 'monthly',
      triggerAmount: suggestion.settings.triggerAmount?.toString() || '',
      investmentPercentage: suggestion.settings.investmentPercentage?.toString() || '50',
      targetMembership: 'auto'
    });
    setShowCreateRule(true);
  };

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
          ⚡
        </motion.div>
        <h1 className="text-2xl font-bold text-center mb-2">
          {t('autoInvest.title', 'Auto-Investment')}
        </h1>
        <p className="text-center text-sm text-gray-400">
          {t('autoInvest.subtitle', 'Automate your investment strategy')}
        </p>
      </div>

      <div className="w-full space-y-6">
        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-xl font-bold text-blue-400">
                  {activeRules.filter(r => r.isActive).length}
                </div>
                <div className="text-gray-400">Active Rules</div>
              </div>
              
              <div>
                <div className="text-xl font-bold text-green-400">
                  ${activeRules.reduce((sum, rule) => sum + (rule.totalInvested || 0), 0).toLocaleString()}
                </div>
                <div className="text-gray-400">Auto-Invested</div>
              </div>
              
              <div>
                <div className="text-xl font-bold text-purple-400">
                  {activeRules.filter(r => r.type === 'recurring').length + activeRules.filter(r => r.type === 'threshold').length}
                </div>
                <div className="text-gray-400">Total Rules</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Smart Suggestions */}
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-gradient-to-r from-cyan-900/20 to-teal-900/20 border-cyan-500/30">
              <h3 className="font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                <span>💡</span>
                {t('autoInvest.smartSuggestions', 'Smart Suggestions')}
              </h3>
              
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/20"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-white mb-1">
                          {suggestion.type === 'recurring' ? '🔄' : '🎯'} {suggestion.name}
                        </div>
                        <div className="text-sm text-gray-300 mb-2">
                          {suggestion.description}
                        </div>
                        <div className="text-xs text-cyan-400">
                          ✨ {suggestion.benefit}
                        </div>
                      </div>
                      <Button
                        onClick={() => applySuggestion(suggestion)}
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-700 ml-3"
                      >
                        Apply
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Create New Rule Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => setShowCreateRule(true)}
            fullWidth
            className="h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <span className="text-xl mr-2">➕</span>
            {t('autoInvest.createRule', 'Create Auto-Investment Rule')}
          </Button>
        </motion.div>

        {/* Active Rules */}
        {activeRules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-800/50 border-gray-600">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>🔄</span>
                {t('autoInvest.activeRules', 'Investment Rules')}
              </h3>
              
              <div className="space-y-3">
                {activeRules.map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      rule.isActive 
                        ? 'border-green-500/50 bg-green-900/20' 
                        : 'border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">
                            {rule.type === 'recurring' ? '🔄' : '🎯'}
                          </span>
                          <span className="font-semibold text-white">
                            {rule.name}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            rule.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {rule.isActive ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-400">
                          {rule.type === 'recurring' ? (
                            <span>
                              ${rule.amount?.toLocaleString()} every {rule.frequency}
                            </span>
                          ) : (
                            <span>
                              Invest {rule.investmentPercentage}% when balance exceeds ${rule.triggerAmount?.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {rule.totalInvested && rule.totalInvested > 0 && (
                          <div className="text-xs text-green-400 mt-1">
                            Total invested: ${rule.totalInvested.toLocaleString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            rule.isActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          <span className="text-white text-sm">
                            {rule.isActive ? '⏸️' : '▶️'}
                          </span>
                        </button>
                        
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
                        >
                          <span className="text-white text-sm">🗑️</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Create Rule Modal */}
        {showCreateRule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-lg p-6 max-w-sm w-full"
            >
              <h2 className="text-xl font-bold mb-4 text-center">
                Create Auto-Investment Rule
              </h2>

              {/* Rule Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rule Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRuleType('recurring')}
                    className={`p-3 rounded-lg border-2 text-sm ${
                      ruleType === 'recurring'
                        ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                        : 'border-gray-600 bg-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">🔄</div>
                    Recurring
                  </button>
                  <button
                    onClick={() => setRuleType('threshold')}
                    className={`p-3 rounded-lg border-2 text-sm ${
                      ruleType === 'threshold'
                        ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                        : 'border-gray-600 bg-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">🎯</div>
                    Threshold
                  </button>
                </div>
              </div>

              {/* Rule Name */}
              <div className="mb-4">
                <Input
                  label="Rule Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="My Auto-Investment Rule"
                />
              </div>

              {/* Recurring Settings */}
              {ruleType === 'recurring' && (
                <>
                  <div className="mb-4">
                    <Input
                      label="Investment Amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="1000"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </>
              )}

              {/* Threshold Settings */}
              {ruleType === 'threshold' && (
                <>
                  <div className="mb-4">
                    <Input
                      label="Trigger Amount"
                      type="number"
                      value={formData.triggerAmount}
                      onChange={(e) => setFormData({...formData, triggerAmount: e.target.value})}
                      placeholder="5000"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <Input
                      label="Investment Percentage"
                      type="number"
                      value={formData.investmentPercentage}
                      onChange={(e) => setFormData({...formData, investmentPercentage: e.target.value})}
                      placeholder="50"
                    />
                  </div>
                </>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleCreateRule}
                  fullWidth
                  disabled={!formData.name || (ruleType === 'recurring' ? !formData.amount : !formData.triggerAmount)}
                >
                  Create Rule
                </Button>
                
                <Button
                  onClick={() => setShowCreateRule(false)}
                  variant="outline"
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            onClick={() => onNavigate?.('crypto')}
            variant="outline"
            className="h-12 border-gray-600"
          >
            💼 Crypto Wallets
          </Button>
          
          <Button
            onClick={() => onNavigate?.('investments')}
            variant="outline"
            className="h-12 border-gray-600"
          >
            📊 View Investments
          </Button>
        </motion.div>
      </div>
    </MobileLayout>
  );
};
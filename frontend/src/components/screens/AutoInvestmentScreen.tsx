import React, { useState, useEffect } from 'react';
// REMOVED: framer-motion dependency
import type { ScreenProps } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../hooks/useLanguage';
import { apiService } from '../../services/api';

interface AutoInvestmentRule {
  id: string;
  name: string;
  amount: number;
  trigger_type: 'balance' | 'time' | 'price';
  trigger_value: number;
  investment_plan_id: string;
  is_active: boolean;
}

export const AutoInvestmentScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { user } = useApp();
  const [rules, setRules] = useState<AutoInvestmentRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    amount: 0,
    trigger_type: 'balance' as const,
    trigger_value: 0,
    investment_plan_id: ''
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await apiService.getAutoInvestmentRules(user?.token);
      if (response.success) {
        setRules(response.rules);
      }
    } catch (error) {
      console.error('Error fetching auto-investment rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      const response = await apiService.createAutoInvestmentRule(user?.token, newRule);
      if (response.success) {
        setRules([...rules, response.rule]);
        setShowCreateForm(false);
        setNewRule({
          name: '',
          amount: 0,
          trigger_type: 'balance',
          trigger_value: 0,
          investment_plan_id: ''
        });
      }
    } catch (error) {
      console.error('Error creating auto-investment rule:', error);
    }
  };

  const toggleRule = async (ruleId: string) => {
    try {
      const response = await apiService.toggleAutoInvestmentRule(user?.token, ruleId);
      if (response.success) {
        setRules(rules.map(rule => 
          rule.id === ruleId ? { ...rule, is_active: !rule.is_active } : rule
        ));
      }
    } catch (error) {
      console.error('Error toggling auto-investment rule:', error);
    }
  };

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
          <h1 className="text-2xl font-bold">{t('autoInvestment.title')}</h1>
          <div className="w-10"></div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="auto-investment-screen space-y-6">
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
        <h1 className="text-2xl font-bold">{t('autoInvestment.title')}</h1>
        <div className="w-10"></div>
      </div>

      {/* Overview */}
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t('autoInvestment.overview.title')}</h2>
          <p className="text-gray-400 mb-4">{t('autoInvestment.overview.description')}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-400">{rules.filter(r => r.is_active).length}</div>
              <div className="text-sm text-gray-400">Active Rules</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">${rules.reduce((sum, r) => sum + r.amount, 0)}</div>
              <div className="text-sm text-gray-400">Total Monthly</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Rules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('autoInvestment.rules.title')}</h2>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {t('autoInvestment.rules.create')}
          </Button>
        </div>

        {rules.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{t('autoInvestment.rules.empty')}</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
            >
              {t('autoInvestment.rules.createFirst')}
            </Button>
          </Card>
        ) : (
          <div className="rules-list space-y-3">
            {rules.map((rule) => (
              <Card key={rule.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${rule.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div>
                        <h3 className="font-semibold">{rule.name}</h3>
                        <p className="text-sm text-gray-400">
                          ${rule.amount} • {rule.frequency} • {rule.trigger_type}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => toggleRule(rule.id)}
                      variant="outline"
                      className="text-sm"
                    >
                      {rule.is_active ? t('autoInvestment.rules.pause') : t('autoInvestment.rules.resume')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Rule Form */}
      {showCreateForm && (
        <div className="create-rule-form fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('autoInvestment.create.title')}</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <Input
                label={t('autoInvestment.create.name')}
                value={newRule.name}
                onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                placeholder="Enter rule name"
              />
              
              <Input
                label={t('autoInvestment.create.amount')}
                type="number"
                value={newRule.amount.toString()}
                onChange={(e) => setNewRule({...newRule, amount: Number(e.target.value)})}
                placeholder="0"
              />
              
              <div className="form-actions flex space-x-2">
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  {t('autoInvestment.create.cancel')}
                </Button>
                <Button
                  onClick={handleCreateRule}
                  className="flex-1"
                  disabled={!newRule.name || !newRule.amount}
                >
                  {t('autoInvestment.create.create')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
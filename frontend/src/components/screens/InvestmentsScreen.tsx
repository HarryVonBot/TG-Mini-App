import React, { useState, useEffect } from 'react';
import type { ScreenProps, Investment } from '../../types';
import { ScreenHeader } from '../layout/ScreenHeader';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { FullScreenLoader } from '../common/LoadingSpinner';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const InvestmentsScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useApp();

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      if (user?.token) {
        const data = await apiService.getInvestments(user.token);
        setInvestments(data.investments || []);
      } else {
        // Fallback to sample data
        setInvestments([
          { id: '1', user_id: '', name: "Growth Plan", amount: 1500, rate: 6.5, term: 12, status: 'active' },
          { id: '2', user_id: '', name: "Crypto Stable", amount: 3000, rate: 8.2, term: 6, status: 'active' },
          { id: '3', user_id: '', name: "Real Estate", amount: 5000, rate: 5.5, term: 24, status: 'active' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
      // Fallback to sample data
      setInvestments([
        { id: '1', user_id: '', name: "Growth Plan", amount: 1500, rate: 6.5, term: 12, status: 'active' },
        { id: '2', user_id: '', name: "Crypto Stable", amount: 3000, rate: 8.2, term: 6, status: 'active' },
        { id: '3', user_id: '', name: "Real Estate", amount: 5000, rate: 5.5, term: 24, status: 'active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FullScreenLoader text="Loading investments..." />;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-12 pb-8">
      <ScreenHeader title="Investments" onBack={onBack} />

      <div className="space-y-4">
        {investments.map((inv) => (
          <Card key={inv.id} hover>
            <div className="flex justify-between items-start mb-2">
              <div className="text-lg font-semibold">{inv.name}</div>
              <div className="text-green-400 text-sm font-medium">{inv.rate}% APY</div>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <div>Amount: ${inv.amount?.toLocaleString()}</div>
              <div>Term: {inv.term} months</div>
              <div>
                Status: <span className="text-green-400 capitalize">{inv.status}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={() => onNavigate?.('new-investment')}
        fullWidth
        size="lg"
        className="mt-8"
      >
        + Make New Investment
      </Button>
    </div>
  );
};
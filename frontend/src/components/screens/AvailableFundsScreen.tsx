import React, { useState, useEffect } from 'react';
import type { ScreenProps, BankAccount } from '../../types';
import { ScreenHeader } from '../layout/ScreenHeader';
import { Card } from '../common/Card';
import { FullScreenLoader } from '../common/LoadingSpinner';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const AvailableFundsScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const [balances, setBalances] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useApp();

  useEffect(() => {
    fetchAvailableFunds();
  }, []);

  const fetchAvailableFunds = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBankAccounts(user?.token);
      
      if (data.accounts) {
        setBalances(data.accounts);
      } else {
        // Fallback to sample data
        setBalances([
          { accountName: "Checking Account", currency: "USD", balance: 2540.5 },
          { accountName: "Savings Account", currency: "USD", balance: 12200.0 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching available funds:', error);
      setBalances([
        { accountName: "Checking Account", currency: "USD", balance: 2540.5 },
        { accountName: "Savings Account", currency: "USD", balance: 12200.0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FullScreenLoader text="Loading available funds..." />;
  }

  const totalBalance = balances.reduce((total, fund) => total + (fund.balance || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-12 pb-8">
      <ScreenHeader title="Available Funds" onBack={onBack} />

      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Total Available</h2>
        <p className="text-3xl font-bold">${totalBalance.toLocaleString()}</p>
      </div>

      <div className="space-y-4">
        {balances.map((fund, index) => (
          <Card key={index}>
            <div className="text-lg font-semibold mb-1">
              {fund.accountName || fund.name || `Account ${index + 1}`}
            </div>
            <div className="text-sm text-gray-400">
              {fund.currency || 'USD'} ${(fund.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
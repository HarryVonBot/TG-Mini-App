import React from 'react';
// REMOVED: framer-motion dependency
import { Card } from './Card';
import { Button } from './Button';
import type { ConnectedWallet } from '../../types';

interface MultiWalletPortfolioProps {
  wallets: ConnectedWallet[];
  onManageWallets?: () => void;
  onAddWallet?: () => void;
  className?: string;
}

export const MultiWalletPortfolio: React.FC<MultiWalletPortfolioProps> = ({
  wallets,
  onManageWallets,
  onAddWallet,
  className = ''
}) => {
  // Calculate total portfolio value across all wallets
  const totalValue = wallets.reduce((sum, wallet) => sum + (wallet.total_usd || 0), 0);
  
  // Find primary wallet
  const primaryWallet = wallets.find(w => w.is_primary) || wallets[0];

  return (
    <Card className={`multi-wallet-portfolio ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Multi-Wallet Portfolio</h3>
          <span className="text-sm text-gray-400">{wallets.length} wallet{wallets.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Total Value */}
        <div className="portfolio-total text-center py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-400">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-400">Total Portfolio Value</div>
        </div>

        {/* Wallet List */}
        <div className="wallet-list space-y-3">
          {wallets.map((wallet) => (
            <div 
              key={wallet.id}
              className={`wallet-item p-3 rounded-lg border transition-colors duration-200 ${
                wallet.is_primary 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${wallet.is_primary ? 'bg-purple-500' : 'bg-gray-400'}`} />
                  <div>
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-sm text-gray-400">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${(wallet.total_usd || 0).toFixed(2)}</div>
                  <div className="text-sm text-gray-400">{wallet.network}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="wallet-actions flex space-x-2">
          {onManageWallets && (
            <Button
              onClick={onManageWallets}
              variant="outline"
              className="flex-1"
            >
              Manage Wallets
            </Button>
          )}
          {onAddWallet && wallets.length < 5 && (
            <Button
              onClick={onAddWallet}
              variant="primary"
              className="flex-1"
            >
              Add Wallet
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
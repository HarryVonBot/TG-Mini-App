import React, { useState, useEffect } from 'react';
import type { ScreenProps } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { MobileLayoutWithTabs } from '../layout/MobileLayoutWithTabs';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

interface VonVaultWallet {
  network: string;
  token: string;
  address: string;
  qr_code_data: string;
  network_info: {
    name: string;
    currency: string;
    avg_fee_usd: number;
  };
}

export const CryptoDepositScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('polygon');
  const [selectedToken, setSelectedToken] = useState<string>('usdc');
  const [vonvaultWallets, setVonvaultWallets] = useState<{[key: string]: VonVaultWallet}>({});
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [purpose, setPurpose] = useState<'investment' | 'general'>('general');
  const { t } = useLanguage();
  const { user } = useApp();

  useEffect(() => {
    loadVonVaultWallets();
  }, []);

  const loadVonVaultWallets = async () => {
    try {
      setLoading(true);
      
      // Load VonVault deposit addresses
      const addressesResponse = await apiService.getCryptoDepositAddresses(user?.token || '');
      const walletData: {[key: string]: VonVaultWallet} = {};
      
      // Process deposit addresses for each token and network
      for (const token of ['usdc', 'usdt']) {
        for (const network of ['ethereum', 'polygon', 'bsc']) {
          const key = `${token}_${network}`;
          if (addressesResponse?.addresses?.[token]?.[network]) {
            walletData[key] = addressesResponse.addresses[token][network];
          }
        }
      }
      
      setVonvaultWallets(walletData);
      
    } catch (error) {
      console.error('Error loading VonVault wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNetworkDisplayName = (network: string): string => {
    const names: {[key: string]: string} = {
      'ethereum': 'Ethereum',
      'polygon': 'Polygon',
      'bsc': 'BSC (BNB Chain)'
    };
    return names[network] || network;
  };

  const getCurrentVonVaultWallet = (): VonVaultWallet | null => {
    const key = `${selectedToken}_${selectedNetwork}`;
    return vonvaultWallets[key] || null;
  };

  const calculateConversionFee = (): number => {
    const amount = parseFloat(depositAmount) || 0;
    return amount * 0.0275; // 2.75% conversion fee
  };

  const calculateNetAmount = (): number => {
    const amount = parseFloat(depositAmount) || 0;
    return amount - calculateConversionFee();
  };

  const handleDepositComplete = () => {
    if (purpose === 'investment') {
      onNavigate?.('new-investment');
    } else {
      onNavigate?.('crypto');
    }
  };

  if (loading) {
    return (
      <MobileLayoutWithTabs showTabs={false}>
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-gray-300">Loading deposit options...</p>
        </div>
      </MobileLayoutWithTabs>
    );
  }

  return (
    <MobileLayoutWithTabs showTabs={false}>
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button 
          onClick={onBack}
          className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Go back"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
        </button>
      </div>
      
      <div className="mb-6">
        <div className="text-6xl mb-4 text-center">📥</div>
        <h1 className="text-2xl font-bold text-center mb-2">
          {t('deposit.title', 'Crypto Deposit')}
        </h1>
        <p className="text-center text-sm text-gray-400">
          {t('deposit.subtitle', 'Transfer crypto to your VonVault account')}
        </p>
      </div>

      <div className="w-full space-y-6">
        {/* Purpose Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-300">Deposit Purpose</h3>
          <div className="grid grid-cols-1 gap-2">
            <Card
              onClick={() => setPurpose('investment')}
              className={`cursor-pointer transition-all ${
                purpose === 'investment'
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <div className="font-medium text-white">For Investment</div>
                  <div className="text-sm text-gray-400">Add to investment portfolio</div>
                </div>
              </div>
            </Card>
            
            <Card
              onClick={() => setPurpose('general')}
              className={`cursor-pointer transition-all ${
                purpose === 'general'
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💼</span>
                <div>
                  <div className="font-medium text-white">General Balance</div>
                  <div className="text-sm text-gray-400">Add to available funds</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Network Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-300">Choose Network</h3>
          <div className="grid grid-cols-1 gap-2">
            {['polygon', 'ethereum', 'bsc'].map((network) => (
              <Card
                key={network}
                onClick={() => setSelectedNetwork(network)}
                className={`cursor-pointer transition-all ${
                  selectedNetwork === network
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{getNetworkDisplayName(network)}</span>
                  <span className="text-sm text-gray-400">
                    ~${vonvaultWallets[`usdc_${network}`]?.network_info?.avg_fee_usd || 'N/A'} fee
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Token Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-300">Choose Token</h3>
          <div className="grid grid-cols-2 gap-2">
            {['usdc', 'usdt'].map((token) => (
              <Card
                key={token}
                onClick={() => setSelectedToken(token)}
                className={`cursor-pointer transition-all ${
                  selectedToken === token
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="font-medium text-white">{token.toUpperCase()}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Deposit Amount */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Deposit Amount (Optional - for calculation)
          </label>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter amount..."
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
          />
          
          {depositAmount && parseFloat(depositAmount) > 0 && (
            <Card className="bg-blue-900/20 border-blue-500/30">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Deposit Amount:</span>
                  <span className="text-white">${parseFloat(depositAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conversion Fee (2.75%):</span>
                  <span className="text-red-400">-${calculateConversionFee().toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-600 pt-1 flex justify-between font-semibold">
                  <span className="text-blue-400">Net Amount:</span>
                  <span className="text-blue-400">${calculateNetAmount().toLocaleString()}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* VonVault Deposit Address */}
        {getCurrentVonVaultWallet() && (
          <Card className="bg-gray-800/50 border-gray-600">
            <h3 className="font-semibold text-white mb-3">
              VonVault {selectedToken.toUpperCase()} Address ({getNetworkDisplayName(selectedNetwork)})
            </h3>
            
            <div className="bg-gray-900 rounded-lg p-3 mb-3">
              <div className="text-xs text-gray-400 mb-1">Deposit Address:</div>
              <div className="font-mono text-sm text-purple-300 break-all">
                {getCurrentVonVaultWallet()?.address}
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-white rounded-lg p-4 text-center mb-3">
              <div className="text-gray-800 text-sm font-semibold">QR Code</div>
              <div className="text-xs text-gray-600 mt-1">
                {getCurrentVonVaultWallet()?.qr_code_data}
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-4">
              ⚠️ <strong>Important:</strong> Only send {selectedToken.toUpperCase()} tokens on {getNetworkDisplayName(selectedNetwork)} network to this address. 
              A 2.75% conversion fee will be deducted for FIAT integration.
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleDepositComplete}
                fullWidth
                className="h-12 bg-green-600 hover:bg-green-700"
              >
                {purpose === 'investment' 
                  ? t('deposit.proceedToInvestment', 'I have sent the deposit - Create Investment')
                  : t('deposit.complete', 'I have sent the deposit')
                }
              </Button>
              
              <Button
                onClick={() => onNavigate?.('crypto')}
                variant="outline"
                fullWidth
                className="h-10 border-gray-600 text-gray-300"
              >
                {t('deposit.backToWallets', 'Back to Crypto Wallets')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MobileLayoutWithTabs>
  );
};
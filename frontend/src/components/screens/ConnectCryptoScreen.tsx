import React, { useState, useEffect } from 'react';
import type { ScreenProps } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useReownAppKit } from '../../hooks/useReownAppKit';
import { CryptoWalletService } from '../../services/CryptoWalletService';
import { FullScreenLoader } from '../common/LoadingSpinner';
import { apiService } from '../../services/api';
import { useLoadingState, LOADING_KEYS } from '../../hooks/useLoadingState';
// REMOVED: framer-motion dependency

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
  isPopular?: boolean;
}

export const ConnectCryptoScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const { t } = useLanguage();
  const { user } = useApp();
  const { isConnected, connect, disconnect, connectedWallet, isLoading: walletLoading } = useReownAppKit();
  const [supportedWallets, setSupportedWallets] = useState<WalletOption[]>([]);
  const [connectedWallets, setConnectedWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(null);
  
  // === STANDARDIZED LOADING STATE MANAGEMENT ===
  const { withLoading, isLoading } = useLoadingState();

  useEffect(() => {
    loadWalletOptions();
    loadConnectedWallets();
  }, []);

  const loadWalletOptions = async () => {
    // Simulate loading wallet options
    const wallets: WalletOption[] = [
      {
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        description: 'Most popular Ethereum wallet',
        isAvailable: true,
        isPopular: true
      },
      {
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: '🔗',
        description: 'Connect any wallet via QR code',
        isAvailable: true,
        isPopular: true
      },
      {
        id: 'trust',
        name: 'Trust Wallet',
        icon: '🛡️',
        description: 'Secure mobile wallet',
        isAvailable: true
      },
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '💙',
        description: 'Easy-to-use wallet',
        isAvailable: true
      },
      {
        id: 'rainbow',
        name: 'Rainbow',
        icon: '🌈',
        description: 'Beautiful Ethereum wallet',
        isAvailable: true
      }
    ];
    
    setSupportedWallets(wallets);
  };

  const loadConnectedWallets = async () => {
    await withLoading(LOADING_KEYS.WALLET_CONNECT, async () => {
      try {
        if (user?.token) {
          const response = await apiService.getConnectedWallets(user.token);
          if (response.success) {
            setConnectedWallets(response.wallets || []);
          }
        }
      } catch (error) {
        console.error('Error loading connected wallets:', error);
      }
    });
  };

  const handleWalletConnect = async (wallet: WalletOption) => {
    await withLoading(LOADING_KEYS.WALLET_CONNECT, async () => {
      try {
        setSelectedWallet(wallet);
        
        // Connect using Reown AppKit
        await connect();
        
        // If successfully connected, save to backend
        if (connectedWallet) {
          const walletData = {
            address: connectedWallet.address,
            name: wallet.name,
            type: wallet.id,
            network: 'ethereum' // or detect network
          };
          
          const response = await apiService.saveConnectedWallet(user?.token, walletData);
          if (response.success) {
            await loadConnectedWallets();
          }
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    });
  };

  const handleWalletDisconnect = async (walletId: string) => {
    await withLoading(LOADING_KEYS.WALLET_CONNECT, async () => {
      try {
        await disconnect();
        
        // Remove from backend
        const response = await apiService.removeConnectedWallet(user?.token, walletId);
        if (response.success) {
          await loadConnectedWallets();
        }
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    });
  };

  const handleContinue = () => {
    if (connectedWallets.length > 0) {
      onNavigate?.('crypto-wallet');
    }
  };

  if (isLoading(LOADING_KEYS.WALLET_CONNECT)) {
    return <FullScreenLoader text="Connecting your wallet..." />;
  }

  return (
    <div className="connect-crypto-screen space-y-6">
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
        <h1 className="text-2xl font-bold">{t('crypto.connect.title', 'Connect Crypto Wallet')}</h1>
        <div className="w-10"></div>
      </div>

      {/* Description */}
      <div className="text-center px-4">
        <p className="text-gray-400 mb-4">
          {t('crypto.connect.description', 'Connect your crypto wallet to view balances and make transactions')}
        </p>
      </div>

      {/* Connected Wallets */}
      {connectedWallets.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-green-400">
              {t('crypto.connect.connected', 'Connected Wallets')}
            </h2>
            <span className="text-sm text-gray-400">
              {connectedWallets.length} connected
            </span>
          </div>
          
          <div className="space-y-3">
            {connectedWallets.map((wallet) => (
              <div
                key={wallet.id}
                className="connected-wallet flex items-center justify-between p-3 bg-green-900/10 border border-green-500/30 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400">✓</span>
                  </div>
                  <div>
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-sm text-gray-400">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleWalletDisconnect(wallet.id)}
                  variant="outline"
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                >
                  {t('crypto.connect.disconnect', 'Disconnect')}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Available Wallets */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          {t('crypto.connect.available', 'Available Wallets')}
        </h2>
        
        <div className="space-y-3">
          {supportedWallets.map((wallet) => (
            <div
              key={wallet.id}
              className={`
                wallet-option p-4 rounded-lg border transition-all cursor-pointer
                ${wallet.isAvailable 
                  ? 'border-gray-700 hover:border-purple-500/50 hover:bg-purple-500/5' 
                  : 'border-gray-800 opacity-50 cursor-not-allowed'
                }
              `}
              onClick={() => wallet.isAvailable && handleWalletConnect(wallet)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{wallet.icon}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="font-medium">{wallet.name}</div>
                      {wallet.isPopular && (
                        <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{wallet.description}</div>
                  </div>
                </div>
                
                {wallet.isAvailable && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWalletConnect(wallet);
                    }}
                    variant="outline"
                  >
                    {t('crypto.connect.connect', 'Connect')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Continue Button */}
      {connectedWallets.length > 0 && (
        <Button
          onClick={handleContinue}
          className="w-full h-12 bg-purple-600 hover:bg-purple-700"
        >
          {t('crypto.connect.continue', 'Continue to Wallet')}
        </Button>
      )}

      {/* Help Section */}
      <Card className="p-4 bg-blue-900/10 border-blue-500/30">
        <div className="text-center">
          <div className="text-blue-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-blue-400 mb-2">
            {t('crypto.connect.help.title', 'New to Crypto Wallets?')}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {t('crypto.connect.help.description', 'Learn how to set up and use crypto wallets safely')}
          </p>
          <Button
            onClick={() => onNavigate?.('wallet-help')}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            {t('crypto.connect.help.button', 'Learn More')}
          </Button>
        </div>
      </Card>
    </div>
  );
};
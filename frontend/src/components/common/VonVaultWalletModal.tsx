import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { Card } from './Card';
import { useLanguage } from '../../hooks/useLanguage';
import { web3ModalService, type Web3ModalConnection } from '../../services/Web3ModalService';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  isDetected?: boolean;
  category: 'detected' | 'popular' | 'mobile' | 'secure';
  description?: string;
}

interface VonVaultWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnect: (connection: Web3ModalConnection) => void;
  onError: (error: string) => void;
}

export const VonVaultWalletModal: React.FC<VonVaultWalletModalProps> = ({
  isOpen,
  onClose,
  onWalletConnect,
  onError
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);
  const [detectedWallets, setDetectedWallets] = useState<WalletOption[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [manualName, setManualName] = useState('');

  // Detect available wallets on mount
  useEffect(() => {
    if (isOpen) {
      detectWallets();
    }
  }, [isOpen]);

  const detectWallets = () => {
    const detected: WalletOption[] = [];
    
    // Check for MetaMask
    if (window.ethereum?.isMetaMask) {
      detected.push({
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        isDetected: true,
        category: 'detected',
        description: 'Ready to Connect'
      });
    }

    // Check for Trust Wallet
    if (window.ethereum?.isTrust) {
      detected.push({
        id: 'trust',
        name: 'Trust Wallet',
        icon: '🛡️',
        isDetected: true,
        category: 'detected',
        description: 'Detected'
      });
    }

    // Check for Coinbase Wallet
    if (window.ethereum?.isCoinbaseWallet) {
      detected.push({
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '🔵',
        isDetected: true,
        category: 'detected',
        description: 'Ready to Connect'
      });
    }

    setDetectedWallets(detected);
  };

  const popularWallets: WalletOption[] = [
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      category: 'popular',
      description: 'Trusted Exchange'
    },
    {
      id: 'hardware',
      name: 'Hardware Wallets',
      icon: '🔐',
      category: 'popular',
      description: 'Maximum Security'
    }
  ];

  const mobileWallets: WalletOption[] = [
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      category: 'mobile'
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: '🌈',
      category: 'mobile'
    },
    {
      id: 'walletconnect',
      name: '300+ More',
      icon: '🔗',
      category: 'mobile'
    }
  ];

  const handleWalletConnect = async (walletId: string) => {
    setLoading(walletId);
    
    try {
      if (walletId === 'walletconnect' || walletId === 'hardware') {
        // Use Reown AppKit for WalletConnect and hardware wallets
        const connection = await web3ModalService.connectWallet();
        onWalletConnect(connection);
      } else {
        // Use direct wallet connection for detected wallets
        const connection = await connectDirectWallet(walletId);
        onWalletConnect(connection);
      }
      onClose();
    } catch (error: any) {
      console.error(`${walletId} connection failed:`, error);
      onError(error.message || `Failed to connect ${walletId}`);
    } finally {
      setLoading(null);
    }
  };

  const connectDirectWallet = async (walletId: string): Promise<Web3ModalConnection> => {
    if (!window.ethereum) {
      throw new Error('No wallet detected. Please install a crypto wallet.');
    }

    // Request account access
    const accounts = await (window.ethereum as any).request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please create an account in your wallet.');
    }

    // Create ethers provider
    const { BrowserProvider } = await import('ethers');
    const provider = new BrowserProvider(window.ethereum as any);
    const network = await provider.getNetwork();

    const connection: Web3ModalConnection = {
      address: accounts[0],
      chainId: Number(network.chainId),
      provider,
      isConnected: true,
      walletInfo: {
        name: getWalletName(walletId),
        icon: getWalletIcon(walletId)
      }
    };

    return connection;
  };

  const getWalletName = (walletId: string): string => {
    const walletNames: Record<string, string> = {
      metamask: 'MetaMask',
      trust: 'Trust Wallet',
      coinbase: 'Coinbase Wallet',
      rainbow: 'Rainbow'
    };
    return walletNames[walletId] || 'Connected Wallet';
  };

  const getWalletIcon = (walletId: string): string => {
    const walletIcons: Record<string, string> = {
      metamask: '🦊',
      trust: '🛡️',
      coinbase: '🔵',
      rainbow: '🌈'
    };
    return walletIcons[walletId] || '🔗';
  };

  const handleManualConnect = async () => {
    if (!manualAddress) {
      onError('Please enter a wallet address');
      return;
    }

    setLoading('manual');
    
    try {
      const connection = await web3ModalService.addManualWallet(
        manualAddress, 
        manualName || 'Manual Wallet'
      );
      onWalletConnect(connection);
      onClose();
    } catch (error: any) {
      onError(error.message || 'Failed to add manual wallet');
    } finally {
      setLoading(null);
    }
  };

  const WalletButton: React.FC<{ wallet: WalletOption; onClick: () => void }> = ({ wallet, onClick }) => (
    <Button
      onClick={onClick}
      disabled={loading === wallet.id}
      loading={loading === wallet.id}
      className="w-full h-16 bg-gray-800/50 hover:bg-purple-600/20 border-gray-600 hover:border-purple-500 text-left flex items-center gap-4 p-4"
    >
      <span className="text-2xl">{wallet.icon}</span>
      <div className="flex-1">
        <div className="font-semibold text-white">{wallet.name}</div>
        {wallet.description && (
          <div className="text-sm text-gray-400">{wallet.description}</div>
        )}
      </div>
      {wallet.isDetected && (
        <div className="text-green-400 text-sm">✓</div>
      )}
    </Button>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {t('wallet.selectCrypto', 'Select Your Crypto Wallet')}
            </h2>
            <Button
              onClick={onClose}
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Detected Wallets */}
          {detectedWallets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔍</span>
                <h3 className="font-semibold text-white">
                  {t('wallet.detected', 'DETECTED WALLETS')}
                </h3>
              </div>
              
              <div className="space-y-2">
                {detectedWallets.map((wallet) => (
                  <WalletButton
                    key={wallet.id}
                    wallet={wallet}
                    onClick={() => handleWalletConnect(wallet.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Popular for Investors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <h3 className="font-semibold text-white">
                {t('wallet.popular', 'POPULAR FOR INVESTORS')}
              </h3>
            </div>
            
            <div className="space-y-2">
              {popularWallets
                .filter(wallet => !detectedWallets.some(detected => detected.id === wallet.id))
                .map((wallet) => (
                  <WalletButton
                    key={wallet.id}
                    wallet={wallet}
                    onClick={() => handleWalletConnect(wallet.id)}
                  />
                ))}
            </div>
          </div>

          {/* Mobile & Others */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <h3 className="font-semibold text-white">
                {t('wallet.mobile', 'MOBILE & OTHERS')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {mobileWallets
                .filter(wallet => !detectedWallets.some(detected => detected.id === wallet.id))
                .map((wallet) => (
                  <WalletButton
                    key={wallet.id}
                    wallet={wallet}
                    onClick={() => handleWalletConnect(wallet.id)}
                  />
                ))}
            </div>
          </div>

          {/* Manual Entry */}
          <div className="space-y-3">
            <Button
              onClick={() => setShowManualInput(!showManualInput)}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:border-purple-500"
            >
              📝 {t('wallet.manual', 'Enter Wallet Address Manually')}
            </Button>

            <AnimatePresence>
              {showManualInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Card className="bg-gray-800/50 border-gray-600 p-4">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="0x..."
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Wallet Name (Optional)"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                      <Button
                        onClick={handleManualConnect}
                        disabled={!manualAddress || loading === 'manual'}
                        loading={loading === 'manual'}
                        className="w-full"
                      >
                        {t('wallet.addManual', 'Add Manual Wallet')}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
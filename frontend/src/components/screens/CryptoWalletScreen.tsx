import React, { useState, useEffect } from 'react';
import type { ScreenProps, CryptoAsset } from '../../types';
import { ScreenHeader } from '../layout/ScreenHeader';
import { Card } from '../common/Card';
import { FullScreenLoader } from '../common/LoadingSpinner';

export const CryptoWalletScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCryptoAssets();
  }, []);

  const fetchCryptoAssets = async () => {
    try {
      setLoading(true);
      // Simulate fetching crypto assets
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAssets([
        { name: "Bitcoin", symbol: "BTC", amount: 0.25, usdValue: 16250.00 },
        { name: "Ethereum", symbol: "ETH", amount: 1.75, usdValue: 3500.00 },
        { name: "Solana", symbol: "SOL", amount: 12.5, usdValue: 875.00 }
      ]);
    } catch (error) {
      console.error('Error fetching crypto assets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FullScreenLoader text="Loading crypto assets..." />;
  }

  const totalValue = assets.reduce((total, asset) => total + asset.usdValue, 0);

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-12 pb-8">
      <ScreenHeader title="Crypto Wallet" onBack={onBack} />

      <div className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Total Crypto Value</h2>
        <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
      </div>

      <div className="space-y-4">
        {assets.map((asset, index) => (
          <Card key={index} hover>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-semibold">{asset.name}</div>
                <div className="text-sm text-gray-400">
                  {asset.amount.toLocaleString()} {asset.symbol}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-400">
                  ${asset.usdValue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  ${(asset.usdValue / asset.amount).toLocaleString()} per {asset.symbol}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
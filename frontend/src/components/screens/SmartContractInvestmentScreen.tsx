import React, { useState, useEffect } from 'react';
import type { ScreenProps } from '../../types';
import { CleanHeader } from '../layout/CleanHeader';
import { MobileLayoutWithTabs } from '../layout/MobileLayoutWithTabs';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { web3Service, NETWORK_CONFIG } from '../../services/web3Service';
import { apiService } from '../../services/api';

export const SmartContractInvestmentScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const [formData, setFormData] = useState({
    amount: '',
    network: 'polygon', // Default to cheapest
    tokenType: 'USDC',
    investmentPlan: 'premium'
  });

  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Connect, 3: Approve, 4: Invest, 5: Complete
  const [feeBreakdown, setFeeBreakdown] = useState(null);
  const [gasEstimate, setGasEstimate] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [investmentId, setInvestmentId] = useState('');
  const [error, setError] = useState('');

  // Calculate fees when amount or network changes
  useEffect(() => {
    if (formData.amount && parseFloat(formData.amount) > 0) {
      calculateFees();
    }
  }, [formData.amount, formData.network]);

  const calculateFees = async () => {
    try {
      const fees = await web3Service.calculateInvestmentFee(formData.amount, formData.network);
      const gasEstimate = await web3Service.estimateGasCosts(formData.network, formData.tokenType);
      
      setFeeBreakdown(fees);
      setGasEstimate(gasEstimate);
    } catch (error) {
      console.error('Fee calculation error:', error);
    }
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await web3Service.connectWallet();
      if (result.success) {
        setWalletConnected(true);
        setUserAddress(result.address);
        
        // Switch to selected network if needed
        if (result.network !== formData.network) {
          await web3Service.switchNetwork(formData.network);
        }
        
        setStep(2);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveToken = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await web3Service.approveToken(
        formData.tokenType,
        formData.amount,
        formData.network
      );
      
      if (result.success) {
        setTransactionHash(result.transactionHash);
        setStep(3);
        
        // Wait for approval confirmation
        setTimeout(() => {
          setStep(4);
        }, 3000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartContractInvestment = async () => {
    setLoading(true);
    setError('');

    try {
      const investmentId = web3Service.generateInvestmentId();
      setInvestmentId(investmentId);

      // Create investment record in backend first
      const backendInvestment = await apiService.createSmartContractInvestment({
        amount: parseFloat(formData.amount),
        currency: formData.tokenType,
        network: formData.network,
        investment_plan: formData.investmentPlan
      });

      // Process smart contract investment
      const result = await web3Service.processSmartContractInvestment({
        investmentId: investmentId,
        amount: formData.amount,
        tokenType: formData.tokenType,
        network: formData.network
      });

      if (result.success) {
        setTransactionHash(result.transactionHash);
        setStep(5);
        
        // Show success message
        setTimeout(() => {
          onNavigate?.('investments');
        }, 5000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="premium-header text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                💎 VonVault Premium Smart Contract Investment
              </h2>
              <p className="text-gray-400">Enterprise-grade Web 3.0 investment processing</p>
            </div>

            <Card>
              <div className="space-y-4">
                <Input
                  label="Investment Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="10000"
                  suffix={formData.tokenType}
                  type="number"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
                  <select
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                  >
                    <option value="polygon">Polygon (Recommended - $0.01 gas)</option>
                    <option value="bsc">BSC ($0.50 gas)</option>
                    <option value="ethereum">Ethereum ($15-25 gas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Token</label>
                  <select
                    value={formData.tokenType}
                    onChange={(e) => setFormData({ ...formData, tokenType: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                  >
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>
            </Card>

            {feeBreakdown && (
              <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/50">
                <h3 className="text-lg font-semibold text-white mb-4">💰 Premium Service Breakdown</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Investment Amount:</span>
                    <span className="text-white font-medium">${feeBreakdown.grossAmount.toFixed(2)} {formData.tokenType}</span>
                  </div>
                  
                  <div className="flex justify-between text-yellow-400">
                    <span>VonVault Service Fee (0.75%):</span>
                    <span className="font-medium">-${feeBreakdown.serviceFee.toFixed(2)} {formData.tokenType}</span>
                  </div>
                  
                  <div className="flex justify-between text-green-400">
                    <span>Your Net Investment:</span>
                    <span className="font-medium">${feeBreakdown.netInvestment.toFixed(2)} {formData.tokenType}</span>
                  </div>
                  
                  {gasEstimate && (
                    <div className="flex justify-between text-blue-400">
                      <span>Network Gas Fee:</span>
                      <span className="font-medium">~${gasEstimate.gasCostUSD.toFixed(2)} {formData.tokenType}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between text-lg font-bold text-white">
                      <span>Total Cost to You:</span>
                      <span>${(feeBreakdown.grossAmount + (gasEstimate?.gasCostUSD || 0)).toFixed(2)} {formData.tokenType}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="premium-features">
              <h4 className="text-white font-semibold mb-3">🚀 Premium Web 3.0 Features:</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-sm text-gray-300">⚡ Instant Processing</div>
                <div className="text-sm text-gray-300">🔍 Blockchain Transparency</div>
                <div className="text-sm text-gray-300">🛡️ Zero Risk Attribution</div>
                <div className="text-sm text-gray-300">🏆 Enterprise Grade</div>
              </div>
            </div>

            <Button
              onClick={handleConnectWallet}
              disabled={!formData.amount || loading}
              loading={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="large"
            >
              {loading ? 'Connecting...' : '🔗 Connect Wallet & Continue'}
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-white">Wallet Connected!</h3>
            <p className="text-gray-400">Address: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</p>
            <p className="text-gray-400">Network: {NETWORK_CONFIG[formData.network]?.name}</p>
            
            <Button
              onClick={handleApproveToken}
              loading={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? 'Processing...' : '✅ Approve Token Transfer'}
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold text-white">Token Approval Pending</h3>
            <p className="text-gray-400">Waiting for blockchain confirmation...</p>
            {transactionHash && (
              <p className="text-xs text-blue-400">TX: {transactionHash.slice(0, 10)}...</p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-white">Ready for Investment!</h3>
            <p className="text-gray-400">Token approved. Process your ${feeBreakdown?.netInvestment.toFixed(2)} investment now.</p>
            
            <Button
              onClick={handleSmartContractInvestment}
              loading={loading}
              className="w-full bg-green-600 hover:bg-green-700"
              size="large"
            >
              {loading ? 'Processing Investment...' : '💎 Process Smart Contract Investment'}
            </Button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-white">Investment Successful!</h3>
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
              <p className="text-green-400">Investment ID: {investmentId}</p>
              <p className="text-green-400">Amount Invested: ${feeBreakdown?.netInvestment.toFixed(2)}</p>
              <p className="text-green-400">Service Fee: ${feeBreakdown?.serviceFee.toFixed(2)}</p>
              {transactionHash && (
                <p className="text-xs text-blue-400 mt-2">TX: {transactionHash}</p>
              )}
            </div>
            <p className="text-gray-400">Redirecting to investments...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MobileLayoutWithTabs showTabs={false}>
      <CleanHeader 
        title="🚀 Smart Contract Investment" 
        onBack={onBack}
      />

      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {renderStepContent()}

      <div className="mt-6 text-center">
        <div className="flex justify-center space-x-2 mb-4">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-3 h-3 rounded-full ${
                step >= stepNumber ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Step {step} of 5: Premium Smart Contract Investment Process
        </p>
      </div>
    </MobileLayoutWithTabs>
  );
};
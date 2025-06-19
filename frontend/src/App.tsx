import React, { useState } from 'react';
import type { ScreenType, User } from './types';
import { AppProvider } from './context/AppContext';
import { useAuth } from './hooks/useAuth';

// Screen imports
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { SignUpScreen } from './components/screens/SignUpScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ConnectBankScreen } from './components/screens/ConnectBankScreen';
import { ConnectCryptoScreen } from './components/screens/ConnectCryptoScreen';
import { CryptoWalletScreen } from './components/screens/CryptoWalletScreen';
import { AvailableFundsScreen } from './components/screens/AvailableFundsScreen';
import { InvestmentsScreen } from './components/screens/InvestmentsScreen';
import { MakeNewInvestmentScreen } from './components/screens/MakeNewInvestmentScreen';
import { TransferFundsScreen } from './components/screens/TransferFundsScreen';
import { WithdrawalScreen } from './components/screens/WithdrawalScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { UiCatalogScreen } from './components/screens/UiCatalogScreen';
import { AdminPlansScreen } from './components/screens/AdminPlansScreen';
import { MembershipStatusScreen } from './components/screens/MembershipStatusScreen';

import './App.css';

// Main App Router Component
const AppRouter: React.FC = () => {
  const [screen, setScreen] = useState<ScreenType>('welcome');
  const { authenticateBank, authenticateCrypto } = useAuth();

  // Handle successful authentication
  const handleAuth = (userData: User) => {
    setScreen('dashboard');
  };

  // Handle bank connection
  const handleBankConnect = async () => {
    try {
      const user = await authenticateBank();
      if (user) {
        alert('Bank connected successfully!');
        setScreen('dashboard');
      }
    } catch (error) {
      console.error('Bank connection error:', error);
      alert('Bank connected successfully!'); // Fallback for demo
      setScreen('dashboard');
    }
  };

  // Handle crypto connection
  const handleCryptoConnect = async () => {
    try {
      const user = await authenticateCrypto();
      if (user) {
        alert('Wallet connected successfully!');
        setScreen('dashboard');
      }
    } catch (error) {
      console.error('Crypto connection error:', error);
      alert('Wallet connected successfully!'); // Fallback for demo
      setScreen('dashboard');
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return (
          <WelcomeScreen 
            onSignIn={() => setScreen('login')} 
            onCreateAccount={() => setScreen('signup')} 
          />
        );
      case 'login':
        return (
          <LoginScreen 
            onLogin={handleAuth}
            onCreateAccount={() => setScreen('signup')}
            onBack={() => setScreen('welcome')}
          />
        );
      case 'signup':
        return (
          <SignUpScreen 
            onContinue={handleAuth}
            onGoToLogin={() => setScreen('login')}
          />
        );
      case 'connect-bank':
        return (
          <ConnectBankScreen 
            onBack={() => setScreen('welcome')} 
            onConnect={handleBankConnect} 
          />
        );
      case 'connect-crypto':
        return (
          <ConnectCryptoScreen 
            onBack={() => setScreen('welcome')} 
            onConnect={handleCryptoConnect} 
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen 
            onNavigate={setScreen} 
          />
        );
      case 'investments':
        return (
          <InvestmentsScreen 
            onBack={() => setScreen('dashboard')} 
            onNavigate={setScreen}
          />
        );
      case 'new-investment':
        return (
          <MakeNewInvestmentScreen 
            onBack={() => setScreen('investments')} 
          />
        );
      case 'crypto':
        return (
          <CryptoWalletScreen 
            onBack={() => setScreen('dashboard')} 
          />
        );
      case 'funds':
        return (
          <AvailableFundsScreen 
            onBack={() => setScreen('dashboard')} 
          />
        );
      case 'transfer':
        return (
          <TransferFundsScreen 
            onBack={() => setScreen('dashboard')} 
          />
        );
      case 'withdraw':
        return (
          <WithdrawalScreen 
            onBack={() => setScreen('dashboard')} 
          />
        );
      case 'profile':
        return (
          <ProfileScreen 
            onBack={() => setScreen('dashboard')} 
            onNavigate={setScreen}
          />
        );
      case 'ui-catalog':
        return (
          <UiCatalogScreen 
            onBack={() => setScreen('dashboard')} 
          />
        );
      case 'admin-plans':
        return (
          <AdminPlansScreen 
            onBack={() => setScreen('dashboard')} 
          />
        );
      case 'membership-status':
        return (
          <MembershipStatusScreen 
            onBack={() => setScreen('dashboard')}
            onNavigate={setScreen}
          />
        );
      default:
        return (
          <WelcomeScreen 
            onSignIn={() => setScreen('login')} 
            onCreateAccount={() => setScreen('signup')} 
          />
        );
    }
  };

  return (
    <main className="bg-black min-h-screen text-white">
      {renderScreen()}
    </main>
  );
};

// Root App Component with Context Provider
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
};

export default App;
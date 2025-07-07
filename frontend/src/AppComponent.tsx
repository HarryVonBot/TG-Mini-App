import React, { useState, useEffect } from 'react';
import type { ScreenType, User } from './types';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './hooks/useTheme';
import { notificationService } from './services/NotificationService';
import { biometricAuthService } from './services/BiometricAuthService';
import { useApp } from './context/AppContext';
import { useAuth } from './hooks/useAuth';
import { MobileLayoutWithTabs } from './components/layout/MobileLayoutWithTabs';

// Screen imports
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { SignUpScreen } from './components/screens/SignUpScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ConnectBankScreen } from './components/screens/ConnectBankScreen';
import { ConnectCryptoScreen } from './components/screens/ConnectCryptoScreen';
import { CryptoWalletScreen } from './components/screens/CryptoWalletScreen';
import { CryptoDepositScreen } from './components/screens/CryptoDepositScreen';
import { WalletManagerScreen } from './components/screens/WalletManagerScreen';
import { EmailVerificationScreen } from './components/screens/EmailVerificationScreen';
import { SMSVerificationScreen } from './components/screens/SMSVerificationScreen';
import { TwoFactorSetupScreen } from './components/screens/TwoFactorSetupScreen';
import { AuthenticatorSetupScreen } from './components/screens/AuthenticatorSetupScreen';
import { Enhanced2FASetupScreen } from './components/screens/Enhanced2FASetupScreen';
import { SMSTwoFactorSetupScreen } from './components/screens/SMSTwoFactorSetupScreen';
import { VerificationSuccessScreen } from './components/screens/VerificationSuccessScreen';
import { AvailableFundsScreen } from './components/screens/AvailableFundsScreen';
import { AdminPlansScreen } from './components/screens/AdminPlansScreen';
import { AdminDashboardScreen } from './components/screens/AdminDashboardScreen';
import { AdminUsersScreen } from './components/screens/AdminUsersScreen';
import { AdminUserDetailsScreen } from './components/screens/AdminUserDetailsScreen';
import { AdminInvestmentsScreen } from './components/screens/AdminInvestmentsScreen';
import { AdminCryptoScreen } from './components/screens/AdminCryptoScreen';
import { PrivacyPolicyScreen } from './components/screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from './components/screens/TermsOfServiceScreen';
import { EditProfileScreen } from './components/screens/EditProfileScreen';
import { InvestmentsScreen } from './components/screens/InvestmentsScreen';
import { MakeNewInvestmentScreen } from './components/screens/MakeNewInvestmentScreen';
import { InvestmentCompletionScreen } from './components/screens/InvestmentCompletionScreen';
import { InvestmentAnalyticsScreen } from './components/screens/InvestmentAnalyticsScreen';
import { AchievementsScreen } from './components/screens/AchievementsScreen';
import { AutoInvestmentScreen } from './components/screens/AutoInvestmentScreen';
import { TransferFundsScreen } from './components/screens/TransferFundsScreen';
import { WithdrawalScreen } from './components/screens/WithdrawalScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { ThemeIndicator } from './components/common/ThemeIndicator';
import { UiCatalogScreen } from './components/screens/UiCatalogScreen';
import { MembershipStatusScreen } from './components/screens/MembershipStatusScreen';
import { CreateTicketScreen } from './components/screens/CreateTicketScreen';
import { MyTicketsScreen } from './components/screens/MyTicketsScreen';
import { SmartContractInvestmentScreen } from './components/screens/SmartContractInvestmentScreen';

import './App.css';

// Main App Router Component
const AppRouter: React.FC = () => {
  const [screen, setScreen] = useState<ScreenType>('welcome');
  const [userDetailsParams, setUserDetailsParams] = useState<any>(null);
  const { user: contextUser } = useApp(); // Access user from context for debugging

  // Prevent browser back button from exiting app
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent default back behavior
      event.preventDefault();
      
      // Handle in-app navigation based on current screen
      if (screen === 'dashboard') {
        // Don't exit from dashboard, stay there
        window.history.pushState(null, '', window.location.href);
      } else {
        // For other screens, go back to dashboard or appropriate screen
        const backScreens: Record<string, ScreenType> = {
          'new-investment': 'investments',
          'investment-completion': 'investments',
          'crypto-deposit': 'crypto',
          'wallet-manager': 'crypto',
          'funds': 'dashboard',
          'transfer': 'dashboard',
          'withdraw': 'dashboard',
          'investments': 'dashboard',
          'crypto': 'dashboard',
          'profile': 'dashboard'
        };
        
        const backScreen = backScreens[screen] || 'dashboard';
        setScreen(backScreen);
      }
    };

    // Push initial state to prevent immediate exit
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [screen]);

  // Initialize security services on app startup
  useEffect(() => {
    const initializeSecurityServices = async () => {
      try {
        console.log('Initializing security services...');
        
        // Initialize notification service
        await notificationService.init();
        console.log('Notification service initialized');
        
        // Initialize biometric service
        await biometricAuthService.init();
        console.log('Biometric service initialized');
        
        // Check for existing login and require biometric if enabled
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const status = biometricAuthService.getStatus();
          if (status.isEnabled && status.isSetup) {
            try {
              console.log('Requiring biometric authentication for app access...');
              await biometricAuthService.authenticateBiometric();
              console.log('Biometric authentication successful');
            } catch (error) {
              console.error('Biometric authentication failed:', error);
              // Fallback to login screen
              setScreen('login');
              return;
            }
          }
          // If user exists and biometric passed (or not required), go to dashboard
          setScreen('dashboard');
        }
      } catch (error) {
        console.error('Failed to initialize security services:', error);
      }
    };

    initializeSecurityServices();
  }, []);

  // Update document title based on current screen
  useEffect(() => {
    const titles = {
      'welcome': 'VonVault - DeFi Investment Platform',
      'signup': 'Sign Up - VonVault',
      'login': 'Sign In - VonVault', 
      'email-verification': 'Verify Email - VonVault',
      'sms-verification': 'Verify Phone - VonVault',
      '2fa-setup': 'Setup 2FA - VonVault',
      '2fa-authenticator-setup': 'Setup Authenticator - VonVault',
      'enhanced-2fa-setup': 'Enhanced 2FA Setup - VonVault',
      '2fa-sms-setup': 'Setup SMS 2FA - VonVault',
      'verification-success': 'Verification Complete - VonVault',
      'dashboard': 'Dashboard - VonVault',
      'profile': 'Profile - VonVault',
      'connect-bank': 'Connect Bank - VonVault',
      'connect-crypto': 'Connect Wallet - VonVault',
      'investments': 'Investments - VonVault',
      'crypto-wallet': 'Crypto Wallet - VonVault',
      'crypto-deposit': 'Crypto Deposit - VonVault',
      'wallet-manager': 'Wallet Manager - VonVault',
      'available-funds': 'Available Funds - VonVault',
      'membership-status': 'Membership - VonVault',
      'admin-plans': 'Investment Plans - VonVault',
      'admin-dashboard': 'Admin Dashboard - VonVault',
      'admin-users': 'User Management - VonVault',
      'admin-user-details': 'User Details - VonVault',
      'admin-investments': 'Investment Analytics - VonVault',
      'admin-crypto': 'Crypto Analytics - VonVault',
      'privacy-policy': 'Privacy Policy - VonVault',
      'terms-of-service': 'Terms of Service - VonVault',
      'edit-profile': 'Edit Profile - VonVault',
      'create-ticket': 'Submit Support Ticket - VonVault',
      'my-tickets': 'My Support Tickets - VonVault',
      'smart-contract-investment': 'Smart Contract Investment - VonVault'
    };
    
    document.title = titles[screen] || 'VonVault - DeFi Investment Platform';
  }, [screen]);
  
  const { authenticateBank, authenticateCrypto, user: authUser } = useAuth();

  // Monitor authentication state - redirect to login when user logs out
  useEffect(() => {
    // Add a longer delay to prevent race condition during login and allow membership to load
    const timer = setTimeout(() => {
      if (!authUser) {
        // User is not authenticated (logged out), redirect to login
        // But don't redirect if we're already on welcome/login/signup screens
        const publicScreens = ['welcome', 'login', 'signup'];
        if (!publicScreens.includes(screen)) {
          console.log('User logged out, redirecting to login screen');
          setScreen('login');
        }
      }
    }, 500); // Increased delay to allow auth and membership state to settle

    return () => clearTimeout(timer);
  }, [authUser, screen]);

  // Helper function to check if user is a hardcoded admin
  const isAdminUser = (email: string): boolean => {
    const adminEmails = ['admin@vonartis.com', 'security@vonartis.com'];
    return adminEmails.includes(email);
  };

  // Handle successful authentication - differentiate between signup and login
  const handleSignup = (userData: User) => {
    // Save user data for verification tracking
    localStorage.setItem('currentUser', JSON.stringify(userData));
    console.log('Signup completed, user data saved:', userData);
    console.log('Context user after signup:', contextUser);
    
    // IMPORTANT: Also update the AppContext user state immediately
    // This ensures user data is available in profile screen even if verification is skipped
    console.log('Setting user data in context after signup:', userData);
    
    // Trigger account creation notification
    notificationService.notifyAccountVerification('pending');
    
    // Admin bypass - Skip verification for hardcoded admins
    if (isAdminUser(userData.email || '')) {
      console.log('Admin user detected during signup, bypassing verification');
      setScreen('dashboard');
      return;
    }
    
    // New enhanced flow: User can choose verification path
    // Since user is now authenticated immediately, they can access dashboard
    // Default to verification flow but allow skipping
    setScreen('email-verification');
  };

  const handleSkipVerification = () => {
    // User chooses to skip verification and go directly to dashboard
    console.log('User skipped verification flow');
    console.log('Context user state:', contextUser);
    
    // Ensure user data is still available in context
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        console.log('User data available after skip:', userData);
      } catch (error) {
        console.error('Error parsing user data after skip:', error);
      }
    } else {
      console.warn('No user data found in localStorage after skip');
    }
    
    setScreen('dashboard');
  };

  const handleLogin = (userData: User) => {
    // Save user data for verification tracking
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Trigger login notification
    notificationService.notifyLoginAttempt('Current Location', 'This Device');
    
    console.log('Login successful, user data:', userData);
    console.log('User token exists:', !!userData.token);
    console.log('Is admin user?', isAdminUser(userData.email || ''));
    
    // Admin bypass - Skip verification for hardcoded admins
    if (isAdminUser(userData.email || '')) {
      console.log('Admin user detected, bypassing verification');
      console.log('Admin user has token:', !!userData.token);
      console.log('Setting screen to dashboard...');
      setScreen('dashboard');
      return;
    }
    
    // Check if user is already verified (stored in localStorage for demo)
    const verificationStatus = localStorage.getItem(`verification_${userData.email}`);
    
    if (verificationStatus === 'completed') {
      // User is already verified, go directly to dashboard
      console.log('User already verified, going to dashboard');
      setScreen('dashboard');
    } else {
      // User not verified yet, send through verification flow
      console.log('User not verified, going to email verification');
      setScreen('email-verification');
    }
  };

  // Handle successful authentication - differentiate between signup and login
  const handleVerificationComplete = () => {
    // Mark verification as completed for this user
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        localStorage.setItem(`verification_${userData.email}`, 'completed');
        
        // Notify successful verification
        notificationService.notifyAccountVerification('approved');
        
        console.log('Verification marked as completed for user:', userData.email);
        console.log('User data available after verification:', userData);
      } catch (error) {
        console.error('Error parsing user data during verification completion:', error);
      }
    } else {
      console.warn('No user data found in localStorage during verification');
    }
    
    setScreen('dashboard');
  };

  // Helper function to handle navigation with proper typing
  const handleNavigation = (screen: string) => {
    setScreen(screen as ScreenType);
  };

  // Handle bank connection
  const handleBankConnect = async () => {
    try {
      // Require biometric authentication for financial connections
      const biometricRequired = await biometricAuthService.requireBiometricForOperation('bank-connection');
      if (!biometricRequired) {
        alert('Biometric authentication required for bank connections');
        return;
      }
      
      await authenticateBank();
      
      // Notify successful connection
      await notificationService.notifyTransaction('deposit', 0, 'Bank Connected');
      
      setScreen('verification-success');
    } catch (error) {
      console.error('Bank connection failed:', error);
    }
  };

  // Handle crypto connection
  const handleCryptoConnect = async () => {
    try {
      // Require biometric authentication for crypto wallet connections
      const biometricRequired = await biometricAuthService.requireBiometricForOperation('crypto-connection');
      if (!biometricRequired) {
        alert('Biometric authentication required for crypto wallet connections');
        return;
      }
      
      await authenticateCrypto();
      
      // Notify successful crypto connection
      await notificationService.notifyTransaction('trade', 0, 'Crypto Wallet Connected');
      
      setScreen('verification-success');
    } catch (error) {
      console.error('Crypto connection failed:', error);
    }
  };

  const renderScreen = () => {
    {/* Theme Indicator for Testing */}
    {(screen === 'dashboard' || screen === 'profile') && (
      <>
        {/* We can remove this after testing */}
        <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50">
          <ThemeIndicator />
        </div>
      </>
    )}
    
    switch (screen) {
      case 'welcome':
        return (
          <WelcomeScreen 
            onSignIn={() => setScreen('login')} 
            onCreateAccount={() => setScreen('signup')} 
            onNavigate={(screen) => setScreen(screen)}
          />
        );
      case 'login':
        return (
          <LoginScreen 
            onLogin={handleLogin}
            onCreateAccount={() => setScreen('signup')}
            onBack={() => setScreen('welcome')}
          />
        );
      case 'signup':
        return (
          <SignUpScreen 
            onBack={() => setScreen('welcome')}
            onSignUp={handleSignup}
            onGoToLogin={() => setScreen('login')}
          />
        );
      case 'email-verification':
        return (
          <EmailVerificationScreen 
            onBack={() => setScreen('signup')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case 'sms-verification':
        return (
          <SMSVerificationScreen 
            onBack={() => setScreen('email-verification')}
            onNavigate={(screen) => {
              if (screen === 'verification-success') {
                setScreen('2fa-setup'); // Go to 2FA setup instead
              } else {
                setScreen(screen);
              }
            }}
          />
        );
      case '2fa-setup':
        return (
          <TwoFactorSetupScreen 
            onBack={() => setScreen('sms-verification')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case '2fa-authenticator-setup':
        return (
          <AuthenticatorSetupScreen 
            onBack={() => setScreen('2fa-setup')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case 'enhanced-2fa-setup':
        return (
          <Enhanced2FASetupScreen 
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case '2fa-sms-setup':
        return (
          <SMSTwoFactorSetupScreen 
            onBack={() => setScreen('2fa-setup')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case 'verification-success':
        return (
          <VerificationSuccessScreen 
            onContinue={() => {
              handleVerificationComplete();
            }}
          />
        );
      case 'connect-bank':
        return (
          <ConnectBankScreen 
            onBack={() => setScreen('dashboard')} // Skip goes to dashboard
            onConnect={handleBankConnect} 
          />
        );
      case 'connect-crypto':
        return (
          <ConnectCryptoScreen 
            onBack={() => setScreen('dashboard')} // Skip goes to dashboard
            onConnect={handleCryptoConnect} 
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen 
            onNavigate={(screen) => setScreen(screen as ScreenType)} 
          />
        );
      // Add direct access to connect-crypto for testing
      case 'test-wallet-connections':
        return (
          <ConnectCryptoScreen 
            onBack={() => setScreen('dashboard')}
            onConnect={handleCryptoConnect} 
          />
        );
      case 'analytics':
        return (
          <InvestmentAnalyticsScreen 
            onBack={() => setScreen('dashboard')}
            onNavigate={(screen) => setScreen(screen as ScreenType)} 
          />
        );
      case 'achievements':
        return (
          <AchievementsScreen 
            onBack={() => setScreen('dashboard')}
            onNavigate={(screen) => setScreen(screen as ScreenType)} 
          />
        );
      case 'auto-investment':
        return (
          <AutoInvestmentScreen 
            onBack={() => setScreen('dashboard')}
            onNavigate={(screen) => setScreen(screen as ScreenType)} 
          />
        );
      case 'investments':
        return (
          <InvestmentsScreen 
            onBack={() => setScreen('dashboard')} 
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case 'new-investment':
        return (
          <MakeNewInvestmentScreen 
            onBack={() => setScreen('investments')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case 'investment-completion':
        return (
          <InvestmentCompletionScreen 
            onBack={() => setScreen('new-investment')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case 'crypto':
        return (
          <CryptoWalletScreen 
            onBack={() => setScreen('dashboard')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case 'crypto-deposit':
        return (
          <CryptoDepositScreen 
            onBack={() => setScreen('crypto')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case 'wallet-manager':
        return (
          <WalletManagerScreen 
            onBack={() => setScreen('crypto')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case 'funds':
        return (
          <AvailableFundsScreen 
            onBack={() => setScreen('dashboard')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
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
            onNavigate={(screen) => setScreen(screen as ScreenType)}
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
            onBack={() => setScreen('admin-dashboard')} 
          />
        );
      case 'admin-dashboard':
        return (
          <AdminDashboardScreen 
            onBack={() => setScreen('dashboard')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case 'admin-users':
        return (
          <AdminUsersScreen 
            onBack={() => setScreen('admin-dashboard')}
            onNavigate={(screen, params) => {
              if (screen === 'admin-user-details' && params?.userId) {
                setUserDetailsParams(params);
              }
              setScreen(screen);
            }}
          />
        );
      case 'admin-user-details':
        return (
          <AdminUserDetailsScreen 
            onBack={() => setScreen('admin-users')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
            userId={userDetailsParams?.userId}
          />
        );
      case 'admin-investments':
        return (
          <AdminInvestmentsScreen 
            onBack={() => setScreen('admin-dashboard')}
          />
        );
      case 'admin-crypto':
        return (
          <AdminCryptoScreen 
            onBack={() => setScreen('admin-dashboard')}
          />
        );
      case 'membership-status':
        return (
          <MembershipStatusScreen 
            onBack={() => setScreen('dashboard')}
            onNavigate={(screen) => setScreen(screen as ScreenType)}
          />
        );
      case 'privacy-policy':
        return (
          <PrivacyPolicyScreen onBack={() => setScreen('welcome')} />
        );
      case 'terms-of-service':
        return (
          <TermsOfServiceScreen onBack={() => setScreen('welcome')} />
        );
      case 'edit-profile':
        return (
          <EditProfileScreen onBack={() => setScreen('profile')} />
        );
      case 'create-ticket':
        return (
          <CreateTicketScreen onBack={() => setScreen('profile')} onNavigate={handleNavigation} />
        );
      case 'my-tickets':
        return (
          <MyTicketsScreen onBack={() => setScreen('profile')} onNavigate={handleNavigation} />
        );
      case 'smart-contract-investment':
        return (
          <SmartContractInvestmentScreen onBack={() => setScreen('new-investment')} onNavigate={handleNavigation} />
        );
      default:
        return (
          <WelcomeScreen 
            onSignIn={() => setScreen('login')} 
            onCreateAccount={() => setScreen('signup')} 
            onNavigate={(screen) => setScreen(screen)}
          />
        );
    }
  };

  // Screens that should show bottom tabs (main app screens)
  const tabScreens = [
    'dashboard', 'investments', 'crypto', 'profile', 
    'analytics', 'achievements', 'auto-investment', 'new-investment', 'investment-completion',
    'crypto-deposit', 'wallet-manager', 'funds', 'transfer', 'withdraw', 'membership-status', 'edit-profile',
    'admin-dashboard', 'admin-users', 'admin-user-details', 'admin-investments', 'admin-crypto', 'admin-plans',
    'create-ticket', 'my-tickets', 'smart-contract-investment',
    'ui-catalog'
  ];
  const showTabs = tabScreens.includes(screen);

  // Handle bottom tab navigation
  const handleTabNavigation = (tabScreen: string) => {
    switch (tabScreen) {
      case 'dashboard':
        setScreen('dashboard');
        break;
      case 'investments':
        setScreen('investments');
        break;
      case 'crypto':
        setScreen('crypto');
        break;
      case 'profile':
        setScreen('profile');
        break;
      default:
        setScreen('dashboard');
    }
  };

  const authScreens = [
    'welcome', 'login', 'signup', 'terms-of-service', 'privacy-policy',
    'email-verification', 'sms-verification', '2fa-setup', '2fa-authenticator-setup', 
    'enhanced-2fa-setup', '2fa-sms-setup', 'verification-success',
    'connect-bank', 'connect-crypto', 'test-wallet-connections'
  ];
  const isAuthScreen = authScreens.includes(screen);

  // For authentication screens, render directly without MobileLayoutWithTabs wrapper
  if (isAuthScreen) {
    return renderScreen();
  }

  // For app screens, wrap with MobileLayoutWithTabs
  return (
    <MobileLayoutWithTabs 
      showTabs={showTabs}
      onNavigate={handleTabNavigation}
      currentScreen={screen}
    >
      {renderScreen()}
    </MobileLayoutWithTabs>
  );
};

// Root App Component with Context Provider
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
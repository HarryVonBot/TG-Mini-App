// Custom hook for authentication management
import { useState, useEffect } from 'react';
import type { User } from '../types';
import { apiService } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Authenticate via bank connection
  const authenticateBank = async (): Promise<User | null> => {
    setLoading(true);
    try {
      const response = await apiService.authenticateViaTelegram({ 
        user_id: 'bank_user_' + Date.now() 
      });
      
      if (response.token) {
        const userData: User = {
          token: response.token,
          user_id: response.user_id,
          type: 'bank'
        };
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Bank authentication error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Authenticate via crypto wallet
  const authenticateCrypto = async (): Promise<User | null> => {
    setLoading(true);
    try {
      const response = await apiService.authenticateViaTelegram({ 
        user_id: 'crypto_user_' + Date.now() 
      });
      
      if (response.token) {
        const userData: User = {
          token: response.token,
          user_id: response.user_id,
          type: 'crypto'
        };
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Crypto authentication error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Login with email/password
  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData: User = {
        token: 'login_token_' + Date.now(),
        user_id: 'user_' + Date.now(),
        email,
        type: 'login'
      };
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Signup with user data
  const signup = async (userData: { name: string; email: string; password: string; phone: string }): Promise<User | null> => {
    setLoading(true);
    try {
      // Simulate signup API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const user: User = {
        token: 'signup_token_' + Date.now(),
        user_id: 'user_' + Date.now(),
        email: userData.email,
        name: userData.name,
        type: 'signup'
      };
      setUser(user);
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = !!user?.token;

  return {
    user,
    setUser,
    loading,
    authenticateBank,
    authenticateCrypto,
    login,
    signup,
    logout,
    isAuthenticated
  };
};
import React, { useState, useRef, useEffect } from 'react';
import type { AuthScreenProps } from '../../types';
import { Input } from '../common/Input';
import { PasswordInput } from '../common/PasswordInput';
import { EmailInput } from '../common/EmailInput';
import { Button } from '../common/Button';
import { LanguageSelector } from '../common/LanguageSelector';
import { apiService } from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';
import { useTelegram } from '../../context/TelegramContext';
// REMOVED: framer-motion dependency

export const SignUpScreen: React.FC<AuthScreenProps> = ({ onBack, onSignUp, onGoToLogin }) => {
  const { t } = useLanguage();
  const { webApp } = useTelegram();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // Refs for auto-focus functionality
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  // Auto-focus functionality
  useEffect(() => {
    const { name, email, password, confirmPassword } = formData;
    
    // Name validation: 6+ chars with space
    if (name.length >= 6 && name.includes(' ')) {
      emailRef.current?.focus();
    }
    
    // Email validation: valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      passwordRef.current?.focus();
    }
    
    // Password validation: 8+ chars (strong password)
    if (password.length >= 8) {
      confirmPasswordRef.current?.focus();
    }
    
    // Confirm password validation: passwords match
    if (password === confirmPassword && confirmPassword.length > 0) {
      phoneRef.current?.focus();
    }
  }, [formData]);

  // Password matching check
  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordsMatch(false);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('auth:validation.nameRequired');
    } else if (formData.name.length < 6 || !formData.name.includes(' ')) {
      newErrors.name = t('auth:validation.nameFormat');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('auth:validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth:validation.emailInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth:validation.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('auth:validation.passwordMinLength');
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth:validation.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth:validation.passwordMismatch');
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = t('auth:validation.phoneRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Remove confirmPassword from the data sent to API
      const { confirmPassword, ...signUpData } = formData;
      
      const response = await apiService.signUp(signUpData);
      
      if (response.success) {
        onSignUp(response.user);
      } else {
        setErrors({ general: response.message || t('auth:error.signupFailed') });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: t('auth:error.signupFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Auto-advance to next field or submit
      switch (field) {
        case 'name':
          emailRef.current?.focus();
          break;
        case 'email':
          passwordRef.current?.focus();
          break;
        case 'password':
          confirmPasswordRef.current?.focus();
          break;
        case 'confirmPassword':
          phoneRef.current?.focus();
          break;
        case 'phone':
          handleSubmit(e as any);
          break;
      }
    }
  };

  return (
    <div className="h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <LanguageSelector />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{t('auth:signup.title')}</h1>
          <p className="text-gray-400 text-sm">{t('auth:signup.subtitle')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="signup-error bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          {/* Name Field */}
          <div className="form-field">
            <Input
              ref={nameRef}
              label={t('auth:signup.name')}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'name')}
              placeholder={t('auth:signup.namePlaceholder')}
              error={errors.name}
              autoComplete="given-name"
              autoFocus
            />
          </div>

          {/* Email Field */}
          <div className="form-field">
            <EmailInput
              ref={emailRef}
              label={t('auth:signup.email')}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'email')}
              placeholder={t('auth:signup.emailPlaceholder')}
              error={errors.email}
            />
          </div>

          {/* Password Field */}
          <div className="form-field">
            <PasswordInput
              ref={passwordRef}
              label={t('auth:signup.password')}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'password')}
              placeholder={t('auth:signup.passwordPlaceholder')}
              error={errors.password}
              showPassword={showPassword}
              onToggleVisibility={() => setShowPassword(!showPassword)}
            />
          </div>

          {/* Confirm Password Field */}
          <div className="form-field">
            <PasswordInput
              ref={confirmPasswordRef}
              label={t('auth:signup.confirmPassword')}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'confirmPassword')}
              placeholder={t('auth:signup.confirmPasswordPlaceholder')}
              error={errors.confirmPassword}
              showPassword={showConfirmPassword}
              onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
              preventCopyPaste={true}
            />
            
            {/* Passwords Match Indicator */}
            {passwordsMatch && formData.confirmPassword && (
              <div className="passwords-match-indicator mt-2 text-green-400 text-sm flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Passwords match</span>
              </div>
            )}
          </div>

          {/* Phone Field */}
          <div className="form-field">
            <Input
              ref={phoneRef}
              label={t('auth:signup.phone')}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'phone')}
              placeholder={t('auth:signup.phonePlaceholder')}
              error={errors.phone}
              inputMode="tel"
              autoComplete="tel"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6"
          >
            {isLoading ? t('auth:signup.creating') : t('auth:signup.createAccount')}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <span>{t('auth:signup.haveAccount')} </span>
          <button
            onClick={onGoToLogin}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            {t('auth:signup.signIn')}
          </button>
        </div>
      </div>
    </div>
  );
};
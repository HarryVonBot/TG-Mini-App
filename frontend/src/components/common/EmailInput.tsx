import React, { forwardRef, useState } from 'react';
import { Input } from './Input';
// REMOVED: framer-motion dependency

interface EmailInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  autoFocus?: boolean;
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(({
  label,
  value,
  onChange,
  onKeyPress,
  placeholder = "Enter your email",
  required = false,
  disabled = false,
  error,
  className = '',
  autoFocus = false,
}, ref) => {
  const [isValid, setIsValid] = useState(false);

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(e);
    
    // Update validation state
    setIsValid(validateEmail(newValue));
  };

  return (
    <div className={`email-input ${className}`}>
      <div className="relative">
        <Input
          ref={ref}
          type="email"
          label={label}
          value={value}
          onChange={handleEmailChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          error={error}
          autoFocus={autoFocus}
          inputMode="email"
          autoComplete="email"
          className={isValid ? 'border-green-500 focus:border-green-600' : ''}
        />
        
        {/* Success checkmark */}
        {isValid && value.length > 0 && (
          <div className="email-success-indicator absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
});
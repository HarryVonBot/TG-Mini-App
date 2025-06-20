import React, { useState } from 'react';
import type { AuthScreenProps } from '../../types';
import { ScreenHeader } from '../layout/ScreenHeader';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

export const SignUpScreen: React.FC<AuthScreenProps> = ({ onContinue, onGoToLogin }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    countryCode: '+1'
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup, loading } = useAuth();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!form.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(form.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!agreed) newErrors.terms = 'You must agree to Terms of Service';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    const user = await signup(form);
    if (user && onContinue) {
      onContinue(user);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-12 pb-8 flex flex-col">
      <ScreenHeader title="Create Account" onBack={onGoToLogin} />

      <div className="space-y-5">
        <Input
          label="Full Name"
          value={form.name}
          onChange={handleChange('name')}
          placeholder="Enter your full name"
          required
          error={errors.name}
        />
        
        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={handleChange('email')}
          placeholder="Enter your email"
          required
          error={errors.email}
        />
        
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange('password')}
          placeholder="Enter your password"
          required
          error={errors.password}
        />
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-white">
            Phone Number <span className="text-red-400 ml-1">*</span>
          </label>
          <div className="flex gap-2">
            <select
              value={form.countryCode}
              onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
              className="p-3 bg-gray-900 border border-purple-500 rounded-lg text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+33">🇫🇷 +33</option>
              <option value="+49">🇩🇪 +49</option>
              <option value="+39">🇮🇹 +39</option>
              <option value="+34">🇪🇸 +34</option>
              <option value="+86">🇨🇳 +86</option>
              <option value="+81">🇯🇵 +81</option>
              <option value="+91">🇮🇳 +91</option>
            </select>
            <Input
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="123 456 7890"
              required
              error={errors.phone}
              className="flex-1"
            />
          </div>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 mr-2 accent-purple-600"
          />
          <p className="text-sm text-white">
            I agree to VonVault's{' '}
            <span className="text-purple-400 cursor-pointer hover:text-purple-300 transition-colors">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-purple-400 cursor-pointer hover:text-purple-300 transition-colors">
              Privacy Policy
            </span>
          </p>
        </div>
        {errors.terms && <p className="text-red-400 text-sm">{errors.terms}</p>}
      </div>

      <div className="mt-8">
        <Button
          onClick={handleSignUp}
          loading={loading}
          fullWidth
          size="lg"
        >
          Create Account
        </Button>
        
        <p className="text-center text-sm text-white mt-4">
          Already have an account?{' '}
          <span 
            className="text-purple-400 font-medium cursor-pointer hover:text-purple-300 transition-colors" 
            onClick={onGoToLogin}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};
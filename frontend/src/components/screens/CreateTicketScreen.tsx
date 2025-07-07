import React, { useState } from 'react';
import type { ScreenProps } from '../../types';
import { CleanHeader } from '../layout/CleanHeader';
import { MobileLayoutWithTabs } from '../layout/MobileLayoutWithTabs';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { apiService } from '../../services/api';
import { useLoadingState, LOADING_KEYS } from '../../hooks/useLoadingState';

export const CreateTicketScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium'
  });
  const [error, setError] = useState<string | null>(null);
  
  // === STANDARDIZED LOADING STATE MANAGEMENT ===
  const { withLoading, isLoading } = useLoadingState();

  const categories = [
    { value: 'account', label: 'Account Issues' },
    { value: 'financial', label: 'Financial Questions' },
    { value: 'technical', label: 'Technical Problems' },
    { value: 'verification', label: 'Verification Issues' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    await withLoading(LOADING_KEYS.SETTINGS, async () => {
      try {
        const response = await apiService.createSupportTicket(formData);
        
        if (response.success) {
          // Show success message and navigate to tickets
          alert(`Support ticket created successfully!\nTicket ID: ${response.ticket_id}\n\nOur team will respond within 24 hours.`);
          onNavigate?.('my-tickets');
        } else {
          setError('Failed to create support ticket. Please try again.');
        }
      } catch (error: any) {
        console.error('Error creating support ticket:', error);
        setError(error.message || 'Failed to create support ticket. Please try again.');
      }
    });
  };

  return (
    <MobileLayoutWithTabs showTabs={false}>
      <CleanHeader 
        title="🎫 Submit Support Ticket" 
        onBack={onBack}
      />

      <Card>
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isLoading(LOADING_KEYS.SETTINGS)}
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading(LOADING_KEYS.SETTINGS)}
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <Input
              label="Subject *"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief description of your issue"
              required
              disabled={isLoading(LOADING_KEYS.SETTINGS)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide detailed information about your issue..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
              required
              disabled={isLoading(LOADING_KEYS.SETTINGS)}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isLoading(LOADING_KEYS.SETTINGS)}
            loading={isLoading(LOADING_KEYS.SETTINGS)}
          >
            {isLoading(LOADING_KEYS.SETTINGS) ? 'Creating Ticket...' : 'Submit Support Ticket'}
          </Button>

          {/* Info Note */}
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              📝 <strong>Note:</strong> You'll receive a ticket number once submitted. 
              Our support team typically responds within 24 hours.
            </p>
          </div>
        </form>
      </Card>
    </MobileLayoutWithTabs>
  );
};
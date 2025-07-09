import React, { useState, useEffect } from 'react';
import type { ScreenProps } from '../../types';
import { CleanHeader } from '../layout/CleanHeader';
import { MobileLayoutWithTabs } from '../layout/MobileLayoutWithTabs';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { apiService } from '../../services/api';
import { useLoadingState, LOADING_KEYS } from '../../hooks/useLoadingState';

interface SupportTicket {
  ticket_id: string;
  freshdesk_id: number;
  subject: string;
  status: 'new' | 'in-progress' | 'waiting-response' | 'resolved' | 'closed';
  created_at: string;
  freshdesk_url?: string;
}

export const MyTicketsScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // === STANDARDIZED LOADING STATE MANAGEMENT ===
  const { withLoading, isLoading } = useLoadingState();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    await withLoading(LOADING_KEYS.SETTINGS, async () => {
      try {
        setError(null);
        
        const response = await apiService.getUserSupportTickets();
        setTickets(response.tickets || []);
      } catch (error: any) {
        console.error('Error fetching tickets:', error);
        setError(error.message || 'Failed to load support tickets');
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-600';
      case 'in-progress': return 'bg-yellow-600';
      case 'waiting-response': return 'bg-orange-600';
      case 'resolved': return 'bg-green-600';
      case 'closed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading(LOADING_KEYS.SETTINGS)) {
    return (
      <MobileLayoutWithTabs showTabs={false}>
        <CleanHeader title="📋 My Support Tickets" onBack={onBack} />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <div className="text-gray-400">Loading your tickets...</div>
          </div>
        </div>
      </MobileLayoutWithTabs>
    );
  }

  if (error) {
    return (
      <MobileLayoutWithTabs showTabs={false}>
        <CleanHeader title="📋 My Support Tickets" onBack={onBack} />
        <Card className="text-center">
          <div className="text-red-400 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Tickets</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button 
            onClick={fetchTickets} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            Try Again
          </Button>
        </Card>
      </MobileLayoutWithTabs>
    );
  }

  return (
    <MobileLayoutWithTabs showTabs={false}>
      <CleanHeader 
        title="📋 My Support Tickets" 
        onBack={onBack}
        action={
          <Button
            onClick={() => onNavigate?.('create-ticket')}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            + New
          </Button>
        }
      />

      {tickets.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
          <p className="text-gray-400 mb-6">
            You haven't submitted any support tickets yet.
          </p>
          <Button
            onClick={() => onNavigate?.('create-ticket')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Submit Your First Ticket
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.ticket_id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-gray-400">
                      #{ticket.freshdesk_id || ticket.ticket_id}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('-', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">
                    {ticket.subject}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="capitalize">{ticket.category.replace('-', ' ')}</span>
                    <span className={getPriorityColor(ticket.priority)}>
                      {ticket.priority} priority
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Created {formatDate(ticket.created_at)}</span>
                <div className="flex items-center gap-4">
                  {ticket.freshdesk_url && (
                    <a 
                      href={ticket.freshdesk_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      View in Support System →
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {/* Refresh Button */}
          <Card className="text-center py-4">
            <Button
              onClick={fetchTickets}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              ↻ Refresh Tickets
            </Button>
          </Card>
        </div>
      )}
    </MobileLayoutWithTabs>
  );
};
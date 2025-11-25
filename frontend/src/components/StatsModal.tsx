import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Download, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserStats {
  totalConversations: number;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  totalMemories: number;
  firstConversationDate: string | null;
  accountCreatedAt: string | null;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/export', { responseType: 'blob' });
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grok-memory-hub-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const daysAgo = (dateString: string | null) => {
    if (!dateString) return null;
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary border border-border-subtle rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-accent-primary" size={24} />
            <h2 className="text-xl font-semibold text-text-primary">Your Statistics & Data</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            <X size={20} className="text-text-tertiary" />
          </button>
        </div>

        {}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
          ) : stats ? (
            <div className="space-y-8">
              {}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-border-subtle pb-2">
                  <span className="text-text-tertiary text-sm">Conversations</span>
                  <span className="text-3xl font-light text-text-primary tabular-nums">{stats.totalConversations}</span>
                </div>
                
                <div className="flex items-baseline justify-between border-b border-border-subtle pb-2">
                  <span className="text-text-tertiary text-sm">Messages</span>
                  <div className="text-right">
                    <div className="text-3xl font-light text-text-primary tabular-nums">{stats.totalMessages}</div>
                    <div className="text-xs text-text-tertiary mt-1">
                      {stats.userMessages} sent · {stats.assistantMessages} received
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline justify-between border-b border-border-subtle pb-2">
                  <span className="text-text-tertiary text-sm">Memories</span>
                  <span className="text-3xl font-light text-text-primary tabular-nums">{stats.totalMemories}</span>
                </div>

                <div className="flex items-baseline justify-between border-b border-border-subtle pb-2">
                  <span className="text-text-tertiary text-sm">Account Age</span>
                  <span className="text-3xl font-light text-text-primary tabular-nums">
                    {daysAgo(stats.accountCreatedAt)} <span className="text-base text-text-tertiary font-normal">days</span>
                  </span>
                </div>
              </div>

              {}
              <div className="space-y-3 pt-4 border-t border-border-subtle">
                <div className="flex justify-between text-sm">
                  <span className="text-text-tertiary">Joined</span>
                  <span className="text-text-primary font-medium">{formatDate(stats.accountCreatedAt)}</span>
                </div>
                {stats.firstConversationDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">First Chat</span>
                    <span className="text-text-primary font-medium">{formatDate(stats.firstConversationDate)}</span>
                  </div>
                )}
              </div>

              {}
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 bg-text-primary hover:bg-text-secondary disabled:bg-text-tertiary text-bg-primary py-2 px-4 rounded-lg transition-colors font-medium text-sm"
              >
                {exporting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Export All Data
                  </>
                )}
              </button>
              <p className="text-xs text-text-tertiary text-center -mt-2">
                Download everything as JSON
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              Failed to load statistics
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

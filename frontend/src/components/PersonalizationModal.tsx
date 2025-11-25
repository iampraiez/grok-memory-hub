import React, { useEffect, useState } from 'react';
import { X, User, Briefcase, MessageSquare, Info } from 'lucide-react';
import { preferencesApi } from '../lib/api';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonalizationModal: React.FC<PersonalizationModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    style: 'Default',
    customInstructions: '',
    nickname: '',
    occupation: '',
    moreInfo: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const res = await preferencesApi.get();
      setFormData(res.data);
    } catch (error) {
      console.error('Failed to load preferences', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await preferencesApi.update(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save preferences', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const styles = ['Default', 'Professional', 'Friendly', 'Candid', 'Quirky', 'Efficient', 'Nerdy', 'Cynical'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-secondary w-full max-w-3xl rounded-xl shadow-2xl border border-border-subtle overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        {}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle bg-bg-secondary shrink-0">
          <h2 className="text-lg font-semibold text-text-primary">Personalization</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-bg-tertiary rounded-full transition-colors text-text-secondary">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <div className="p-5 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {}
                <div className="space-y-5">
                  {}
                  <section className="space-y-2">
                    <div className="flex items-center gap-2 text-text-primary font-medium text-sm">
                      <MessageSquare size={16} className="text-accent-primary" />
                      <h3>Base style and tone</h3>
                    </div>
                    <p className="text-xs text-text-tertiary">Set the style and tone of how the AI responds to you.</p>
                    
                    <div className="relative">
                      <select
                        value={formData.style}
                        onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                        className="w-full appearance-none bg-bg-tertiary border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors cursor-pointer"
                      >
                        {styles.map((style) => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </section>

                  {}
                  <section className="space-y-2">
                    <div className="flex items-center gap-2 text-text-primary font-medium text-sm">
                      <Info size={16} className="text-accent-primary" />
                      <h3>Custom instructions</h3>
                    </div>
                    <textarea
                      value={formData.customInstructions}
                      onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                      placeholder="Additional behavior, style, and tone instructions..."
                      className="w-full h-32 bg-bg-tertiary border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary transition-colors resize-none"
                    />
                  </section>
                </div>

                {}
                <div className="space-y-5">
                  {}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-text-primary font-medium text-sm">
                      <User size={16} className="text-accent-primary" />
                      <h3>About you</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-text-secondary">Nickname</label>
                        <input
                          type="text"
                          value={formData.nickname || ''}
                          onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                          placeholder="Call me..."
                          className="w-full bg-bg-tertiary border border-border-subtle rounded-lg p-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-text-secondary">Occupation</label>
                        <div className="relative">
                          <Briefcase size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                          <input
                            type="text"
                            value={formData.occupation || ''}
                            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                            placeholder="Job title"
                            className="w-full bg-bg-tertiary border border-border-subtle rounded-lg p-2 pl-8 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-text-secondary">More about you</label>
                      <textarea
                        value={formData.moreInfo || ''}
                        onChange={(e) => setFormData({ ...formData, moreInfo: e.target.value })}
                        placeholder="Interests, values, or preferences..."
                        className="w-full h-24 bg-bg-tertiary border border-border-subtle rounded-lg p-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary transition-colors resize-none"
                      />
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {}
        <div className="p-5 border-t border-border-subtle bg-bg-secondary shrink-0 flex justify-between items-center">
          <button
            type="button"
            onClick={() => setFormData({
              style: 'Default',
              customInstructions: '',
              nickname: '',
              occupation: '',
              moreInfo: '',
            })}
            className="px-4 py-2 text-sm font-medium text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            Reset to Default
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-text-primary hover:bg-text-secondary disabled:bg-text-tertiary text-bg-primary py-2 px-6 rounded-lg transition-colors font-medium text-sm"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import {  Menu, ChevronLeft, ChevronRight, PenBoxIcon, ArrowRight, Settings2, BarChart3 } from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useConversationStore } from '../lib/conversationStore';
import { ConversationList } from './ConversationList';
import { conversationApi } from '../lib/api';
import { PersonalizationModal } from './PersonalizationModal';
import { StatsModal } from './StatsModal';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId: activeConversationId } = useParams();
  const [isPersonalizationOpen, setIsPersonalizationOpen] = React.useState(false);
  const [isStatsOpen, setIsStatsOpen] = React.useState(false);
  
  
  const { 
    conversations, 
    setConversations, 
    deleteConversation,
    isSidebarOpen,
    setSidebarOpen
  } = useConversationStore();
  
  
  
  
  
  
  
  const isMobileOpen = isSidebarOpen;
  const setIsMobileOpen = setSidebarOpen;
  const { signOut } = useClerk();
  const { user } = useUser();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await conversationApi.list();
        setConversations(response.data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    };
    fetchConversations();

    
    if (window.innerWidth >= 1024) {
      setIsMobileOpen(true);
    } else {
      setIsMobileOpen(false);
    }
  }, [setConversations, setIsMobileOpen]);

  useEffect(() => {
    
    
    
    
    
    
    
    
  }, []); 

  const handleNewChat = () => {
    setIsMobileOpen(false);
    navigate('/chat');
  };

  const handleDelete = async (id: string) => {
    
    deleteConversation(id);
    
    
    if (activeConversationId === id) {
      navigate('/chat');
    }

    
    try {
      await conversationApi.delete(id);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      
      
    }
  };

  const handleUpdate = async (id: string, newTitle: string) => {
    
    setConversations(
      conversations.map(conv => 
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
    );

    
    try {
      await conversationApi.update(id, { title: newTitle });
    } catch (error) {
      console.error('Failed to update conversation:', error);
      
    }
  };

  return (
    <>
      {}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-bg-secondary rounded-md shadow-md"
      >
        {isMobileOpen ? null: <Menu size={20} />}
      </button>

      {}
      <button
        onClick={() => setSidebarOpen(true)}
        className={clsx(
          "hidden lg:flex fixed top-1/2 z-50 p-1 bg-bg-secondary border border-border-subtle rounded-full shadow-md hover:bg-bg-tertiary transition-all duration-300 items-center justify-center",
          isSidebarOpen ? "hidden" : "left-[-12px] hover:left-0"
        )}
        title="Open sidebar"
      >
        <div className="text-text-tertiary">
          <ChevronRight size={16} />
        </div>
      </button>

      {}
      <div 
        className={clsx(
          "fixed top-0 left-0 h-full w-64 bg-bg-secondary border-r border-border-subtle flex flex-col transition-transform duration-300 ease-in-out z-50",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >  {}
        <div className="flex items-center justify-between p-4 pb-2">
              <Link to="/chat" className="font-medium text-text-primary">
          <div className="flex items-center gap-2">
            <svg className="w-9 h-9 text-text-primary" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
              <circle cx="16" cy="10" r="2" fill="currentColor"/>
              <circle cx="11" cy="18" r="2" fill="currentColor"/>
              <circle cx="21" cy="18" r="2" fill="currentColor"/>
              <path d="M16 10 L11 18 M16 10 L21 18 M11 18 L21 18" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
            </svg>
        
             
          </div>
            </Link>

          <button onClick={() => setSidebarOpen(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
            <ChevronLeft size={20} />
          </button>
        </div>

        {}
        <div className="px-3 py-2 space-y-1">
          {}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors text-left"
          >
            <PenBoxIcon size={18} />
            <span>New chat</span>
          </button>

          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileOpen(false);
              }
              setIsPersonalizationOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors text-left"
          >
            <Settings2 size={18} />
            <span>Personalize</span>
          </button>

          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileOpen(false);
              }
              setIsStatsOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors text-left"
          >
            <BarChart3 size={18} />
            <span>Stats & Export</span>
          </button>
        </div>

        {}
        <div className="px-6 pt-4 pb-2 text-xs font-medium text-text-tertiary">
          Your chats
        </div>

        {}
        <div className="flex-1 overflow-y-auto px-3">
          <ConversationList 
            conversations={conversations} 
            activeId={activeConversationId || null}
            onClick={() => {
              
              if (window.innerWidth < 1024) {
                setIsMobileOpen(false);
              }
            }}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>

        {}
        <div className="p-3 border-t border-border-subtle mt-auto">
          <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-bg-tertiary transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              {}
              <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white font-medium shrink-0 overflow-hidden">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.firstName?.[0] || 'U'}</span>
                )}
              </div>
              
              {}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-text-primary truncate">
                  {user?.fullName || 'User'}
                </span>
                <span className="text-xs text-text-tertiary">Free</span>
              </div>
            </div>

            {}
            <button 
              onClick={() => signOut()} 
              className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
              title="Sign Out"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <PersonalizationModal 
        isOpen={isPersonalizationOpen} 
        onClose={() => setIsPersonalizationOpen(false)} 
      />

      <StatsModal 
        isOpen={isStatsOpen} 
        onClose={() => setIsStatsOpen(false)} 
      />
    </>
  );
};

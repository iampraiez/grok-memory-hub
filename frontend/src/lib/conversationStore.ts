import { create } from 'zustand';
import type { Message } from './store';

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: { content: string }[];
}

interface ConversationStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  messagesCache: Record<string, Message[]>; 
  
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  
  
  getCachedMessages: (conversationId: string) => Message[] | undefined;
  cacheMessages: (conversationId: string, messages: Message[]) => void;
  hasMore: boolean;
  loadMoreMessages: (conversationId: string, cursor: string) => Promise<void>;

  prependMessages: (messages: Message[]) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  hasMore: false,
  isSidebarOpen: true,
  messagesCache: {},
  
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  
  setConversations: (conversations) => set({ conversations }),
  
  addConversation: (conversation) => 
    set((state) => ({ 
      conversations: [conversation, ...state.conversations] 
    })),
  
  deleteConversation: (id) => 
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      messagesCache: Object.fromEntries(
        Object.entries(state.messagesCache).filter(([key]) => key !== id)
      )
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  
  setActiveConversation: (id) => set({ activeConversationId: id }),
  
  setMessages: (messages) => {
    const state = get();
    set({ messages });
    
    if (state.activeConversationId) {
      state.cacheMessages(state.activeConversationId, messages);
    }
  },
  
  addMessage: (message) => 
    set((state) => {
      const newMessages = [...state.messages, message];
      
      if (state.activeConversationId) {
        state.cacheMessages(state.activeConversationId, newMessages);
      }
      return { messages: newMessages };
    }),

  loadMoreMessages: async (_conversationId, _cursor) => {
    
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  setHasMore: (hasMore: boolean) => set({ hasMore }),
  
  prependMessages: (newMessages: Message[]) => set((state) => ({
    messages: [...newMessages, ...state.messages]
  })),
  
  clearMessages: () => set({ messages: [], hasMore: false }),
  
  getCachedMessages: (conversationId) => get().messagesCache[conversationId],
  
  cacheMessages: (conversationId, messages) =>
    set((state) => ({
      messagesCache: {
        ...state.messagesCache,
        [conversationId]: messages
      }
    })),
}));

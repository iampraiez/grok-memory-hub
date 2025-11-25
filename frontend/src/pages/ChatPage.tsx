import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import toast, { Toaster } from 'react-hot-toast';
import { ChatInput } from '../components/ChatInput';
import { MessageList } from '../components/MessageList';
import { useConversationStore } from '../lib/conversationStore';
import { streamChat, conversationApi } from '../lib/api';
import { ChatSkeleton } from '../components/ChatSkeleton';
import { FloatingNavbar } from '../components/FloatingNavbar';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  const { 
    messages, 
    conversations,
    isLoading, 
    setMessages, 
    setLoading, 
    clearMessages,
    getCachedMessages,
    cacheMessages 
  } = useConversationStore();
  
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | undefined>();
  const abortControllerRef = useRef<AbortController | null>(null);

  
  useEffect(() => {
    const loadConversation = async () => {
      
      
      if (location.state?.preventLoad) {
        
        window.history.replaceState({}, document.title);
        return;
      }

      if (!conversationId) {
        clearMessages();
        return;
      }

      
      const cached = getCachedMessages(conversationId);
      if (cached) {
        setMessages(cached);
        
        return;
      }

      
      setIsInitialLoading(true);
      try {
        const response = await conversationApi.get(conversationId);
        const loadedMessages = response.data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
        }));
        setMessages(loadedMessages);
        setNextCursor(response.data.nextCursor);
        cacheMessages(conversationId, loadedMessages);
      } catch (error) {
        console.error('Failed to load conversation:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, setMessages, clearMessages, getCachedMessages, cacheMessages, location.state]);

  
  useEffect(() => {
    if (!conversationId) {
      document.title = 'Grok Memory Hub';
      return;
    }

    const currentConvo = conversations.find(c => c.id === conversationId);
    
    if (currentConvo?.title) {
      document.title = currentConvo.title;
    } else {
      document.title = 'Grok Memory Hub';
    }
    
    
    return () => {
      document.title = 'Grok Memory Hub';
    };
  }, [conversationId, conversations]); 

  const handleLoadMore = async () => {
    if (!conversationId || !nextCursor || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      const response = await conversationApi.get(conversationId, { cursor: nextCursor });
      const newMessages = response.data.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      }));
      
      
      const { prependMessages } = useConversationStore.getState();
      prependMessages(newMessages);
      setNextCursor(response.data.nextCursor);
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setLoading(false);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!conversationId) return;

    try {
      
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;

      
      const keptMessages = messages.slice(0, messageIndex);
      setMessages(keptMessages);
      
      
      await conversationApi.deleteMessage(conversationId, messageId);

      
      
      await handleSend(newContent);
      
    } catch (error) {
      console.error('Failed to edit message:', error);
      
      
    }
  };

  const handleSend = async (content: string, attachments?: any[], deepThinking = false, webSearch = false) => {
    
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content,
      attachments, 
      createdAt: new Date().toISOString(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);
    setIsStreaming(true);

    
    abortControllerRef.current = new AbortController();

    let assistantContent = ''; 

    try {
      
      const messageHistory = updatedMessages.map(m => ({ role: m.role, content: m.content }));

      const assistantId = crypto.randomUUID();
      
      
      const assistantMessage = {
        id: assistantId,
        role: 'assistant' as const,
        content: '',
        createdAt: new Date().toISOString(),
      };

      
      const messagesWithAssistant = [...updatedMessages, assistantMessage];
      setMessages(messagesWithAssistant);
      setStreamingMessageId(assistantId); 

      
      const token = await getToken();

      
      await streamChat(
        messageHistory, 
        conversationId, 
        abortControllerRef.current?.signal, 
        attachments, 
        token || undefined,
        (chunk) => {
          
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }

          if (chunk.content) {
            assistantContent += chunk.content;
            
            
            
            const currentMessages = useConversationStore.getState().messages;
            const updatedMsgs = [...currentMessages];
            const lastMsg = updatedMsgs[updatedMsgs.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content = assistantContent;
              setMessages(updatedMsgs);
            }
          }
          
          
          if (chunk.error) {
             toast.error(chunk.error);
             
             
             
             return;
          }

          if (chunk.conversationId && !conversationId) { 
            
            const { conversations, addConversation, updateConversation } = useConversationStore.getState();
            const exists = conversations.some(c => c.id === chunk.conversationId);
            
            if (!exists) {
              addConversation({
                id: chunk.conversationId,
                title: chunk.title || "New Chat",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              navigate(`/chat/${chunk.conversationId}`, { replace: true, state: { preventLoad: true } });
            } else if (chunk.title) {
              
              updateConversation(chunk.conversationId, { title: chunk.title });
            }
          } else if (chunk.title) {
            
            
            const targetId = conversationId || chunk.conversationId;
            if (targetId) {
              const { updateConversation } = useConversationStore.getState();
              updateConversation(targetId, { title: chunk.title });
            }
          }
        },
        deepThinking,
        webSearch
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        console.error('Chat error:', error);
        
        
        const msg = error.response?.data?.error || error.message || "Failed to send message";
        toast.error(msg);
        
        
        if (!assistantContent) {
          const errorMessage = {
            id: crypto.randomUUID(),
            role: 'assistant' as const,
            content: 'Sorry, I encountered an error. Please try again.',
            createdAt: new Date().toISOString(),
          };
          
          const currentMessages = useConversationStore.getState().messages;
          setMessages([...currentMessages, errorMessage]);
        }
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setStreamingMessageId(undefined); 
      abortControllerRef.current = null;
    }
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }} />
      <FloatingNavbar />
      <div className="flex flex-col h-full relative animate-soft-gradient pt-10">
        <div className="flex-1 flex flex-col w-full min-h-0">
        {}
      <div className="flex-1 overflow-y-auto relative">
        {isInitialLoading ? (
          <ChatSkeleton />
        ) : messages.length === 0 && !isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-3xl mx-auto px-4 text-center">
              <div className="mb-8">
                <svg className="w-16 h-16 mx-auto text-text-primary" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                  <circle cx="16" cy="10" r="2" fill="currentColor"/>
                  <circle cx="11" cy="18" r="2" fill="currentColor"/>
                  <circle cx="21" cy="18" r="2" fill="currentColor"/>
                  <path d="M16 10 L11 18 M16 10 L21 18 M11 18 L21 18" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                </svg>
              </div>
              <h1 className="text-4xl font-normal text-text-primary mb-3">
                What do you want to know?
              </h1>
            </div>
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            onLoadMore={handleLoadMore}
            hasMore={!!nextCursor}
            streamingMessageId={streamingMessageId}
            onEdit={handleEditMessage}
          />
        )}
      </div>
      </div>
      
      {}
      <div className="w-full">
        <ChatInput 
          onSend={handleSend} 
          disabled={isLoading} 
          isStreaming={isStreaming}
          onStopGenerating={handleStopGeneration}
        />
      </div>
    </div>
    </>
  );
};

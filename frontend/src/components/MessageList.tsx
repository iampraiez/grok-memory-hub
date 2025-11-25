import React, { useEffect, useRef } from 'react';
import type { Message } from '../lib/store';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  onLoadMore: () => void;
  hasMore: boolean;
  streamingMessageId?: string;
  onEdit?: (id: string, newContent: string) => void;
}

export const MessageList = ({ messages, onLoadMore, hasMore, streamingMessageId, onEdit }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true);
  const prevMessagesLengthRef = useRef(messages.length);
  
  const prevScrollHeightRef = useRef(0);
  const firstMessageIdRef = useRef(messages[0]?.id);

  
  useEffect(() => {
    if (shouldAutoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);

    
    if (scrollTop < 50 && hasMore) {
      prevScrollHeightRef.current = scrollHeight;
      onLoadMore();
    }
  };

  
  React.useLayoutEffect(() => {
    
    
    const isPrepend = messages.length > prevMessagesLengthRef.current && messages[0]?.id !== firstMessageIdRef.current;
    
    if (isPrepend && containerRef.current) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      
      if (diff > 0) {
        containerRef.current.scrollTop = diff + containerRef.current.scrollTop;
      }
    }
    
    prevMessagesLengthRef.current = messages.length;
    firstMessageIdRef.current = messages[0]?.id;
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-anchor-auto no-scrollbar"
      onScroll={handleScroll}
    >
      {hasMore && (
        <div className="py-4 text-center text-sm text-text-tertiary">
          Loading previous messages...
        </div>
      )}
      
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="space-y-2">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message}
              isStreaming={streamingMessageId === message.id}
              onEdit={onEdit}
            />
          ))}
        </div>
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

import { useState } from 'react';
import { Copy, Check, Edit2 } from 'lucide-react';
import type { Message } from '../lib/store';
import { AiMessage } from './AiMessage';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  onEdit?: (id: string, newContent: string) => void;
}

export const MessageBubble = ({ message, isStreaming = false, onEdit }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent);
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  if (message.role === 'user') {
    
    return (
      <div className="py-6 w-full group">
        <div className="flex justify-end gap-4 w-full">
          <div className="flex items-start gap-2 max-w-[70%]">
            {!isEditing && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:text-accent-primary transition-colors"
                  title="Edit message"
                >
                  <Edit2 size={16} className="text-text-tertiary" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:text-accent-primary transition-colors"
                  title={copied ? 'Copied!' : 'Copy message'}
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-text-tertiary" />}
                </button>
              </div>
            )}
            
            <div className="bg-bg-secondary px-4 py-2.5 rounded-2xl w-full">
              {isEditing ? (
                <div className="flex flex-col gap-3 min-w-[300px]">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-transparent text-text-primary p-0 focus:outline-none resize-none text-sm leading-relaxed"
                    rows={Math.max(1, Math.min(10, editContent.split('\n').length))}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveEdit();
                      }
                      if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-1.5 text-sm font-medium bg-bg-tertiary text-text-primary hover:bg-bg-primary rounded-full transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-1.5 text-sm font-medium bg-text-primary text-bg-primary hover:opacity-90 rounded-full transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-text-primary whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="py-6 group">
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              {message.content ? (
                <AiMessage content={message.content} isStreaming={isStreaming} />
              ) : (
                <div className="flex items-center h-6">
                  <img 
                    src="/favicon.svg" 
                    alt="Thinking..." 
                    className="w-5 h-5 animate-spin opacity-70"
                  />
                </div>
              )}
            </div>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-bg-tertiary transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
              title="Copy message"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-text-tertiary" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

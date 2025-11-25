import React, { useState, useRef, useEffect } from 'react';
import { X, FileText, ArrowUp, Square, Sparkles, Plus, FileUp, Globe, Brain } from 'lucide-react';

interface Attachment {
  name: string;
  type: string;
  data: string; 
  preview?: string; 
}

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[], deepThinking?: boolean, webSearch?: boolean) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  onStopGenerating?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  disabled = false,
  isStreaming = false,
  onStopGenerating
}) => {
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [isWebSearch, setIsWebSearch] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  
  useEffect(() => {
    const lastWord = message.split(/\s/).pop() || '';
    if (lastWord.startsWith('@') && '@memory'.startsWith(lastWord.toLowerCase()) && lastWord.length < 8) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [message]);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = () => {
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSend(message.trim(), attachments, isDeepThinking, isWebSearch);
      setMessage('');
      setAttachments([]);
      setShowSuggestions(false);
      
      
    }
  };

  const [showSuggestions, setShowSuggestions] = useState(false);
  
  
  const hasMemoryCommand = message.includes('@memory');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments: Attachment[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) { 
          alert(`File ${file.name} is too large (max 5MB)`);
          continue;
        }

        const reader = new FileReader();
        const promise = new Promise<Attachment>((resolve) => {
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve({
              name: file.name,
              type: file.type,
              data: result.split(',')[1],
              preview: file.type.startsWith('image/') ? result : undefined
            });
          };
        });
        reader.readAsDataURL(file);
        newAttachments.push(await promise);
      }
      
      setAttachments([...attachments, ...newAttachments]);
      setShowMenu(false); 
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showSuggestions) {
        
        applySuggestion('@memory ');
        return;
      }
      handleSubmit();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && showSuggestions) {
      e.preventDefault();
      
    } else if (e.key === 'Tab' && showSuggestions) {
      e.preventDefault();
      applySuggestion('@memory ');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    
    const cursorIndex = e.target.selectionStart;
    const textBeforeCursor = newValue.slice(0, cursorIndex);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtSymbol + 1);
      
      if (textAfterAt === '' || 'memory'.startsWith(textAfterAt.toLowerCase())) {
        setShowSuggestions(true);
        
        return;
      }
    }
    setShowSuggestions(false);
  };

  const applySuggestion = (suggestion: string) => {
    const cursorIndex = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = message.slice(0, cursorIndex);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      const newValue = message.slice(0, lastAtSymbol) + suggestion + message.slice(cursorIndex);
      setMessage(newValue);
      setShowSuggestions(false);
      
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newCursorPos = lastAtSymbol + suggestion.length;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto mb-4">
      {}
      {showSuggestions && (
        <div className="absolute bottom-full left-4 mb-2 bg-[#2a2a2a] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <button
            onClick={() => applySuggestion('@memory ')}
            className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-white/[0.06] transition-colors flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Brain size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">@memory</span>
              <span className="text-xs text-text-tertiary">Search conversation history</span>
            </div>
          </button>
        </div>
      )}

      {}
      {showMenu && (
        <div 
          ref={menuRef}
          className="absolute bottom-full left-0 mb-3 bg-[#2a2a2a] border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden min-w-[260px] z-30 animate-in fade-in zoom-in-95 duration-150 p-2"
        >
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-white/[0.06] rounded-xl transition-all duration-150 flex items-center gap-3.5 group"
          >
            <FileUp size={18} className="text-text-secondary group-hover:text-text-primary transition-colors" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">Upload File</span>
              <span className="text-xs text-text-tertiary">Add images or documents</span>
            </div>
          </button>
          
          <div className="h-px bg-white/[0.06] my-2" />

          <button 
            onClick={() => setIsWebSearch(!isWebSearch)}
            className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-white/[0.06] rounded-xl transition-all duration-150 flex items-center gap-3.5 group"
          >
            <Globe size={18} className={`${isWebSearch ? 'text-blue-400' : 'text-text-secondary group-hover:text-text-primary'} transition-colors`} />
            <div className="flex flex-col flex-1 gap-0.5">
              <span className="font-medium">Web Search</span>
              <span className="text-xs text-text-tertiary">Search the internet</span>
            </div>
            {isWebSearch && <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />}
          </button>

          <button 
            onClick={() => setIsDeepThinking(!isDeepThinking)}
            className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-white/[0.06] rounded-xl transition-all duration-150 flex items-center gap-3.5 group"
          >
            <Sparkles size={18} className={`${isDeepThinking ? 'text-accent-primary' : 'text-text-secondary group-hover:text-text-primary'} transition-colors`} />
            <div className="flex flex-col flex-1 gap-0.5">
              <span className="font-medium">Deep Thinking</span>
              <span className="text-xs text-text-tertiary">Reason before answering</span>
            </div>
            {isDeepThinking && <div className="w-2 h-2 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(var(--accent-primary-rgb),0.6)]" />}
          </button>
        </div>
      )}

      {}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto py-2 px-1">
          {attachments.map((att, index) => (
            <div key={index} className="relative group flex-shrink-0">
              {att.preview ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-border-subtle">
                  <img src={att.preview} alt={att.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-bg-secondary border border-border-subtle flex items-center justify-center">
                  <FileText size={24} className="text-text-secondary" />
                </div>
              )}
              <button
                onClick={() => removeAttachment(index)}
                className="absolute -top-1 -right-1 bg-bg-tertiary rounded-full p-0.5 shadow-md hover:bg-red-500 hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative flex items-center gap-2 bg-[#2f2f2f] rounded-[32px] shadow-[0_2px_12px_rgba(0,0,0,0.25),0_1px_3px_rgba(0,0,0,0.1)] p-1.5 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.15)] border border-[#3a3a3a]">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ${showMenu ? 'bg-white/10 text-text-primary' : 'text-text-tertiary hover:text-text-primary hover:bg-white/5'}`}
          title="Add content"
          disabled={disabled}
        >
          <Plus size={18} />
        </button>

        {}
        <div className="flex items-center gap-1.5">
          {hasMemoryCommand && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/15 border border-purple-500/30">
              <Brain size={14} className="text-purple-400" />
              <span className="text-xs font-medium text-purple-300">Memory</span>
            </div>
          )}
          {isDeepThinking && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent-primary/15 border border-accent-primary/30">
              <Sparkles size={14} className="text-accent-primary" />
              <span className="text-xs font-medium text-accent-primary">Think</span>
            </div>
          )}
          {isWebSearch && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/15 border border-blue-500/30">
              <Globe size={14} className="text-blue-400" />
              <span className="text-xs font-medium text-blue-300">Search</span>
            </div>
          )}
        </div>

        <div className="flex-1 relative min-w-0">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="w-full bg-transparent text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none py-2.5 px-1 max-h-[200px] min-h-[44px]"
            rows={1}
            disabled={disabled}
          />
        </div>

        <div className="flex-shrink-0 pr-0.5">
          {isStreaming ? (
            <button
              onClick={onStopGenerating}
              className="p-2 bg-text-primary text-bg-primary rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Stop generating"
            >
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={(!message.trim() && attachments.length === 0) || disabled}
              className="p-2 bg-text-primary text-bg-primary rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUp size={18} />
            </button>
          )}
        </div>
      </div>
      
      <div className="text-center mt-2.5">
        <p className="text-xs text-text-tertiary/70">
          AI can make mistakes. Check important info.
        </p>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />
    </div>
  );
};

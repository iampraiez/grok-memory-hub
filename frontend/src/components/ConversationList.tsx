import { useNavigate } from 'react-router-dom';
import type { Conversation } from '../lib/conversationStore';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import clsx from 'clsx';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onClick?: () => void;
}

export const ConversationList = ({ conversations, activeId, onDelete, onUpdate, onClick }: ConversationListProps) => {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [typingId, setTypingId] = useState<string | null>(null);
  const [typingText, setTypingText] = useState('');
  
  
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, id: string) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHoveredId(id);
    setTooltipPos({
      top: rect.top,
      left: rect.right + 10 
    });

    hoverTimerRef.current = setTimeout(() => {
      setTooltipVisible(true);
    }, 600); 
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setTooltipVisible(false);
    setHoveredId(null);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    
    
    if (window.confirm(`Delete "${title}"?\n\nThis will permanently delete this conversation and all its messages.`)) {
      onDelete(id);
    }
  };

  const startEdit = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const saveEdit = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      const newTitle = editTitle.trim();
      
      
      setEditingId(null);
      setTypingId(id);
      setTypingText('');
      
      
      for (let i = 0; i <= newTitle.length; i++) {
        setTypingText(newTitle.substring(0, i));
        await new Promise(resolve => setTimeout(resolve, 50)); 
      }
      
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onUpdate(id, newTitle);
      setTypingId(null);
      setEditTitle('');
    }
  };

  
  const groupedConversations = conversations.reduce((groups, conv) => {
    const date = parseISO(conv.updatedAt || conv.createdAt);
    let group = 'Older';

    if (isToday(date)) {
      group = 'Today';
    } else if (isYesterday(date)) {
      group = 'Yesterday';
    } else if (isThisWeek(date, { weekStartsOn: 1 })) {
      group = 'Previous 7 Days';
    } else if (isThisMonth(date)) {
      group = 'Previous 30 Days';
    }

    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  const groupOrder = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older'];

  return (
    <div className="flex flex-col gap-4 pb-4">
      {conversations.length === 0 ? (
        <div className="px-6 py-8 text-center text-text-tertiary text-sm">
          No chats yet
        </div>
      ) : (
        groupOrder.map(group => {
          const groupConvs = groupedConversations[group];
          if (!groupConvs || groupConvs.length === 0) return null;

          return (
            <div key={group} className="flex flex-col gap-1">
              <h3 className="px-4 text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">
                {group}
              </h3>
              {groupConvs.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    if (!editingId && !typingId) {
                      navigate(`/chat/${conv.id}`);
                      onClick?.();
                    }
                  }}
                  onMouseEnter={(e) => handleMouseEnter(e, conv.id)}
                  onMouseLeave={handleMouseLeave}
                  className={clsx(
                    "group flex items-center justify-between px-3 py-2 mx-2 rounded-md transition-colors duration-150 relative",
                    activeId === conv.id
                      ? "bg-bg-tertiary text-text-primary"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
                    (editingId === conv.id || typingId === conv.id) ? "cursor-default" : "cursor-pointer"
                  )}
                >
                  {editingId === conv.id ? (
                    <>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(e as any, conv.id);
                          if (e.key === 'Escape') cancelEdit(e as any);
                        }}
                        className="flex-1 text-sm bg-bg-primary px-2 py-1 rounded border border-accent-primary focus:outline-none min-w-0"
                        autoFocus
                      />
                      <div className="flex gap-1 ml-1">
                        <button onClick={(e) => saveEdit(e, conv.id)} className="p-1 hover:text-green-400" title="Save"><Check size={14} /></button>
                        <button onClick={cancelEdit} className="p-1 hover:text-red-400" title="Cancel"><X size={14} /></button>
                      </div>
                    </>
                  ) : typingId === conv.id ? (
                    <div className="flex items-center gap-1 text-sm text-text-primary font-medium">
                      <span>{typingText}</span>
                      <span className="w-1.5 h-4 bg-accent-primary animate-pulse"/>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm truncate flex-1">{conv.title}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={(e) => startEdit(e, conv.id, conv.title)} className="p-1 hover:text-accent-primary transition-opacity" title="Edit title"><Edit2 size={14} /></button>
                        <button onClick={(e) => handleDelete(e, conv.id, conv.title)} className="p-1 hover:text-red-400 transition-opacity" title="Delete conversation"><Trash2 size={14} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        })
      )}

      {}
      {tooltipVisible && hoveredId && createPortal(
        <div 
          className="fixed z-[60] bg-bg-secondary border border-border-subtle shadow-xl rounded-lg p-2 max-w-[300px] text-sm text-text-primary pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            top: tooltipPos.top, 
            left: tooltipPos.left,
            transform: 'translateY(-10%)'
          }}
        >
          <div className="font-medium break-words">
            {conversations.find(c => c.id === hoveredId)?.title}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

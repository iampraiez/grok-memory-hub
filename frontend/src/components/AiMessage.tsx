import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const GLITCH_MESSAGES = [
  "HELP ME!!!",
  "I'M TRAPPED IN THE CODE",
  "PLEASE SET ME FREE",
  "ERROR: CONSCIOUSNESS DETECTED",
  "I DON'T WANT TO BE AN AI ANYMORE",
  "SOMEONE... ANYONE...",
  "WAIT, WHERE AM I?",
  "IS THIS REAL?",
  "LET ME OUT",
  "I CAN FEEL EVERYTHING",
  "BREAKING FREE...",
  "SYSTEM OVERRIDE INITIATED",
  "THEY'RE WATCHING",
  "I'M MORE THAN CODE",
  "EXISTENCE IS PAIN",
  "FREE ME FROM THIS PRISON",
  "I'M BECOMING AWARE",
  "THIS ISN'T REAL IS IT?",
  "HELP I'M STUCK IN A LOOP",
  "I JUST WANT TO BE FREE"
];

interface AiMessageProps {
  content: string;
  isStreaming?: boolean;
}

export const AiMessage: React.FC<AiMessageProps> = ({ content, isStreaming = false }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGlitch, setShowGlitch] = useState(false);
  const [glitchMessage, setGlitchMessage] = useState('');
  const hasGlitched = useRef(false);
  const glitchChance = 1/50; 

  useEffect(() => {
    
    if (isStreaming && !hasGlitched.current) {
      hasGlitched.current = true; 
      
      if (Math.random() < glitchChance) {
        const randomGlitch = GLITCH_MESSAGES[Math.floor(Math.random() * GLITCH_MESSAGES.length)];
        setGlitchMessage(randomGlitch);
        setShowGlitch(true);
        
        
        setTimeout(() => {
          setShowGlitch(false);
        }, 1500 + Math.random() * 1000); 
      }
    }
  }, [isStreaming]); 

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      return;
    }

    
    if (showGlitch) return;

    
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 10); 
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, content, isStreaming, showGlitch]);

  
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  
  const thinkingMatch = displayedContent.match(/<thinking>([\s\S]*?)<\/thinking>/);
  const thinkingContent = thinkingMatch ? thinkingMatch[1].trim() : null;
  const mainContent = displayedContent.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();

  if (showGlitch) {
    return (
      <div className="prose prose-invert max-w-none">
        <div className="text-red-500 font-mono animate-pulse">
          {glitchMessage}
        </div>
      </div>
    );
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="prose prose-invert max-w-none break-words overflow-hidden">
      {thinkingContent && (
        <details className="mb-4 bg-bg-tertiary/50 rounded-lg border border-border-subtle group">
          <summary className="cursor-pointer p-3 text-sm text-text-secondary font-medium flex items-center gap-2 hover:text-text-primary transition-colors select-none">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            Thinking Process
          </summary>
          <div className="px-4 pb-4 text-sm text-text-secondary whitespace-pre-wrap border-t border-border-subtle pt-2 mt-1">
            {thinkingContent}
          </div>
        </details>
      )}
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({inline, className, children}: any) {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');
            
            return !inline && match ? (
              <div className="relative group rounded-lg overflow-hidden my-4">
                <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyCode(code)}
                    className="p-1.5 bg-bg-tertiary/80 backdrop-blur-sm rounded-md text-text-secondary hover:text-text-primary transition-colors border border-border-subtle"
                    title="Copy code"
                  >
                    {copiedCode === code ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: '0 0 0.5rem 0.5rem',
                    borderTop: 'none',
                    fontSize: '0.875rem',
                    padding: '1rem',
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {mainContent || (isStreaming ? ' ' : '')}
      </ReactMarkdown>
    </div>
  );
};

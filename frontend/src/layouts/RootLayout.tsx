import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Sidebar } from '../components/Sidebar';
import { setupInterceptors } from '../lib/api';

import { useConversationStore } from '../lib/conversationStore';

export const RootLayout: React.FC = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const { isSidebarOpen } = useConversationStore();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    setupInterceptors(getToken);
  }, [getToken]);

  useEffect(() => {
    
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded || isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-primary">
        <svg className="w-16 h-16 animate-spin text-text-primary" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
          <circle cx="16" cy="10" r="2" fill="currentColor"/>
          <circle cx="11" cy="18" r="2" fill="currentColor"/>
          <circle cx="21" cy="18" r="2" fill="currentColor"/>
          <path d="M16 10 L11 18 M16 10 L21 18 M11 18 L21 18" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden relative">
      <Sidebar />
      <main 
        className={`flex-1 flex flex-col bg-bg-primary relative overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-[260px]' : ''
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

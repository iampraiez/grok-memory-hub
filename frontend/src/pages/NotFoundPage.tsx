import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-bg-primary">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text-secondary mb-4">Page Not Found</h2>
        <p className="text-text-tertiary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-primary text-bg-primary rounded-md hover:opacity-90 transition-opacity"
        >
          <Home size={20} />
          <span>Go Home</span>
        </Link>
      </div>
    </div>
  );
};

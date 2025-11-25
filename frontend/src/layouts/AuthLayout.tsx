import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-bg-primary">
      <Outlet />
    </div>
  );
};

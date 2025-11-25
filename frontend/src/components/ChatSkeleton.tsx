import React from 'react';

export const ChatSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-4 animate-pulse">
      {}
      <div className="h-12 w-32 bg-bg-secondary/50 rounded-lg mb-8 mt-4 mx-auto" />

      <div className="flex-1 space-y-6 overflow-hidden">
        {}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-tr-sm p-4 bg-bg-secondary/30">
            <div className="h-4 w-48 bg-bg-tertiary/50 rounded mb-2" />
            <div className="h-4 w-32 bg-bg-tertiary/50 rounded" />
          </div>
        </div>

        {}
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl rounded-tl-sm p-4 bg-bg-secondary/30 w-full">
            <div className="h-4 w-full bg-bg-tertiary/50 rounded mb-2" />
            <div className="h-4 w-[90%] bg-bg-tertiary/50 rounded mb-2" />
            <div className="h-4 w-[95%] bg-bg-tertiary/50 rounded mb-4" />
            
            {}
            <div className="space-y-2 ml-4">
              <div className="h-3 w-[80%] bg-bg-tertiary/50 rounded" />
              <div className="h-3 w-[75%] bg-bg-tertiary/50 rounded" />
              <div className="h-3 w-[60%] bg-bg-tertiary/50 rounded" />
            </div>
          </div>
        </div>

        {}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-tr-sm p-4 bg-bg-secondary/30">
            <div className="h-4 w-64 bg-bg-tertiary/50 rounded" />
          </div>
        </div>

        {}
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl rounded-tl-sm p-4 bg-bg-secondary/30 w-[85%]">
            <div className="h-4 w-full bg-bg-tertiary/50 rounded mb-2" />
            <div className="h-4 w-[40%] bg-bg-tertiary/50 rounded" />
          </div>
        </div>
      </div>

      {}
      <div className="w-full py-6">
        <div className="h-[52px] w-full bg-bg-secondary/50 rounded-3xl" />
      </div>
    </div>
  );
};


import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
      <p className="text-lg font-medium text-slate-700">AI is generating your estimate...</p>
    </div>
  );
};

export default LoadingSpinner;

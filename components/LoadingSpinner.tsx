// components/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-red-600 animate-spin" />
      <span className="ml-3 text-sm text-gray-600">Loading…</span>
    </div>
  );
};

export default LoadingSpinner;



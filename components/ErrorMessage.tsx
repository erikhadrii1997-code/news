// components/ErrorMessage.tsx
import React, { useState } from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center justify-center py-16">
      <div className="max-w-xl w-full mx-4 border border-red-200 bg-red-50 text-red-800 rounded-lg p-6">
        <div className="flex items-start">
          <div className="mt-1 mr-3">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19h14.14c1.2 0 1.96-1.3 1.36-2.34L13.36 5.66a1.5 1.5 0 00-2.72 0L3.57 16.66C2.97 17.7 3.73 19 4.93 19z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-1">Something went wrong</h3>
            <p className="text-sm mb-4">
              {message || 'We could not load the latest news. Please try again.'}
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className={`px-4 py-2 rounded-md text-white text-sm font-semibold ${
                  isRetrying ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isRetrying ? 'Retrying…' : 'Retry'}
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-4 py-2 rounded-md text-sm font-semibold text-red-700 border border-red-200 hover:bg-red-100"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;


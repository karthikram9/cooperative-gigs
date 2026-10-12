import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-2xl border border-rose-200 my-4">
      <div className="p-3 rounded-xl bg-rose-100 text-rose-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-rose-900 mb-1">{title}</h4>
      <p className="text-sm text-rose-700 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-rose-300 text-sm font-medium text-rose-800 hover:bg-rose-100 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

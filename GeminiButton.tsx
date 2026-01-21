
import React from 'react';
import { SparkleIcon } from '../constants';
import LoadingSpinner from './LoadingSpinner';

interface GeminiButtonProps {
  onClick: () => void;
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

const GeminiButton: React.FC<GeminiButtonProps> = ({ onClick, isLoading, children, className }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-amber-500 rounded-md shadow-sm hover:from-rose-700 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden group ${className}`}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <SparkleIcon className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-125" />
          {children}
        </>
      )}
    </button>
  );
};

export default GeminiButton;

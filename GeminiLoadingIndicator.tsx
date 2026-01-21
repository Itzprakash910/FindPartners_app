
import React from 'react';
import { SparkleIcon } from '../constants';

const GeminiLoadingIndicator = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative w-16 h-16">
        <SparkleIcon className="w-16 h-16 text-amber-500 animate-spin-slow" />
        <SparkleIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-rose-500 animate-pulse-fast" />
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{message}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Please wait a moment...</p>
    </div>
  );
};

export default GeminiLoadingIndicator;
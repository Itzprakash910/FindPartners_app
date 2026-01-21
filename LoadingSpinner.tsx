
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-800 dark:border-rose-400"></div>
    </div>
  );
};

export default LoadingSpinner;

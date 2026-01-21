
import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const StatusIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Show status indicator only when status changes from the initial state
    setShowStatus(true);
    if (isOnline) {
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showStatus && isOnline) {
    return null;
  }
  
  const baseClasses = "fixed top-0 left-0 right-0 py-3 px-4 text-center text-sm font-semibold z-[100] transition-all duration-500";
  const onlineClasses = "bg-green-600 text-white animate-slide-down-then-up";
  const offlineClasses = "bg-gray-700 text-white animate-slide-down";

  return (
    <div className={`${baseClasses} ${isOnline ? onlineClasses : offlineClasses}`}>
      {isOnline ? (
        <div className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          You are back online!
        </div>
      ) : (
        <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L5.636 18.364" />
            </svg>
            You are currently offline. Check your connection.
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;

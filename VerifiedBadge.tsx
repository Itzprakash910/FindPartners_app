
import React from 'react';

const VerifiedBadge = ({ className }: { className?: string }) => {
  return (
    <div className="relative group">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`w-5 h-5 text-blue-500 transition-transform duration-300 group-hover:scale-110 ${className}`}
        aria-label="Verified Profile"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Identity Verified
      </div>
    </div>
  );
};

export default VerifiedBadge;

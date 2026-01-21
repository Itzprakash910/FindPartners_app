import React from 'react';
import { APP_TITLE } from '../constants';

const IndianFlagIcon = () => (
    <svg className="w-5 h-auto ml-1.5 rounded-sm shadow-sm" viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg">
        <rect fill="#FF9933" width="9" height="6"/>
        <rect fill="#FFFFFF" width="9" height="4"/>
        <rect fill="#138808" width="9" height="2"/>
        <circle fill="#000080" cx="4.5" cy="3" r="0.9"/>
        <circle fill="#FFFFFF" cx="4.5" cy="3" r="0.7"/>
    </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700/50 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
        <div className="flex justify-center items-center mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
            Crafted with 
            <span className="text-red-500 mx-1.5 text-lg" style={{ animation: 'pulse-heart 2.5s infinite ease-in-out' }}>❤️</span> 
            in India
          </p>
          <IndianFlagIcon />
        </div>
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} {APP_TITLE}. All Rights Reserved.
        </p>
      </div>
      <style>{`
        @keyframes pulse-heart {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
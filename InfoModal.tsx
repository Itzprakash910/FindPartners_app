
import React from 'react';
import { APP_TITLE } from '../constants';
import { AppRating } from '../types';

interface InfoModalProps {
  onClose: () => void;
  onRateAppClick: () => void;
  ratings: AppRating[];
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose, onRateAppClick, ratings }) => {
  const IndianFlagIcon = () => (
    <svg className="w-6 h-auto ml-2 rounded-sm shadow-sm inline-block" viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg">
        <rect fill="#FF9933" width="9" height="6"/>
        <rect fill="#FFFFFF" width="9" height="4"/>
        <rect fill="#138808" width="9" height="2"/>
        <circle fill="#000080" cx="4.5" cy="3" r="0.9"/>
        <circle fill="#FFFFFF" cx="4.5" cy="3" r="0.7"/>
    </svg>
  );

  const averageRating = ratings.length > 0 
    ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1) 
    : "New";

  const StarIcon = () => (
      <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full relative overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Decorative Header Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
            
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-white z-10 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="p-8 text-center">
                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-rose-600 dark:text-rose-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{APP_TITLE}</h2>
                
                <div className="flex justify-center items-center gap-2 mb-6 bg-amber-50 dark:bg-amber-900/20 py-2 px-4 rounded-full mx-auto w-max border border-amber-100 dark:border-amber-800">
                    <span className="font-bold text-lg text-gray-800 dark:text-gray-100">{averageRating}</span>
                    <StarIcon />
                    <span className="text-sm text-gray-500 dark:text-gray-400">({ratings.length} reviews)</span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-sm">
                    Connecting hearts with trust and tradition. {APP_TITLE} uses advanced AI to help you find a partner who shares your values, lifestyle, and dreams.
                </p>
                
                <div className="flex flex-col items-center justify-center space-y-3 mb-8">
                    <div className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-full border border-gray-100 dark:border-gray-600">
                        <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">Made with pride in India</span>
                        <IndianFlagIcon />
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">v1.2.0 • Secure & Private</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <a href="mailto:support@findpartners.com" className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Contact Support
                    </a>
                    <button onClick={onRateAppClick} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors">
                        Rate App
                    </button>
                </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>© {new Date().getFullYear()} {APP_TITLE}</span>
                <div className="space-x-3">
                    <button className="hover:text-rose-600 dark:hover:text-rose-400">Privacy</button>
                    <button className="hover:text-rose-600 dark:hover:text-rose-400">Terms</button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default InfoModal;

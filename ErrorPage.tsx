
import React from 'react';

interface ErrorPageProps {
  onBack?: () => void;
  onFeedback?: () => void;
  title?: string;
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ 
  onBack, 
  onFeedback,
  title = "Something went wrong.",
  message = "We're sorry for the inconvenience. Our technical team has been automatically notified of this issue."
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-rose-50 dark:bg-gray-900 font-sans p-4">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border dark:border-gray-700 animate-fade-in">
            <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">{title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                {message}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                    onClick={onBack || (() => window.location.href = '/')}
                    className="px-8 py-3 bg-rose-800 text-white font-semibold rounded-lg hover:bg-rose-900 transition-colors shadow-md flex items-center justify-center group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Go Back Home
                </button>
                <a
                    href={onFeedback ? undefined : "mailto:neelustlove@gmail.com?subject=FindPartners App Feedback"}
                    onClick={onFeedback}
                    className="inline-flex items-center justify-center px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-md cursor-pointer group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    Provide Feedback
                </a>
            </div>
        </div>
    </div>
  );
};

export default ErrorPage;

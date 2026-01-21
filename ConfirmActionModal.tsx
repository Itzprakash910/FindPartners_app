import React from 'react';

interface ConfirmActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmButtonText?: string;
    cancelButtonText?: string;
    icon?: React.ReactNode;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmButtonText = "Confirm", cancelButtonText = "Cancel", icon }) => {
    if (!isOpen) return null;

    const defaultIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full">
                <div className="p-4 sm:p-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        {icon || defaultIcon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h3>
                    <div className="mt-4 text-gray-600 dark:text-gray-300">
                        {message}
                    </div>
                </div>
                <div className="flex justify-center gap-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">
                        {cancelButtonText}
                    </button>
                    <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmActionModal;
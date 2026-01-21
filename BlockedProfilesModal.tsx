import React from 'react';
import { Profile } from '../types';

interface BlockedProfilesModalProps {
    profiles: Profile[];
    onClose: () => void;
    onUnblock: (profileId: number) => void;
}

const BlockedProfilesModal: React.FC<BlockedProfilesModalProps> = ({ profiles, onClose, onUnblock }) => {

    const handleUnblockClick = (profileId: number) => {
        onUnblock(profileId);
    };
    
    const BlockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-rose-800 dark:text-rose-400">Blocked Profiles</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
                    {profiles.length > 0 ? (
                        profiles.map(profile => (
                            <div key={profile.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center">
                                    <img src={profile.imageUrls[0]} alt={profile.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{profile.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{profile.location}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleUnblockClick(profile.id)}
                                    className="px-4 py-2 text-sm font-medium text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 rounded-md hover:bg-rose-200 dark:hover:bg-rose-900 transition-colors"
                                >
                                    Unblock
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <BlockIcon />
                            <p className="mt-4 text-gray-600 dark:text-gray-300">You haven't blocked any profiles.</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">You can block a profile from their detail page.</p>
                        </div>
                    )}
                </div>
                 <div className="flex justify-end p-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-6 py-2 bg-rose-800 text-white rounded-md hover:bg-rose-900">Close</button>
                </div>
            </div>
        </div>
    );
};

export default BlockedProfilesModal;
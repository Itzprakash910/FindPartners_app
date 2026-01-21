import React from 'react';
import { Profile } from '../types';

interface ReportedProfileInfo {
    profile: Profile;
    reason: string;
    details?: string;
    date: string;
}

interface ReportedProfilesModalProps {
    reportedProfiles: ReportedProfileInfo[];
    onClose: () => void;
}

const ReportedProfilesModal: React.FC<ReportedProfilesModalProps> = ({ reportedProfiles, onClose }) => {

    const FlagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-rose-800 dark:text-rose-400">Your Reported Profiles</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
                    {reportedProfiles.length > 0 ? (
                        reportedProfiles.filter(r => r.profile).map(({ profile, reason, details, date }, index) => (
                            <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <img src={profile.imageUrls[0]} alt={profile.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{profile.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
                                    </div>
                                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">{reason}</p>
                                    {details && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">"{details}"</p>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <FlagIcon />
                            <p className="mt-4 text-gray-600 dark:text-gray-300">You haven't reported any profiles.</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Your reports help keep the community safe.</p>
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

export default ReportedProfilesModal;
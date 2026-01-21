import React, { useMemo } from 'react';
import { Profile } from '../types';

interface UserListModalProps {
    type: 'followers' | 'following' | 'shortlisters';
    profile: Profile;
    allProfiles: Profile[];
    followMap?: Record<number, number[]>;
    shortlistMap?: Record<number, number[]>;
    onClose: () => void;
    onViewProfile: (profile: Profile) => void;
}

const UserListModal: React.FC<UserListModalProps> = ({ type, profile, allProfiles, followMap, shortlistMap, onClose, onViewProfile }) => {
    const userIds = useMemo(() => {
        if (type === 'followers' && followMap) {
            return Object.entries(followMap)
                // FIX: Added Array.isArray check to prevent crash if data is malformed.
                .filter((entry: [string, number[]]) => Array.isArray(entry[1]) && entry[1].includes(profile.id))
                .map(([followerId]) => Number(followerId));
        }
        if (type === 'following' && followMap) {
            return followMap[profile.id] || [];
        }
        if (type === 'shortlisters' && shortlistMap) {
            return Object.entries(shortlistMap)
                // FIX: Added Array.isArray check to prevent crash if data is malformed.
                .filter((entry: [string, number[]]) => Array.isArray(entry[1]) && entry[1].includes(profile.id))
                .map(([shortlisterId]) => Number(shortlisterId));
        }
        return [];
    }, [type, profile, followMap, shortlistMap]);


    const userList = allProfiles.filter(p => userIds.includes(p.id));

    const title = {
        followers: `Followers of ${profile.name}`,
        following: `${profile.name} is Following`,
        shortlisters: `Shortlisted by`
    }[type];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-rose-800 dark:text-rose-400">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                    {userList.length > 0 ? (
                        userList.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center cursor-pointer" onClick={() => onViewProfile(user)}>
                                    <img src={user.imageUrls[0]} alt={user.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200 hover:underline">{user.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="mt-4 text-gray-600 dark:text-gray-300">No users to display.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;
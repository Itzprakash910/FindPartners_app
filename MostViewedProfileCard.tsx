
import React from 'react';
import { Profile } from '../types';

interface MostViewedProfileCardProps {
  profile: Profile;
  onViewProfile: (profile: Profile) => void;
}

const MostViewedProfileCard: React.FC<MostViewedProfileCardProps> = ({ profile, onViewProfile }) => {
  return (
    <div 
      onClick={() => onViewProfile(profile)}
      className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
    >
      <img className="w-full h-40 object-cover" src={profile.imageUrls[0]} alt={profile.name} />
      <div className="p-4">
        <h4 className="font-bold text-lg text-rose-800 dark:text-rose-400 truncate">{profile.name}, {profile.age}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{profile.occupation}</p>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{profile.visitorCount || 0} views</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MostViewedProfileCard;
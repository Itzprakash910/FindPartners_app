
import React from 'react';
import { Profile } from '../types';
import VerifiedBadge from './VerifiedBadge';

interface ProfilePreviewTooltipProps {
  profile: Profile;
}

const ProfilePreviewTooltip: React.FC<ProfilePreviewTooltipProps> = ({ profile }) => {
  return (
    <div className="profile-tooltip absolute bottom-full mb-3 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-700 z-20 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100">
      <div className="flex items-center mb-2">
        <h4 className="font-bold text-rose-800 dark:text-rose-400 text-lg">{profile.name}</h4>
        {profile.isVerified && <VerifiedBadge className="ml-1.5" />}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-4">{profile.about}</p>
      <div className="border-t dark:border-gray-700 pt-2">
        <h5 className="font-semibold text-xs text-gray-500 dark:text-gray-400 mb-2">Interests</h5>
        <div className="flex flex-wrap gap-2">
          {profile.interests.slice(0, 4).map(interest => (
            <span key={interest} className="bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 text-xs font-medium px-2 py-0.5 rounded-full">{interest}</span>
          ))}
        </div>
      </div>
       <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white dark:border-t-gray-800"></div>
    </div>
  );
};

export default ProfilePreviewTooltip;

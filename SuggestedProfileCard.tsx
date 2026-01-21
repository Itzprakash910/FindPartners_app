
import React from 'react';
import { Profile } from '../types';
import { SparkleIcon } from '../constants';

interface SuggestedProfileCardProps {
  profile: Profile;
  reason: string;
  onViewProfile: (profile: Profile) => void;
}

const SuggestedProfileCard: React.FC<SuggestedProfileCardProps> = ({ profile, reason, onViewProfile }) => {
  return (
    <div 
      onClick={() => onViewProfile(profile)}
      className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
    >
      {/* FIX: Changed profile.imageUrl to profile.imageUrls[0] */}
      <img className="w-full h-40 object-cover" src={profile.imageUrls[0]} alt={profile.name} />
      <div className="p-4">
        <h4 className="font-bold text-lg text-rose-800 dark:text-rose-400 truncate">{profile.name}, {profile.age}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{profile.occupation}</p>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start">
                <SparkleIcon className="w-4 h-4 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 dark:text-gray-300 italic">"{reason}"</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestedProfileCard;

import React from 'react';

interface ProfileCounterProps {
  viewedCount: number;
  totalCount: number;
}

const ProfileCounter: React.FC<ProfileCounterProps> = ({ viewedCount, totalCount }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 text-center">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Showing <span className="font-bold text-rose-800 dark:text-rose-400">{viewedCount}</span> of <span className="font-bold text-rose-800 dark:text-rose-400">{totalCount}</span> Profiles
      </p>
    </div>
  );
};

export default ProfileCounter;

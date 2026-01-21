
import React from 'react';
import { Profile, HashtagResult } from '../types';

interface SearchResultsProps {
  results: (Profile | HashtagResult)[];
  onSelect: (item: Profile | HashtagResult) => void;
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelect, onClose }) => {
  const isProfile = (item: Profile | HashtagResult): item is Profile => {
      return (item as Profile).username !== undefined;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onClose}>
      <div 
        className="absolute top-20 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-1 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl border dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {results.length > 0 ? (
          <ul>
            {results.map((item, index) => {
                if (isProfile(item)) {
                    return (
                        <li key={item.id} onClick={() => onSelect(item)} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            <img src={item.imageUrls[0]} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                            <div className="ml-3">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">@{item.username}</p>
                            </div>
                        </li>
                    );
                } else {
                    return (
                        <li key={index} onClick={() => onSelect(item)} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg">
                                #
                            </div>
                            <div className="ml-3">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{item.tag}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.count} posts</p>
                            </div>
                        </li>
                    );
                }
            })}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No results found.
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

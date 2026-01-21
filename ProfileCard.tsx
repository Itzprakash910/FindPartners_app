
import React, { useState } from 'react';
import { Profile } from '../types';
import VerifiedBadge from './VerifiedBadge';

interface ProfileCardProps {
  profile: Profile;
  onViewProfile: (profile: Profile) => void;
  onShortlistToggle: (profileId: number) => void;
  isShortlisted: boolean;
  onSendMessage: (profile: Profile) => void;
  onShareProfile: (profile: Profile) => void;
  onReportProfile: (profile: Profile) => void;
  onFollowToggle: (profileId: number) => void;
  isFollowing: boolean;
  shortlisters: Profile[];
  isCurrentUser?: boolean;
  onEditProfile?: (profile: Profile) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onViewProfile, onShortlistToggle, isShortlisted, onSendMessage, onShareProfile, onReportProfile, onFollowToggle, isFollowing, shortlisters, isCurrentUser, onEditProfile }) => {
  const { privacySettings } = profile;
  const showAge = privacySettings?.showAge ?? true;
  const showLocation = privacySettings?.showLocation ?? true;
  const showOccupation = privacySettings?.showOccupation ?? true;
  
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [isAnimatingShortlist, setIsAnimatingShortlist] = useState(false);
  const [isAnimatingFollow, setIsAnimatingFollow] = useState(false);

  const handleShortlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimatingShortlist(true);
    onShortlistToggle(profile.id);
    setTimeout(() => setIsAnimatingShortlist(false), 400);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimatingFollow(true);
    onFollowToggle(profile.id);
    setTimeout(() => setIsAnimatingFollow(false), 300);
  };
  
  const displayShortlisters = shortlisters.slice(0, 3);
  const shortlisterCount = profile.shortlistedByCount || shortlisters.length;

  const HeartIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 transition-all duration-300 ease-in-out ${filled ? 'text-rose-500' : 'text-gray-600 dark:text-gray-300'} ${className}`}>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.383-.597 15.185 15.185 0 01-3.044-2.03.537.537 0 01-.028-.035l-.04-.047-.056-.067a1.001 1.001 0 01-.164-.206 1.745 1.745 0 01-.22-.258c-.196-.283-.356-.566-.467-.848a8.48 8.48 0 01-.433-1.42.526.526 0 01.035-.155.537.537 0 01.09-.168l.012-.019.019-.026.035-.041.054-.057a1.83 1.83 0 01.218-.218.891.891 0 01.21-.144c.123-.07.24-.128.352-.18.12-.054.237-.1.352-.144.113-.043.225-.08.336-.113a7.503 7.503 0 012.28-1.04c.158-.03.317-.052.477-.068a.57.57 0 01.066-.011 13.98 13.98 0 014.28 0 .57.57 0 01.066.011 7.503 7.503 0 012.757 1.22c.111.033.223.07.336.113.115.044.232.09.352.144.123.07.24.128.352.18.077.05.152.1.222.152.073.053.143.108.209.165l.054.057.035.041.019.026.012.019a.537.537 0 01.09.168.526.526 0 01.035.155 8.48 8.48 0 01-.433 1.42c-.11.282-.27.565-.467.848a1.745 1.745 0 01-.22.258 1.001 1.001 0 01-.164-.206l-.056.067-.04.047a.537.537 0 01-.028.035A15.185 15.185 0 0113.31 18.3a15.247 15.247 0 01-1.383.597l-.022.012-.007.003z" />
    </svg>
  );

  const FollowIcon = ({ isFollowing, isAnimating, className }: { isFollowing: boolean; isAnimating?: boolean; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 transition-all duration-300 ${isFollowing ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300'} ${isAnimating ? 'scale-125' : ''} ${className}`}>
        {isFollowing ? (
            <path fillRule="evenodd" d="M8 9a3 3 0 100-6 3 3 0 000 6zm-5.784 6A2.238 2.238 0 014 13.5h8a2.238 2.238 0 012.216 1.5H2.216zM20.25 12a.75.75 0 000-1.5h-2.25a.75.75 0 000 1.5h2.25zM16.5 15.75a.75.75 0 001.5 0v-2.25a.75.75 0 00-1.5 0v2.25zM18 9.75a.75.75 0 000-1.5h-2.25a.75.75 0 000 1.5h2.25z" clipRule="evenodd" />
        ) : (
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" />
        )}
    </svg>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image Section */}
      <div className="relative h-80 w-full overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-700" onClick={() => onViewProfile(profile)}>
        
        {/* Skeleton Loader / Error Placeholder */}
        {(isImageLoading || imgError) && (
            <div className={`absolute inset-0 flex items-center justify-center z-0 ${!imgError ? 'shimmer-bg' : 'bg-gray-200 dark:bg-gray-600'}`}>
                <svg className={`w-24 h-24 text-gray-300 dark:text-gray-500 ${!imgError ? 'animate-pulse opacity-60' : 'opacity-100'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </div>
        )}

        {/* Actual Image */}
        {!imgError && (
            <img 
                src={profile.imageUrls[0]} 
                alt={profile.name} 
                loading="lazy"
                className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 relative z-10 ${isImageLoading ? 'opacity-0 blur-md scale-110' : 'opacity-100 blur-0 scale-100'}`}
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                    setIsImageLoading(false);
                    setImgError(true);
                }}
            />
        )}
        
        {/* Subtle Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-20 transition-opacity duration-500 ${isImageLoading || imgError ? 'opacity-0' : 'opacity-60'}`}></div>

        {/* Floating Actions (Top Right) */}
        {!isCurrentUser && (
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0 z-30">
                <button 
                    onClick={handleShortlistClick} 
                    className="p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    title={isShortlisted ? "Remove from Shortlist" : "Shortlist"}
                >
                    <HeartIcon filled={isShortlisted} className={isAnimatingShortlist ? 'animate-pop-in' : ''} />
                </button>
                <button 
                    onClick={handleFollowClick}
                    className="p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    title={isFollowing ? "Unfollow" : "Follow"}
                >
                    <FollowIcon isFollowing={isFollowing} isAnimating={isAnimatingFollow} />
                </button>
            </div>
        )}

        {/* Shortlisted Count (Bottom Left on Image) */}
        {shortlisterCount > 0 && (
            <div className={`absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 z-30 transition-opacity duration-500 ${(isImageLoading || imgError) ? 'opacity-0' : 'opacity-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-rose-400">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.383-.597 15.185 15.185 0 01-3.044-2.03.537.537 0 01-.028-.035l-.04-.047-.056-.067a1.001 1.001 0 01-.164-.206 1.745 1.745 0 01-.22-.258c-.196-.283-.356-.566-.467-.848a8.48 8.48 0 01-.433-1.42.526.526 0 01.035-.155.537.537 0 01.09-.168l.012-.019.019-.026.035-.041.054-.057a1.83 1.83 0 01.218-.218.891.891 0 01.21-.144c.123-.07.24-.128.352-.18.12-.054.237-.1.352-.144.113-.043.225-.08.336-.113a7.503 7.503 0 012.28-1.04c.158-.03.317-.052.477-.068a.57.57 0 01.066-.011 13.98 13.98 0 014.28 0 .57.57 0 01.066.011 7.503 7.503 0 012.757 1.22c.111.033.223.07.336.113.115.044.232.09.352.144.123.07.24.128.352.18.077.05.152.1.222.152.073.053.143.108.209.165l.054.057.035.041.019.026.012.019a.537.537 0 01.09.168.526.526 0 01.035.155 8.48 8.48 0 01-.433 1.42c-.11.282-.27.565-.467.848a1.745 1.745 0 01-.22.258 1.001 1.001 0 01-.164-.206l-.056.067-.04.047a.537.537 0 01-.028.035A15.185 15.185 0 0113.31 18.3a15.247 15.247 0 01-1.383.597l-.022.012-.007.003z" />
                </svg>
                <span className="text-xs font-semibold text-white">{shortlisterCount}</span>
            </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start">
            <div className="w-full">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white truncate cursor-pointer hover:text-violet-700 dark:hover:text-violet-400 transition-colors" onClick={() => onViewProfile(profile)}>
                        {profile.name}
                    </h3>
                    {profile.isVerified && <VerifiedBadge />}
                </div>
                
                <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 gap-2 mb-3">
                    <span className="font-medium">{showAge ? `${profile.age} yrs` : 'Age Hidden'}</span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    <span>{profile.height}</span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    <span className="truncate max-w-[120px]">{profile.religion}</span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    <span className="truncate max-w-[120px]">{profile.motherTongue}</span>
                </div>

                {showLocation && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 flex-shrink-0 text-violet-500">
                            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{profile.location}</span>
                    </div>
                )}

                {showOccupation && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 flex-shrink-0 text-amber-500">
                            <path fillRule="evenodd" d="M6 3.75A.75.75 0 016.75 3h6.5a.75.75 0 01.75.75v.944h1.478a2.25 2.25 0 011.958 1.109l.854 1.424A3.25 3.25 0 0117 11.728V15.75a2.25 2.25 0 01-2.25 2.25h-9.5A2.25 2.25 0 013 15.75v-4.022a3.25 3.25 0 01-1.29-2.495l.854-1.424a2.25 2.25 0 011.958-1.109H6V3.75zm1.5 2.25v-.75a2.25 2.25 0 012.25-2.25h.5a2.25 2.25 0 012.25 2.25v.75H7.5zM6 11.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm4.5-.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{profile.occupation}</span>
                    </div>
                )}
            </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
            {/* Shortlisted By Avatars - simplified */}
            <div className="flex -space-x-2 overflow-hidden py-1">
                {displayShortlisters.map((s) => (
                    <img
                        key={s.id}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 object-cover"
                        src={s.imageUrls[0]}
                        alt={s.name}
                    />
                ))}
            </div>
            
            <button onClick={() => onViewProfile(profile)} className="text-violet-600 dark:text-violet-400 text-sm font-semibold hover:underline">
                View Details
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;

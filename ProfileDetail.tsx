
import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { Profile, SocialMedia, Post, Comment, Notification } from '../types';
import VerifiedBadge from './VerifiedBadge';
import ConfirmActionModal from './ConfirmActionModal';
import PostCard from './PostCard';
import ProfessionalDashboard from './ProfessionalDashboard';

interface ProfileDetailProps {
  profile: Profile;
  onClose: () => void;
  currentUser: Profile;
  onShortlistToggle: (profileId: number) => void;
  isShortlisted: boolean;
  onSendMessage: (profile: Profile) => void;
  isCurrentUserProfile?: boolean;
  onEditProfile?: (profile: Profile) => void;
  onBlockProfile?: (profileId: number) => void;
  onReportProfile: (profile: Profile) => void;
  onFollowToggle?: (profileId: number) => void;
  isFollowing?: boolean;
  followMap: Record<number, number[]>;
  onViewUserList: (type: 'followers' | 'following' | 'shortlisters', profile: Profile) => void;
  shortlistedByCount: number;
  posts: Post[];
  allProfiles: Profile[];
  onLikePost: (postId: number) => void;
  onAddComment: (postId: number, commentText: string) => void;
  onMuteUser: (authorId: number) => void;
  onUnmuteUser: (authorId: number) => void;
  mutedUserIds: number[];
  onViewProfile: (profile: Profile) => void;
  highlightPostId?: number | null;
  onLikeComment: (postId: number, commentId: number) => void;
  onReplyComment: (postId: number, commentId: number, text: string) => void;
  profileViews: Record<number, { viewerId: number; timestamp: string }[]>;
  notifications: Notification[];
}

const ProfileDetail: React.FC<ProfileDetailProps> = ({ profile, onClose, currentUser, onShortlistToggle, isShortlisted, onSendMessage, isCurrentUserProfile, onEditProfile, onBlockProfile, onReportProfile, onFollowToggle, isFollowing, followMap, onViewUserList, shortlistedByCount, posts, allProfiles, onLikePost, onAddComment, onMuteUser, onUnmuteUser, mutedUserIds, onViewProfile, highlightPostId, onLikeComment, onReplyComment, profileViews, notifications }) => {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isConfirmBlockOpen, setIsConfirmBlockOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(profile.imageUrls[0]);
  const [activeTab, setActiveTab] = useState<'about' | 'posts'>(highlightPostId ? 'posts' : 'about');
  const [showDashboard, setShowDashboard] = useState(false);
  
  const { privacySettings } = profile;
  const showAge = isCurrentUserProfile || (privacySettings?.showAge ?? true);
  const showLocation = isCurrentUserProfile || (privacySettings?.showLocation ?? true);
  const showOccupation = isCurrentUserProfile || (privacySettings?.showOccupation ?? true);
  const showFollowers = isCurrentUserProfile || (privacySettings?.showFollowers ?? true);
  const showReligion = isCurrentUserProfile || (privacySettings?.showReligion ?? true);
  const showMotherTongue = isCurrentUserProfile || (privacySettings?.showMotherTongue ?? true);
  const showEducation = isCurrentUserProfile || (privacySettings?.showEducation ?? true);
  const showHeight = isCurrentUserProfile || (privacySettings?.showHeight ?? true);
  const showLifestyle = isCurrentUserProfile || (privacySettings?.showLifestyle ?? true);
  const showSocialMedia = isCurrentUserProfile || (privacySettings?.showSocialMedia ?? true);

  const followerCount = useMemo(() => {
    return Object.values(followMap).filter((followingList: number[]) => followingList.includes(profile.id)).length;
  }, [followMap, profile.id]);

  const followingCount = useMemo(() => {
    return (followMap[profile.id] || []).length;
  }, [followMap, profile.id]);

   const userPosts = useMemo(() => {
        return posts
            .filter(p => p.authorId === profile.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [posts, profile.id]);

  useLayoutEffect(() => {
    if (highlightPostId) {
      const postElement = document.getElementById(`post-${highlightPostId}`);
      if (postElement) {
        setTimeout(() => {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          postElement.style.transition = 'background-color 0.3s ease-in-out';
          postElement.style.backgroundColor = 'rgba(251, 207, 214, 0.5)';
          setTimeout(() => {
            postElement.style.backgroundColor = '';
          }, 2000);
        }, 100);
      }
    }
  }, [highlightPostId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
            setShowMoreOptions(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleReportUser = () => {
    setShowMoreOptions(false);
    onReportProfile(profile);
  };

  const handleBlockProfileClick = () => {
    setShowMoreOptions(false);
    setIsConfirmBlockOpen(true);
  };

  const handleConfirmBlock = () => {
    setIsConfirmBlockOpen(false);
    if (onBlockProfile) {
        onBlockProfile(profile.id);
    }
    onClose();
  };

  const handleShareProfile = async () => {
    const shareUrl = `${window.location.origin}/profile/${profile.id}`;
    const shareData = {
        title: `Check out ${profile.name}'s profile on FindPartners`,
        text: `I found this amazing profile for ${profile.name} on FindPartners!`,
        url: shareUrl,
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(shareData.url);
            setToastMessage('Profile link copied to clipboard!');
            setTimeout(() => setToastMessage(null), 3000);
        }
    } catch (err) {
        const error = err as Error;
        if (error.name !== 'AbortError') {
            console.error("Error sharing profile:", error);
            setToastMessage('Could not share profile at this time.');
            setTimeout(() => setToastMessage(null), 3000);
        }
    }
  };
  
  const socialIconMap: Record<SocialMedia['platform'], React.ReactNode> = {
    Instagram: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.441c-3.171 0-3.535.012-4.762.069-2.825.129-3.922 1.229-4.05 4.05-.057 1.227-.069 1.592-.069 4.762s.012 3.535.069 4.762c.129 2.825 1.229 3.922 4.05 4.05 1.227.057 1.592.069 4.762.069s3.535-.012 4.762-.069c2.825-.129 3.922-1.229 4.05-4.05.057-1.227.069-1.592.069-4.762-.069zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm0 1.441a2.31 2.31 0 110 4.62 2.31 2.31 0 010-4.62zM18.803 6.11a1.425 1.425 0 10-2.85 0 1.425 1.425 0 002.85 0z"/></svg>,
    Twitter: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    Facebook: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>,
    LinkedIn: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11-4.125 0 2.062 2.062 0 014.125 0zM7.142 20.452H3.555V9h3.587v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>,
  };

  const DetailItem = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
      <div className="py-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-md text-gray-800 dark:text-gray-200">{value}</p>
      </div>
  );
  
  const StatDisplay = ({ count, label, onClick }: { count: number, label: string, onClick?: () => void }) => (
    <button 
        onClick={onClick} 
        disabled={!onClick} 
        className="text-center p-3 rounded-lg transition-colors duration-200 hover:bg-rose-50 dark:hover:bg-gray-700/50 disabled:cursor-default disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
    >
      <p className="text-2xl font-bold text-rose-800 dark:text-rose-400">{count}</p>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
    </button>
  );

  const tabButtonClasses = (tabName: 'about' | 'posts') => `
        px-1 py-4 border-b-2 font-medium text-sm transition-colors duration-200
        ${activeTab === tabName
            ? 'border-rose-500 text-rose-600 dark:text-rose-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'
        }
    `;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-2xl font-bold text-rose-800 dark:text-rose-400 flex items-center">
              {profile.name}'s Profile
              {profile.isVerified && <VerifiedBadge className="ml-3" />}
            </h2>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-2 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="overflow-y-auto custom-scrollbar p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-4">
                <img src={selectedImage} alt={profile.name} className="w-full aspect-[3/4] rounded-lg object-cover shadow-lg" />
                 {profile.imageUrls.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                        {profile.imageUrls.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`${profile.name} gallery image ${index + 1}`}
                                className={`w-full aspect-square object-cover rounded-md cursor-pointer border-2 transition-all ${selectedImage === url ? 'border-rose-500 scale-105' : 'border-transparent hover:border-gray-400'}`}
                                onClick={() => setSelectedImage(url)}
                            />
                        ))}
                    </div>
                )}
                {!isCurrentUserProfile && onFollowToggle && (
                  <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => onFollowToggle(profile.id)} className={`w-full flex items-center justify-center p-3 rounded-lg font-semibold transition-colors ${isFollowing ? 'bg-sky-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button 
                      onClick={() => onSendMessage(profile)} 
                      className="w-full flex items-center justify-center bg-rose-800 text-white p-3 rounded-lg font-semibold hover:bg-rose-900 transition-colors shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message
                    </button>
                  </div>
                )}
                 {isCurrentUserProfile && onEditProfile && (
                    <>
                        <button onClick={() => onEditProfile(profile)} className="w-full bg-rose-800 text-white p-3 rounded-lg font-semibold hover:bg-rose-900 transition-colors">Edit Profile</button>
                        <button onClick={handleShareProfile} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                            Share Profile
                        </button>
                        <button 
                            onClick={() => setShowDashboard(true)} 
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-3 rounded-lg font-semibold hover:from-violet-700 hover:to-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Professional Dashboard
                        </button>
                    </>
                 )}
              </div>
              <div className="md:col-span-2">
                <div className="pb-4 border-b dark:border-gray-700">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}{showAge ? `, ${profile.age}` : ''}</h3>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">@{profile.username}</p>
                    {showFollowers && (
                        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                            <StatDisplay count={shortlistedByCount} label="Shortlists" />
                            <StatDisplay count={followerCount} label="Followers" />
                            <StatDisplay count={followingCount} label="Following" />
                        </div>
                    )}
                </div>
                
                <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('about')} className={tabButtonClasses('about')}>
                            About
                        </button>
                        <button onClick={() => setActiveTab('posts')} className={tabButtonClasses('posts')}>
                            Posts 
                            <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{userPosts.length}</span>
                        </button>
                    </nav>
                </div>
                
                {activeTab === 'about' && (
                    <div className="animate-fade-in mt-6">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-300">About Me</h4>
                            {profile.about ? (
                                <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{profile.about}</p>
                            ) : (
                                <p className="mt-2 text-gray-500 dark:text-gray-400 italic">This user has not shared their story yet.</p>
                            )}
                        </div>
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-3">Interests</h4>
                            {profile.interests && profile.interests.length > 0 && profile.interests[0] ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.interests.map(interest => (
                                        interest && <span key={interest} className="bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 text-sm font-medium px-3 py-1 rounded-full">{interest}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 italic">No interests listed yet.</p>
                            )}
                        </div>
                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                            {showLocation && <DetailItem label="Location" value={profile.location} />}
                            {showOccupation && <DetailItem label="Occupation" value={profile.occupation} />}
                            {showReligion && <DetailItem label="Religion" value={profile.religion} />}
                            {showMotherTongue && <DetailItem label="Mother Tongue" value={profile.motherTongue} />}
                            {showEducation && <DetailItem label="Education" value={profile.education} />}
                            {showHeight && <DetailItem label="Height" value={profile.height} />}
                            {showLifestyle && <DetailItem label="Lifestyle" value={profile.lifestyle} />}
                        </div>
                        {showSocialMedia && profile.socialMedia && profile.socialMedia.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-3">Social Media</h4>
                                <div className="flex items-center space-x-4">
                                    {profile.socialMedia.map(social => (
                                        <div key={social.platform} className="relative group">
                                            <a href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${profile.name}'s ${social.platform}`} className="block text-gray-500 dark:text-gray-400 hover:text-rose-700 dark:hover:text-rose-400 transition-colors">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50">
                                                    {socialIconMap[social.platform]}
                                                </div>
                                            </a>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                Visit {social.platform} profile
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div className="mt-6 space-y-6 animate-fade-in">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    author={profile}
                                    currentUser={currentUser}
                                    allProfiles={allProfiles}
                                    onLike={onLikePost}
                                    onComment={onAddComment}
                                    onMute={onMuteUser}
                                    onUnmute={onUnmuteUser}
                                    isMuted={mutedUserIds.includes(profile.id)}
                                    onViewProfile={(p: Profile) => {
                                        if (p.id !== profile.id) {
                                            onClose();
                                            onViewProfile(p);
                                        }
                                    }}
                                    onLikeComment={onLikeComment}
                                    onReplyComment={onReplyComment}
                                    onBlock={onBlockProfile}
                                    onReport={() => onReportProfile(profile)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Posts Yet</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{profile.name} hasn't shared any posts.</p>
                            </div>
                        )}
                    </div>
                )}
              </div>
            </div>
          </div>
           {!isCurrentUserProfile && (
             <div className="flex justify-end p-4 border-t dark:border-gray-700 space-x-2">
                 <button onClick={() => onShortlistToggle(profile.id)} className="p-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-rose-800 dark:hover:text-rose-400">{isShortlisted ? 'Shortlisted' : 'Shortlist'}</button>
                 <button onClick={handleShareProfile} className="p-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-rose-800 dark:hover:text-rose-400">Share Profile</button>
                 <button onClick={handleReportUser} className="p-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30">Report</button>
                 <button onClick={handleBlockProfileClick} className="p-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30">Block</button>
            </div>
           )}
        </div>
      </div>
       {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold text-center z-[70] animate-fade-in">
          {toastMessage}
        </div>
      )}
       <ConfirmActionModal
        isOpen={isConfirmBlockOpen}
        onClose={() => setIsConfirmBlockOpen(false)}
        onConfirm={handleConfirmBlock}
        title={`Block ${profile.name}?`}
        message={<p>Are you sure you want to block this user? You will not see their profile and they will not see yours. This action can be undone from your settings.</p>}
        confirmButtonText="Yes, Block"
      />
      {showDashboard && isCurrentUserProfile && (
        <ProfessionalDashboard 
            currentUser={currentUser} 
            posts={posts} 
            allProfiles={allProfiles} 
            profileViews={profileViews[currentUser.id] || []}
            notifications={notifications}
            onClose={() => setShowDashboard(false)} 
        />
      )}
    </>
  );
};

export default ProfileDetail;

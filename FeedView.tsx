
import React, { useState, useEffect } from 'react';
import { Profile, Post, AppSettings } from '../types';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { calculateDistance } from '../utils';

interface FeedViewProps {
    currentUser: Profile;
    allProfiles: Profile[];
    posts: Post[];
    mutedUserIds: number[];
    onCreatePost: (postData: { text?: string; image?: File; audio?: Blob, audioFileName?: string, hideLikes?: boolean, hideViews?: boolean }) => void;
    onLikePost: (postId: number) => void;
    onAddComment: (postId: number, commentText: string) => void;
    onMuteUser: (authorId: number) => void;
    onUnmuteUser: (authorId: number) => void;
    onViewProfile: (profile: Profile) => void;
    onLikeComment: (postId: number, commentId: number) => void;
    onReplyComment: (postId: number, commentId: number, text: string) => void;
    onBlockUser: (authorId: number) => void;
    onReportUser: (profile: Profile) => void;
    userLocation?: { latitude: number; longitude: number } | null;
    appSettings: AppSettings;
    activeHashtag?: string | null;
    onClearHashtag?: () => void;
    onHashtagClick: (tag: string) => void;
}

const FeedView: React.FC<FeedViewProps> = ({ currentUser, allProfiles, posts, mutedUserIds, onCreatePost, onLikePost, onAddComment, onMuteUser, onUnmuteUser, onViewProfile, onLikeComment, onReplyComment, onBlockUser, onReportUser, userLocation, appSettings, activeHashtag, onClearHashtag, onHashtagClick }) => {
    const [filter, setFilter] = useState<'all' | 'nearby'>('all');

    useEffect(() => {
        // Reset local filter if a hashtag is selected from outside
        if (activeHashtag) {
            setFilter('all');
        }
    }, [activeHashtag]);

    const feedPosts = posts
        .filter(post => {
            if (mutedUserIds.includes(post.authorId)) return false;
            
            // Hashtag Filter
            if (activeHashtag) {
                return post.text && post.text.includes(activeHashtag);
            }

            if (filter === 'nearby' && userLocation) {
                const author = allProfiles.find(p => p.id === post.authorId);
                if (!author || !author.coordinates) return false;
                
                const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    author.coordinates.latitude,
                    author.coordinates.longitude
                );
                return distance <= 100; // 100km radius
            }
            
            return true;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const handleNearbyClick = () => {
        if (!appSettings.locationEnabled) {
            alert("Location is disabled in App Settings. Please enable it to see nearby posts.");
            return;
        }

        if (!userLocation) {
            alert("Location access is required to see nearby posts. Please ensure location services are enabled.");
            // Ideally trigger the location request in App.tsx again here, but for simplicity we rely on App.tsx initial load or filter sidebar
        }
        setFilter('nearby');
        if (onClearHashtag) onClearHashtag(); // Clear hashtag filter if enabling nearby
    };

    const handleAllPostsClick = () => {
        setFilter('all');
        if (onClearHashtag) onClearHashtag();
    }

    return (
        <div className="max-w-2xl mx-auto">
            <CreatePost currentUser={currentUser} onCreatePost={onCreatePost} />
            
            {activeHashtag ? (
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 p-4 rounded-lg flex justify-between items-center animate-fade-in">
                    <span className="font-semibold text-blue-800 dark:text-blue-300">
                        Showing posts for <span className="font-bold">{activeHashtag}</span>
                    </span>
                    <button onClick={onClearHashtag} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Clear Filter
                    </button>
                </div>
            ) : (
                <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button 
                        onClick={handleAllPostsClick}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-700 shadow text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        All Posts
                    </button>
                    <button 
                        onClick={handleNearbyClick}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${filter === 'nearby' ? 'bg-white dark:bg-gray-700 shadow text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Nearby
                    </button>
                </div>
            )}

            {feedPosts.length > 0 ? (
                feedPosts.map(post => {
                    const author = allProfiles.find(p => p.id === post.authorId);
                    if (!author) {
                        return null;
                    }
                    return (
                        <PostCard
                            key={post.id}
                            post={post}
                            author={author}
                            currentUser={currentUser}
                            allProfiles={allProfiles}
                            onLike={onLikePost}
                            onComment={onAddComment}
                            onMute={onMuteUser}
                            onUnmute={onUnmuteUser}
                            isMuted={mutedUserIds.includes(author.id)}
                            onViewProfile={onViewProfile}
                            onLikeComment={onLikeComment}
                            onReplyComment={onReplyComment}
                            onBlock={onBlockUser}
                            onReport={() => onReportUser(author)}
                            onHashtagClick={onHashtagClick}
                        />
                    );
                })
            ) : (
                 <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        {activeHashtag ? `No posts found for ${activeHashtag}` : (filter === 'nearby' ? 'No Posts Nearby' : 'Welcome to the Feed!')}
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {activeHashtag 
                            ? "Be the first to use this hashtag!"
                            : (filter === 'nearby' 
                                ? "We couldn't find any posts within 100km of your location." 
                                : "It's a bit quiet here. Be the first to share something!")}
                    </p>
                </div>
            )}
        </div>
    );
};

export default FeedView;

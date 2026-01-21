
import React, { useMemo } from 'react';
import { Post, Profile } from '../types';
import PostCard from './PostCard';

interface LikesHistoryViewProps {
    currentUser: Profile;
    allProfiles: Profile[];
    posts: Post[];
    onLikePost: (postId: number) => void;
    onAddComment: (postId: number, commentText: string) => void;
    onMuteUser: (authorId: number) => void;
    onUnmuteUser: (authorId: number) => void;
    onViewProfile: (profile: Profile) => void;
    onLikeComment: (postId: number, commentId: number) => void;
    onReplyComment: (postId: number, commentId: number, text: string) => void;
    onBlockUser: (authorId: number) => void;
    onReportUser: (profile: Profile) => void;
    mutedUserIds: number[];
}

const LikesHistoryView: React.FC<LikesHistoryViewProps> = ({
    currentUser,
    allProfiles,
    posts,
    onLikePost,
    onAddComment,
    onMuteUser,
    onUnmuteUser,
    onViewProfile,
    onLikeComment,
    onReplyComment,
    onBlockUser,
    onReportUser,
    mutedUserIds
}) => {
    const historyPosts = useMemo(() => {
        return posts.filter(post => {
            const liked = post.likes.includes(currentUser.id);
            // Check if user commented or replied
            const commented = post.comments.some(c => 
                c.authorId === currentUser.id || 
                (c.replies && c.replies.some(r => r.authorId === currentUser.id))
            );
            return liked || commented;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [posts, currentUser.id]);

    if (historyPosts.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No History Yet</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Posts you like, comment on, or share will appear here.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-rose-800 dark:text-rose-400 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Likes & Activity History
            </h2>
            {historyPosts.map(post => {
                const author = allProfiles.find(p => p.id === post.authorId);
                if (!author) return null;
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
                    />
                );
            })}
        </div>
    );
};

export default LikesHistoryView;

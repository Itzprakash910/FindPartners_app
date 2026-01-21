
import React, { useState, useRef, useEffect } from 'react';
import { Post, Profile, Comment } from '../types';
import { formatTimestamp } from '../utils';

interface PostCardProps {
  post: Post;
  author: Profile;
  currentUser: Profile;
  allProfiles: Profile[];
  onLike: (postId: number) => void;
  onComment: (postId: number, commentText: string) => void;
  onLikeComment: (postId: number, commentId: number) => void;
  onReplyComment: (postId: number, commentId: number, text: string) => void;
  onMute: (authorId: number) => void;
  onUnmute: (authorId: number) => void;
  onBlock?: (authorId: number) => void;
  onReport?: () => void;
  isMuted: boolean;
  onViewProfile: (profile: Profile) => void;
  onHashtagClick?: (tag: string) => void;
}

interface CommentItemProps {
    comment: Comment;
    postId: number;
    currentUser: Profile;
    allProfiles: Profile[];
    onLikeComment: (pid: number, cid: number) => void;
    onReplyComment: (pid: number, cid: number, text: string) => void;
    onViewProfile: (p: Profile) => void;
    depth?: number;
}

// Helper component for individual comments to handle nesting and state
const CommentItem: React.FC<CommentItemProps> = ({ 
    comment, 
    postId, 
    currentUser, 
    allProfiles, 
    onLikeComment, 
    onReplyComment, 
    onViewProfile,
    depth = 0
}) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const author = allProfiles.find(p => p.id === comment.authorId);
    const isLiked = comment.likes?.includes(currentUser.id);

    if (!author) return null;

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyText.trim()) {
            onReplyComment(postId, comment.id, replyText.trim());
            setReplyText('');
            setIsReplying(false);
        }
    };

    return (
        <div className={`mt-3 ${depth > 0 ? 'ml-8 pl-3 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onViewProfile(author)}>
                    <img src={author.imageUrls[0]} alt={author.name} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                </div>
                <div className="ml-3 flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700/60 rounded-2xl rounded-tl-none px-4 py-2.5 inline-block max-w-full shadow-sm">
                        <span onClick={() => onViewProfile(author)} className="font-bold text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:underline hover:text-rose-600 dark:hover:text-rose-400 block mb-0.5">
                            {author.name}
                        </span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{comment.text}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1.5 ml-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <span>{formatTimestamp(comment.timestamp)}</span>
                        <button 
                            onClick={() => onLikeComment(postId, comment.id)} 
                            className={`hover:underline transition-colors ${isLiked ? 'text-rose-600 dark:text-rose-400 font-bold' : 'hover:text-rose-600 dark:hover:text-rose-400'}`}
                        >
                            {isLiked ? 'Liked' : 'Like'}
                        </button>
                        <button onClick={() => setIsReplying(!isReplying)} className="hover:underline hover:text-gray-700 dark:hover:text-gray-300">
                            Reply
                        </button>
                        {(comment.likes?.length || 0) > 0 && (
                            <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-rose-500 text-rose-500" viewBox="0 0 20 20">
                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                </svg>
                                <span className="text-xs text-gray-700 dark:text-gray-300">{comment.likes.length}</span>
                            </div>
                        )}
                    </div>

                    {isReplying && (
                        <form onSubmit={handleReplySubmit} className="mt-3 flex items-center gap-2 animate-fade-in">
                            <img src={currentUser.imageUrls[0]} alt="You" className="w-6 h-6 rounded-full object-cover shadow-sm" />
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Reply to ${author.name.split(' ')[0]}...`}
                                className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full py-1.5 px-4 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:text-white transition-shadow shadow-sm"
                                autoFocus
                            />
                            <button type="submit" disabled={!replyText.trim()} className="text-rose-600 dark:text-rose-400 text-sm font-bold disabled:opacity-50 hover:bg-rose-50 dark:hover:bg-rose-900/30 px-3 py-1.5 rounded-full transition-colors">
                                Send
                            </button>
                        </form>
                    )}
                </div>
            </div>
            
            {/* Render Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div>
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            currentUser={currentUser}
                            allProfiles={allProfiles}
                            onLikeComment={onLikeComment}
                            onReplyComment={onReplyComment}
                            onViewProfile={onViewProfile}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const PostCard: React.FC<PostCardProps> = ({ post, author, currentUser, allProfiles, onLike, onComment, onLikeComment, onReplyComment, onMute, onUnmute, onBlock, onReport, isMuted, onViewProfile, onHashtagClick }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const optionsMenuRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const isLiked = post.likes.includes(currentUser.id);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
                setIsOptionsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onComment(post.id, newComment.trim());
            setNewComment('');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        // In a real app, you'd show a toast message here
    };

    // Helper to count total comments including nested ones for display
    const getTotalComments = (comments: Comment[]): number => {
        return comments.reduce((acc, curr) => acc + 1 + (curr.replies ? getTotalComments(curr.replies) : 0), 0);
    }

    // Function to render text with clickable hashtags
    const renderContentWithHashtags = (text: string) => {
        const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('#')) {
                return (
                    <span 
                        key={index} 
                        onClick={(e) => {
                            e.stopPropagation();
                            if(onHashtagClick) onHashtagClick(part);
                        }}
                        className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div id={`post-${post.id}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 transition-shadow hover:shadow-lg duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center cursor-pointer group" onClick={() => onViewProfile(author)}>
                    <div className="relative">
                        <img src={author.imageUrls[0]} alt={author.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-rose-500 transition-all duration-300" />
                        {author.isVerified && <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5"><svg className="w-4 h-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg></div>}
                    </div>
                    <div className="ml-3">
                        <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{author.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(post.timestamp)}</p>
                    </div>
                </div>
                {author.id !== currentUser.id && (
                    <div className="relative" ref={optionsMenuRef}>
                        <button onClick={() => setIsOptionsOpen(!isOptionsOpen)} className="text-gray-400 dark:text-gray-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </button>
                        {isOptionsOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-20 border border-gray-100 dark:border-gray-700 py-1 overflow-hidden animate-fade-in">
                                {isMuted ? (
                                    <button onClick={() => { onUnmute(author.id); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Unmute {author.name}</button>
                                ) : (
                                    <button onClick={() => { onMute(author.id); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Mute User</button>
                                )}
                                {onBlock && (
                                    <button onClick={() => { onBlock(author.id); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Block User</button>
                                )}
                                {onReport && (
                                    <button onClick={() => { onReport(); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Report Post</button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            {post.text && <p className="px-4 pb-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{renderContentWithHashtags(post.text)}</p>}
            {post.imageUrl && <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" />}
            {post.audioUrl && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30">
                    <audio ref={audioRef} src={post.audioUrl} controls className="w-full shadow-sm rounded-full"></audio>
                </div>
            )}
            
            {/* Stats */}
            <div className="flex justify-between items-center px-4 py-3 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-4">
                    {!post.hideViews && (
                     <span className="flex items-center cursor-default" title="Views">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.022 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.viewCount || 0}
                    </span>
                    )}
                    <span className="hover:underline cursor-pointer">
                        {post.hideLikes ? (
                            <span className="italic">Likes hidden</span>
                        ) : (
                            `${post.likes.length} Likes`
                        )}
                    </span>
                </div>
                <span className="hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>{getTotalComments(post.comments)} Comments</span>
            </div>

            {/* Actions */}
            <div className="flex justify-around items-center py-1">
                <button onClick={() => onLike(post.id)} className={`flex-1 flex justify-center items-center py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30 font-medium ${isLiked ? 'text-rose-600 dark:text-rose-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current transform scale-110' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Like
                </button>
                 <button onClick={() => setShowComments(!showComments)} className="flex-1 flex justify-center items-center py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30 text-gray-600 dark:text-gray-400 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Comment
                </button>
                 <button onClick={handleShare} className="flex-1 flex justify-center items-center py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30 text-gray-600 dark:text-gray-400 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                    Share
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-t border-gray-100 dark:border-gray-700/50 rounded-b-xl animate-fade-in">
                    <form onSubmit={handleCommentSubmit} className="flex items-start gap-3 mb-6">
                        <img src={currentUser.imageUrls[0]} alt="You" className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-600 shadow-sm" />
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a public comment..."
                                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl py-2 px-4 focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all dark:text-white shadow-sm"
                            />
                            <button 
                                type="submit" 
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-600 dark:text-rose-400 p-1 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                                disabled={!newComment.trim()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </div>
                    </form>
                    
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {post.comments.length > 0 ? (
                            post.comments.map(comment => (
                                <CommentItem 
                                    key={comment.id}
                                    comment={comment}
                                    postId={post.id}
                                    currentUser={currentUser}
                                    allProfiles={allProfiles}
                                    onLikeComment={onLikeComment}
                                    onReplyComment={onReplyComment}
                                    onViewProfile={onViewProfile}
                                />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4 italic">No comments yet. Be the first to share your thoughts!</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;

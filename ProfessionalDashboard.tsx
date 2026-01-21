
import React, { useMemo } from 'react';
import { Profile, Post, Notification } from '../types';
import { formatTimestamp } from '../utils';

interface ProfessionalDashboardProps {
    currentUser: Profile;
    posts: Post[];
    allProfiles: Profile[];
    profileViews: { viewerId: number; timestamp: string }[];
    notifications: Notification[];
    onClose: () => void;
}

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ currentUser, posts, allProfiles, profileViews = [], notifications = [], onClose }) => {
    
    const isToday = (isoDate: string) => {
        const date = new Date(isoDate);
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    // 1. Aggregation Logic
    const analytics = useMemo(() => {
        const myPosts = posts.filter(p => p.authorId === currentUser.id);
        
        // Today's Metrics
        const postsToday = myPosts.filter(p => isToday(p.timestamp)).length;
        
        const profileViewsToday = profileViews.filter(v => isToday(v.timestamp)).length;
        
        const commentsToday = myPosts.reduce((acc, post) => {
            const todayComments = post.comments.filter(c => isToday(c.timestamp));
            // Also count nested replies today
            const todayReplies = post.comments.reduce((rAcc, c) => rAcc + (c.replies?.filter(r => isToday(r.timestamp)).length || 0), 0);
            return acc + todayComments.length + todayReplies;
        }, 0);

        const followersToday = notifications.filter(n => 
            n.recipientId === currentUser.id && 
            n.type === 'follow' && 
            isToday(n.timestamp)
        ).length;

        // Lifetime Metrics
        const totalPostViews = myPosts.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
        const totalLikes = myPosts.reduce((acc, curr) => acc + curr.likes.length, 0);
        const totalComments = myPosts.reduce((acc, curr) => acc + curr.comments.length, 0);
        
        // Find Top Post (by views)
        const topPost = myPosts.length > 0 
            ? [...myPosts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))[0] 
            : null;

        // Find Top Liker
        const likerCounts: Record<number, number> = {};
        myPosts.forEach(post => {
            post.likes.forEach(likerId => {
                likerCounts[likerId] = (likerCounts[likerId] || 0) + 1;
            });
        });
        
        let topLikerId = null;
        let topLikerCount = 0;
        
        Object.entries(likerCounts).forEach(([id, count]) => {
            if (count > topLikerCount) {
                topLikerCount = count;
                topLikerId = parseInt(id);
            }
        });

        const topLiker = topLikerId ? allProfiles.find(p => p.id === topLikerId) : null;

        // Traffic Source Breakdown
        const profileSourceViews = currentUser.visitorCount || 0;
        const feedSourceViews = Math.max(0, totalPostViews - profileSourceViews);
        const totalReach = profileSourceViews + feedSourceViews;
        
        const profilePercentage = totalReach > 0 ? Math.round((profileSourceViews / totalReach) * 100) : 0;
        const feedPercentage = totalReach > 0 ? Math.round((feedSourceViews / totalReach) * 100) : 0;

        return {
            postsToday,
            profileViewsToday,
            commentsToday,
            followersToday,
            totalPostViews,
            totalLikes,
            totalComments,
            topPost,
            topLiker,
            topLikerCount,
            feedSourceViews,
            profileSourceViews,
            feedPercentage,
            profilePercentage
        };
    }, [currentUser, posts, allProfiles, profileViews, notifications]);

    const TodayStatCard = ({ label, value, icon, colorClass, delay }: { label: string, value: string | number, icon: React.ReactNode, colorClass: string, delay: string }) => (
        <div className={`relative overflow-hidden bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-in ${delay}`}>
            <div className={`absolute top-0 right-0 p-3 opacity-10 ${colorClass}`}>
                <div className="transform scale-150 translate-x-2 -translate-y-2">
                    {icon}
                </div>
            </div>
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
                    <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{value}</h4>
                    <span className="text-xs font-medium text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-2 inline-block">Today</span>
                </div>
                <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 text-${colorClass.split('-')[1]}-600 dark:text-${colorClass.split('-')[1]}-400`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    const StatCard = ({ label, value, icon, subtext }: { label: string, value: string | number, icon: React.ReactNode, subtext?: string }) => (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors hover:border-violet-200 dark:hover:border-violet-800">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h4>
                {subtext && <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center"><span className="mr-1">↑</span> {subtext}</p>}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-rose-600 dark:text-rose-400">
                {icon}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[80] p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border dark:border-gray-700">
                
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-rose-600 dark:from-violet-400 dark:to-rose-400 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Professional Dashboard
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Real-time insights for {currentUser.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400 group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                    
                    {/* Today's Stats Section */}
                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                            <span className="w-1.5 h-6 bg-rose-500 rounded-full mr-2"></span>
                            Today's Overview
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <TodayStatCard 
                                label="Posts" 
                                value={analytics.postsToday} 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                colorClass="text-blue-600 bg-blue-100"
                                delay="delay-0"
                            />
                            <TodayStatCard 
                                label="Profile Views" 
                                value={analytics.profileViewsToday} 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.022 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" /></svg>}
                                colorClass="text-indigo-600 bg-indigo-100"
                                delay="delay-100"
                            />
                            <TodayStatCard 
                                label="Comments" 
                                value={analytics.commentsToday} 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>}
                                colorClass="text-green-600 bg-green-100"
                                delay="delay-200"
                            />
                            <TodayStatCard 
                                label="New Followers" 
                                value={analytics.followersToday} 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
                                colorClass="text-rose-600 bg-rose-100"
                                delay="delay-300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Lifetime Stats & Top Post */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                                    <span className="w-1.5 h-6 bg-violet-500 rounded-full mr-2"></span>
                                    Lifetime Analytics
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <StatCard 
                                        label="Total Post Reach" 
                                        value={analytics.totalPostViews.toLocaleString()} 
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                                        subtext="Views"
                                    />
                                    <StatCard 
                                        label="Total Likes" 
                                        value={analytics.totalLikes.toLocaleString()} 
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                                    />
                                    <StatCard 
                                        label="All Time Interactions" 
                                        value={analytics.totalComments.toLocaleString()} 
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>}
                                        subtext="Comments"
                                    />
                                    <StatCard 
                                        label="Total Profile Visits" 
                                        value={(currentUser.visitorCount || 0).toLocaleString()} 
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                    />
                                </div>
                            </div>

                            {/* Top Post Section */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Top Performing Post</h3>
                                {analytics.topPost ? (
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {analytics.topPost.imageUrl && (
                                            <div className="w-full md:w-48 h-32 flex-shrink-0">
                                                <img src={analytics.topPost.imageUrl} alt="Top post" className="w-full h-full object-cover rounded-xl shadow-md" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-4 font-medium italic">
                                                "{analytics.topPost.text || "Media Post"}"
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                <div className="flex items-center text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.022 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" /></svg>
                                                    <span className="text-sm font-bold">{analytics.topPost.viewCount || 0} Views</span>
                                                </div>
                                                <div className="flex items-center text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                                    <span className="text-sm font-bold">{analytics.topPost.likes.length} Likes</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-3 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                Posted on {formatTimestamp(analytics.topPost.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="bg-gray-100 dark:bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">Create your first post to see analytics!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Audience & Sources */}
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Discovery Source</h3>
                                <div className="space-y-6">
                                    {/* Feed Bar */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center"><span className="w-2 h-2 rounded-full bg-violet-500 mr-2"></span>Feed & Search</span>
                                            <span className="text-gray-900 dark:text-white font-bold">{analytics.feedPercentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${analytics.feedPercentage}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Profile Bar */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>Profile Visits</span>
                                            <span className="text-gray-900 dark:text-white font-bold">{analytics.profilePercentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-gradient-to-r from-rose-500 to-orange-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${analytics.profilePercentage}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Liker Section */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
                                    Top Fan
                                    <span className="text-xs font-normal text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800">#1 Supporter</span>
                                </h3>
                                {analytics.topLiker ? (
                                    <div className="flex items-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-amber-100 dark:border-gray-600 shadow-sm">
                                        <div className="relative">
                                            <img src={analytics.topLiker.imageUrls[0]} alt={analytics.topLiker.name} className="w-14 h-14 rounded-full object-cover border-2 border-amber-300 shadow-sm" />
                                            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white p-0.5 rounded-full border-2 border-white dark:border-gray-800">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            </div>
                                        </div>
                                        <div className="ml-4 overflow-hidden">
                                            <h4 className="font-bold text-gray-800 dark:text-white text-base truncate">{analytics.topLiker.name}</h4>
                                            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">Liked {analytics.topLikerCount} of your posts</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No fans yet. Keep engaging!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5">
                        Close Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalDashboard;

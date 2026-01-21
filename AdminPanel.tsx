
import React, { useState, useMemo } from 'react';
import { Profile, ReportedProfileInfo, Post, ErrorLog, AppRating } from '../types';
import VerifiedBadge from './VerifiedBadge';
import AdminUserDetailModal from './AdminUserDetailModal';
import { formatLastSeen, formatTimestamp } from '../utils';

interface AdminPanelProps {
    profiles: Profile[];
    currentUser: Profile;
    onBack: () => void;
    reports: ReportedProfileInfo[];
    onViewUser: (profile: Profile) => void;
    onToggleVerify: (userId: number) => void;
    onSuspendUser: (userId: number) => void;
    suspendedIds: number[];
    blockMap: Record<string, number[]>;
    shortlistMap: Record<string, number[]>;
    followMap: Record<number, number[]>;
    onDeleteUser: (user: Profile) => void;
    onEditUser: (user: Profile) => void;
    onSendMessage: (userId: number, message: string) => void;
    profileViews: Record<number, { viewerId: number; timestamp: string }[]>;
    posts: Post[];
    mostViewed: Profile[];
    mostShortlisted: (Profile & { shortlistCount: number })[];
    mostReported: (Profile & { reportCount: number })[];
    errorLogs?: ErrorLog[];
    appRatings: AppRating[];
}

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center">
        <div className="bg-rose-100 dark:bg-rose-900/50 p-3 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const UserActions = ({ user, onToggleVerify, onSuspendUser, isSuspended, onViewUser, onShowDetails, onDeleteUser }: { user: Profile, isSuspended: boolean, onToggleVerify: (id: number) => void, onSuspendUser: (id: number) => void, onViewUser: (profile: Profile) => void, onShowDetails: (profile: Profile) => void, onDeleteUser: (user: Profile) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
            </button>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                        <a onClick={() => { onShowDetails(user); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">View Details</a>
                        <a onClick={() => { onViewUser(user); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">View Live Profile</a>
                        <a onClick={() => { onToggleVerify(user.id); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">{user.isVerified ? 'Unverify' : 'Verify'} User</a>
                        <a onClick={() => { onSuspendUser(user.id); setIsOpen(false); }} className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${isSuspended ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{isSuspended ? 'Unsuspend' : 'Suspend'} User</a>
                        <a onClick={() => { onDeleteUser(user); setIsOpen(false); }} className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">Delete User</a>
                    </div>
                </div>
            )}
        </div>
    );
};

interface DashboardSectionProps {
    title: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, children, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md h-full">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
        {children}
    </div>
);

const ProfileStatList = ({ profiles, metric, onViewUser, metricLabel }: { profiles: (Profile & { [key: string]: any })[], metric: string, onViewUser: (p: Profile) => void, metricLabel: string }) => (
     <ul className="space-y-2">
        {profiles.map(p => (
            <li key={p.id} onClick={() => onViewUser(p)} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <div className="flex items-center overflow-hidden">
                    <img src={p.imageUrls[0]} alt={p.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{p.name}</span>
                </div>
                <span className="text-sm font-bold text-rose-800 dark:text-rose-400 flex-shrink-0 ml-2">{p[metric] || 0} {metricLabel}</span>
            </li>
        ))}
    </ul>
);

const BreakdownList = ({ data }: { data: Record<string, number> }) => (
    <ul className="space-y-2">
        {Object.entries(data).sort(([, a], [, b]) => (b as number) - (a as number)).map(([key, value]) => (
            <li key={key} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <span className="font-medium text-gray-700 dark:text-gray-300">{key || 'Not Specified'}</span>
                <span className="font-bold text-rose-800 dark:text-rose-400">{value}</span>
            </li>
        ))}
    </ul>
);

const ErrorLogList = ({ logs, onShowUser }: { logs: ErrorLog[], onShowUser: (id: number) => void }) => (
    <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
        {logs.map(log => (
            <li key={log.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-red-800 dark:text-red-300 text-sm truncate pr-2">{log.errorName}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatTimestamp(log.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2" title={log.errorMessage}>
                    {log.errorMessage}
                </p>
                <div className="mt-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">User: </span>
                    <button 
                        onClick={() => onShowUser(log.userId)}
                        className="font-medium text-rose-700 dark:text-rose-400 hover:underline"
                    >
                        @{log.username}
                    </button>
                </div>
            </li>
        ))}
    </ul>
);

const FeedbackList = ({ ratings, onShowUser }: { ratings: AppRating[], onShowUser: (id: number) => void }) => (
    <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
        {ratings.map(rating => (
            <li key={rating.id} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1">
                        <span className="font-bold text-amber-600 dark:text-amber-400">{rating.rating}</span>
                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(rating.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">"{rating.feedback}"</p>
                <div className="text-xs">
                    <span className="text-gray-500 dark:text-gray-400">By: </span>
                    <button 
                        onClick={() => onShowUser(rating.userId)}
                        className="font-medium text-rose-700 dark:text-rose-400 hover:underline"
                    >
                        {rating.userName}
                    </button>
                </div>
            </li>
        ))}
    </ul>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ profiles, currentUser, onBack, reports, onViewUser, onToggleVerify, onSuspendUser, suspendedIds, blockMap, shortlistMap, followMap, onDeleteUser, onEditUser, onSendMessage, profileViews, posts, mostViewed, mostShortlisted, mostReported, errorLogs = [], appRatings = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [detailUser, setDetailUser] = useState<Profile | null>(null);

    const users = useMemo(() => profiles.filter(p => p.id !== currentUser.id), [profiles, currentUser.id]);

    const filteredUsers = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return users.filter(user => 
            user.name.toLowerCase().includes(lowercasedTerm) || 
            user.username.toLowerCase().includes(lowercasedTerm) ||
            user.email.toLowerCase().includes(lowercasedTerm)
        );
    }, [users, searchTerm]);
    
    const reportsCount = (userId: number) => reports.filter(r => r.profile && r.profile.id === userId).length;
    
    const totalUsers: number = users.length;
    const verifiedUsers: number = users.filter(u => u.isVerified).length;
    const totalPosts: number = posts.length;
    const verifiedPercentage: number = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;
    const avgAppRating = appRatings.length > 0 
        ? (appRatings.reduce((acc, r) => acc + r.rating, 0) / appRatings.length).toFixed(1) 
        : "N/A";
    
    const communityBreakdown = useMemo(() => {
        const religionCounts = users.reduce((acc, p) => {
            const key = p.religion || 'Not Specified';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const educationCounts = users.reduce((acc, p) => {
            const key = p.education || 'Not Specified';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { religionCounts, educationCounts };
    }, [users]);
    
    const topLikers = useMemo(() => {
        const likeCounts = posts.reduce((acc, post) => {
            post.likes.forEach(userId => {
                acc[userId] = (acc[userId] || 0) + 1;
            });
            return acc;
        }, {} as Record<number, number>);

        return Object.entries(likeCounts)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([userId, count]) => {
                const user = profiles.find(p => p.id === Number(userId));
                return user ? { ...user, likeCount: count } : null;
            }).filter(Boolean) as (Profile & { likeCount: number })[];
    }, [posts, profiles]);
    
    const handleDownloadCSV = () => {
        const headers = ['ID', 'Name', 'Username', 'Email', 'Phone', 'Age', 'Gender', 'Location', 'Joined Date', 'Verified', 'Suspended', 'Profile Views', 'Shortlisted By', 'Blocked By', 'Reports Received'];
        const rows = filteredUsers.map(user => [
            user.id,
            `"${user.name}"`,
            user.username,
            user.email,
            user.phone,
            user.age,
            user.gender,
            `"${user.location}"`,
            user.joinedDate,
            user.isVerified,
            suspendedIds.includes(user.id),
            user.visitorCount || 0,
            (shortlistMap[String(user.id)] || []).length,
            (blockMap[String(user.id)] || []).length,
            reportsCount(user.id)
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `gemini_vivah_users_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShowUserFromLog = (userId: number) => {
        const user = profiles.find(p => p.id === userId);
        if (user) {
            setDetailUser(user);
        } else {
            alert("User profile not found. The user might have been deleted.");
        }
    };

    return (
        <>
        <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg shadow-lg max-w-7xl mx-auto animate-fade-in p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-rose-800 dark:text-rose-400">Admin Dashboard</h2>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Welcome, Admin. Manage your community here.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button onClick={onBack} className="flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-rose-800 dark:hover:text-rose-400 transition-colors px-4 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to App
                    </button>
                    <button onClick={handleDownloadCSV} className="flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-rose-800 dark:hover:text-rose-400 transition-colors px-4 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                 <StatCard title="Total Users" value={totalUsers} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                 <StatCard title="Verified Users" value={`${verifiedUsers} (${verifiedPercentage}%)`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>} />
                 <StatCard title="App Rating" value={`${avgAppRating} / 5`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>} />
                 <StatCard title="Total Posts" value={totalPosts} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <DashboardSection title="Community by Religion" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>}>
                    <BreakdownList data={communityBreakdown.religionCounts} />
                </DashboardSection>
                
                <DashboardSection title="User Feedback" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>}>
                    {appRatings.length > 0 ? (
                        <FeedbackList ratings={appRatings.slice().reverse().slice(0, 10)} onShowUser={handleShowUserFromLog} />
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No feedback received yet.</p>
                    )}
                </DashboardSection>

                <DashboardSection title="Top Likers" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>}>
                    <ProfileStatList profiles={topLikers} metric="likeCount" onViewUser={onViewUser} metricLabel="likes"/>
                </DashboardSection>
                <DashboardSection title="Most Reported" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>}>
                     <ProfileStatList profiles={mostReported} metric="reportCount" onViewUser={onViewUser} metricLabel="reports"/>
                </DashboardSection>
            </div>

            <div className="mb-4">
                 <input type="text" placeholder="Search by name, username, or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 dark:text-white focus:ring-rose-500 focus:border-rose-500" />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reports</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                           {filteredUsers.map(user => {
                               const isSuspended = suspendedIds.includes(user.id);
                               const reportCount = reportsCount(user.id);
                               const { text: lastSeenText, isOnline } = formatLastSeen(user.lastSeen);
                               return (
                                <tr key={user.id} className={`transition-colors ${isSuspended ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div 
                                            className="flex items-center cursor-pointer hover:opacity-80" 
                                            onClick={() => onViewUser(user)}
                                            title="View Live Profile"
                                        >
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.imageUrls[0]} alt={user.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                                                    {user.name} {user.isVerified && <VerifiedBadge className="ml-2"/>}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isSuspended ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Suspended</span>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>{lastSeenText}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(user.joinedDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <span className={reportCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>{reportCount}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <UserActions user={user} isSuspended={isSuspended} onToggleVerify={onToggleVerify} onSuspendUser={onSuspendUser} onViewUser={onViewUser} onShowDetails={setDetailUser} onDeleteUser={onDeleteUser} />
                                    </td>
                                </tr>
                               )
                           })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        {detailUser && (
            <AdminUserDetailModal 
                user={detailUser} 
                allUsers={profiles}
                reports={reports.filter(r => r.profile && r.profile.id === detailUser.id)}
                blockMap={blockMap}
                shortlistMap={shortlistMap}
                followMap={followMap}
                profileViews={profileViews[detailUser.id] || []}
                posts={posts}
                onClose={() => setDetailUser(null)} 
                onDeleteUser={onDeleteUser}
                onEditUser={onEditUser}
                onSendMessage={onSendMessage}
            />
        )}
        </>
    );
};

export default AdminPanel;

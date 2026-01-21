
import React, { useState, useMemo } from 'react';
import { Profile, ReportedProfileInfo, SocialMedia, Post } from '../types';
import VerifiedBadge from './VerifiedBadge';
import { formatTimestamp, formatLastSeen } from '../utils';

interface AdminUserDetailModalProps {
    user: Profile;
    allUsers: Profile[];
    reports: ReportedProfileInfo[];
    blockMap: Record<string, number[]>;
    shortlistMap: Record<string, number[]>;
    followMap: Record<number, number[]>;
    profileViews: { viewerId: number; timestamp: string }[];
    posts: Post[];
    onClose: () => void;
    onDeleteUser: (user: Profile) => void;
    onEditUser: (user: Profile) => void;
    onSendMessage: (userId: number, message: string) => void;
}

interface InfoSectionProps {
    title: string;
    children: React.ReactNode;
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, children }) => (
    <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2 mb-4 flex items-center">
            <span className="bg-rose-500 w-1.5 h-6 mr-3 rounded-full"></span>
            {title}
        </h3>
        {children}
    </div>
);

const DetailItem = ({ label, value, isMono = false, rightElement, className }: { label: string, value: string | number | undefined, isMono?: boolean, rightElement?: React.ReactNode, className?: string }) => (
    <div className={`p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 ${className}`}>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-center justify-between">
            <p className={`text-sm font-bold text-gray-900 dark:text-white truncate ${isMono ? 'font-mono tracking-wide' : ''}`}>
                {value || 'N/A'}
            </p>
            {rightElement}
        </div>
    </div>
);

const UserList = ({ title, userIds, allUsers, withTimestamp }: { title: string; userIds: (number | { viewerId: number; timestamp: string })[]; allUsers: Profile[], withTimestamp?: boolean }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm h-full">
        <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex justify-between items-center">
            {title} 
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">{userIds.length}</span>
        </h4>
        {userIds.length > 0 ? (
            <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {userIds.map((item, index) => {
                    const id = typeof item === 'number' ? item : item.viewerId;
                    const timestamp = typeof item === 'number' ? null : item.timestamp;
                    const user = allUsers.find(u => u.id === id);
                    return user ? (
                        <li key={index} className="text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md transition-colors flex items-center justify-between group">
                           <div className="flex items-center overflow-hidden">
                                <img src={user.imageUrls[0]} alt="" className="w-6 h-6 rounded-full mr-2 object-cover" />
                                <span className="text-gray-700 dark:text-gray-300 truncate font-medium">{user.name}</span>
                           </div>
                           {withTimestamp && timestamp && <span className="text-xs text-gray-400 flex-shrink-0">{formatTimestamp(timestamp)}</span>}
                        </li>
                    ) : null;
                })}
            </ul>
        ) : (
            <div className="flex items-center justify-center h-20 text-gray-400 dark:text-gray-500 text-sm italic">
                No users found
            </div>
        )}
    </div>
);

const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({ user, allUsers, reports, blockMap, shortlistMap, followMap, profileViews, posts, onClose, onDeleteUser, onEditUser, onSendMessage }) => {
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    
    const userPostsCount = useMemo(() => posts.filter(p => p.authorId === user.id).length, [posts, user.id]);
    const userCommentsCount = useMemo(() => {
        return posts.reduce((count, post) => {
            return count + post.comments.filter(comment => comment.authorId === user.id).length;
        }, 0);
    }, [posts, user.id]);

    // Derived stats
    const blockedByCount = useMemo(() => {
        return Object.values(blockMap).filter((list: any) => Array.isArray(list) && list.includes(user.id)).length;
    }, [blockMap, user.id]);

    const { text: lastSeenText, isOnline } = formatLastSeen(user.lastSeen);
    
    const socialIconMap: Record<SocialMedia['platform'], React.ReactNode> = {
        Instagram: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.441c-3.171 0-3.535.012-4.762.069-2.825.129-3.922 1.229-4.05 4.05-.057 1.227-.069 1.592-.069 4.762s.012 3.535.069 4.762c.129 2.825 1.229 3.922 4.05 4.05 1.227.057 1.592.069 4.762.069s3.535-.012 4.762-.069c2.825-.129 3.922-1.229 4.05-4.05.057-1.227.069-1.592.069-4.762s-.012-3.535-.069-4.762c-.129-2.825-1.229-3.922-4.05-4.05-1.227-.057-1.592-.069-4.762-.069zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm0 1.441a2.31 2.31 0 110 4.62 2.31 2.31 0 010-4.62zM18.803 6.11a1.425 1.425 0 10-2.85 0 1.425 1.425 0 002.85 0z"/></svg>,
        Twitter: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
        Facebook: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>,
        LinkedIn: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11-4.125 0 2.062 2.062 0 014.125 0zM7.142 20.452H3.555V9h3.587v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>,
    };

    const handleResetPassword = () => {
        setToastMessage(`A password reset link has been sent to ${user.name}.`);
        setTimeout(() => setToastMessage(null), 4000);
    };
    
    const handleSendMessage = () => {
        const message = prompt(`Enter the message you want to send to ${user.name}:`);
        if (message && message.trim()) {
            onSendMessage(user.id, message.trim());
            onClose();
        }
    };
    
    const handleDeleteUser = () => {
        onDeleteUser(user);
        onClose();
    };

    const shortlisters = shortlistMap[String(user.id)] || [];
    const blockers = blockMap[String(user.id)] || [];
    const following = followMap[user.id] || [];
    const followers = Object.entries(followMap)
        .filter((entry) => (entry[1] as number[]).includes(user.id))
        .map(([followerId]) => Number(followerId));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-2xl font-bold text-rose-800 dark:text-rose-400 flex items-center">
                        User Details
                        {user.isVerified && <VerifiedBadge className="ml-3" />}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white bg-gray-200 dark:bg-gray-700 p-2 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-gray-900">
                    {/* Header Profile Section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8 p-6 bg-gradient-to-r from-rose-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-sm border border-rose-100 dark:border-gray-600">
                        <img src={user.imageUrls[0]} alt={user.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-md mb-4 sm:mb-0 sm:mr-6" />
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}, {user.age}</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">@{user.username}</p>
                            <div className="flex items-center justify-center sm:justify-start mt-2 space-x-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${isOnline ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-200'}`}>
                                    <span className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                                    {lastSeenText}
                                </span>
                                {user.isVerified && <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-bold rounded-full">Verified</span>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                             <button onClick={() => { onEditUser(user); onClose(); }} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">Edit Profile</button>
                             <button onClick={handleDeleteUser} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Delete User</button>
                        </div>
                    </div>

                    {/* Account Details - Reorganized Grid */}
                    <InfoSection title="Account & Security Details">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <DetailItem label="Username" value={`@${user.username}`} />
                            <DetailItem label="Email" value={user.email} />
                            <DetailItem label="Phone Number" value={user.phone} />
                            
                            <DetailItem 
                                label="Password" 
                                value={showPassword ? user.password : '••••••••'} 
                                isMono 
                                rightElement={
                                    <button 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                                        title={showPassword ? "Hide Password" : "Show Password"}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                        )}
                                    </button>
                                }
                            />
                            
                            <DetailItem label="Joined Date" value={new Date(user.joinedDate).toLocaleDateString()} />
                            <DetailItem label="Location" value={user.location} />
                        </div>
                    </InfoSection>

                    {/* Important Counts - Views, Reports, Blocks */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{user.visitorCount || 0}</p>
                            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider mt-1">Profile Views</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 text-center">
                            <p className="text-3xl font-extrabold text-red-600 dark:text-red-400">{reports.length}</p>
                            <p className="text-xs font-semibold text-red-800 dark:text-red-300 uppercase tracking-wider mt-1">Reports Count</p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 text-center">
                            <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">{blockedByCount}</p>
                            <p className="text-xs font-semibold text-orange-800 dark:text-orange-300 uppercase tracking-wider mt-1">Blocked By Users</p>
                        </div>
                    </div>

                    <InfoSection title="Personal Information">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                             <DetailItem label="Religion" value={user.religion} />
                             <DetailItem label="Mother Tongue" value={user.motherTongue} />
                             <DetailItem label="Education" value={user.education} />
                             <DetailItem label="Occupation" value={user.occupation} />
                             <DetailItem label="Height" value={user.height} />
                             <DetailItem label="Lifestyle" value={user.lifestyle} />
                        </div>
                    </InfoSection>

                    <InfoSection title="About & Interests">
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700 mb-4">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">About</p>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{user.about || 'No bio provided.'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Interests</p>
                            {user.interests && user.interests.length > 0 && user.interests[0] ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.interests.map(interest => (
                                        interest && <span key={interest} className="bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-500 text-xs font-medium px-3 py-1 rounded-full shadow-sm">{interest}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 italic text-sm">No interests listed.</p>
                            )}
                        </div>
                    </InfoSection>

                    <InfoSection title="Platform Activity">
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Posts Created" value={userPostsCount} />
                            <DetailItem label="Comments Made" value={userCommentsCount} />
                        </div>
                    </InfoSection>

                    <InfoSection title="User Network">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-48">
                            <UserList title="Viewed By" userIds={profileViews} allUsers={allUsers} withTimestamp />
                            <UserList title="Shortlisted By" userIds={shortlisters} allUsers={allUsers} />
                            <UserList title="Followers" userIds={followers} allUsers={allUsers} />
                        </div>
                    </InfoSection>

                    <div className="mt-8 flex justify-center space-x-4 border-t dark:border-gray-700 pt-6">
                         <button onClick={handleSendMessage} className="flex items-center px-6 py-2.5 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                            Send Message
                         </button>
                         <button onClick={handleResetPassword} className="flex items-center px-6 py-2.5 text-sm font-bold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 shadow-md transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Reset Password
                         </button>
                    </div>
                </div>
            </div>

            {toastMessage && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold text-center z-[60] animate-slide-down-then-up">
                    {toastMessage}
                </div>
             )}
        </div>
    );
};

export default AdminUserDetailModal;


import React, { useState, useMemo } from 'react';
import { Profile, Message, Notification, Post } from '../types';
import { formatTimestamp } from '../utils';

interface InboxViewProps {
    conversations: Profile[];
    messagesByProfileId: Record<number, Message[]>;
    notifications: Notification[];
    allProfiles: Profile[];
    onOpenChat: (profile: Profile) => void;
    onBack: () => void;
    onClearInbox: () => void;
    onMarkAsRead: (profileId: number) => void;
    onMarkAllAsRead: () => void;
    onMarkNotificationsAsRead: () => void;
    onViewProfile: (profile: Profile, postId?: number) => void;
    posts: Post[];
}

const InboxView: React.FC<InboxViewProps> = ({ conversations, messagesByProfileId, notifications, allProfiles, onOpenChat, onBack, onClearInbox, onMarkAsRead, onMarkAllAsRead, onMarkNotificationsAsRead, onViewProfile, posts }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
    
    const unreadMessagesCount = useMemo(() => {
        return Object.values(messagesByProfileId).flat().filter((msg: Message) => msg.sender === 'profile' && !msg.isRead).length;
    }, [messagesByProfileId]);
    
    const unreadNotificationsCount = useMemo(() => {
        return notifications.filter(n => !n.isRead).length;
    }, [notifications]);

    const conversationDetails = useMemo(() => {
        return conversations.map(profile => {
            const messages = messagesByProfileId[profile.id] || [];
            const lastMessage = messages[messages.length - 1];
            const unreadCount = messages.filter(msg => msg.sender === 'profile' && !msg.isRead).length;
            return {
                profile,
                lastMessage,
                unreadCount,
            };
        }).sort((a, b) => {
             const timeA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
             const timeB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
             return timeB - timeA;
        });
    }, [conversations, messagesByProfileId]);

    const filteredConversations = useMemo(() => {
        return conversationDetails.filter(convo => convo.profile.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [conversationDetails, searchTerm]);
    
    const filteredNotifications = useMemo(() => {
        return notifications.filter(notification => {
            const actor = allProfiles.find(p => p.id === notification.actorId);
            return actor && actor.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [notifications, allProfiles, searchTerm]);

    const getMessagePreview = (message: Message) => {
        switch (message.content.type) {
            case 'text': return message.content.text;
            case 'image': return '📷 Image';
            case 'video': return '🎥 Video';
            case 'audio': return '🎤 Audio';
            case 'location': return '📍 Location';
            default: return 'Attachment';
        }
    };

    const EnvelopeOpenIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19v-8.93a2 2 0 01.89-1.664l7.45-4.666a2 2 0 012.32 0l7.45 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M12 12.5l-6.75 4.5M12 12.5l6.75 4.5" />
        </svg>
    );
    
     const BellIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    );

    const TabButton = ({ label, value, activeTab, setTab, count }: {label: string, value: 'messages' | 'notifications', activeTab: string, setTab: (f: 'messages' | 'notifications') => void, count: number}) => {
        const isActive = activeTab === value;
        return (
            <button onClick={() => setTab(value)} className={`w-full text-center py-3 text-lg font-semibold transition-colors duration-300 relative ${isActive ? 'text-violet-700 dark:text-violet-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                <span className="flex items-center justify-center">
                    {label}
                    {count > 0 && <span className="ml-2 text-xs font-bold bg-violet-700 text-white px-2 py-0.5 rounded-full">{count}</span>}
                </span>
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-violet-700 rounded-t-full"></div>}
            </button>
        )
    };
    
    const renderMessages = () => (
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {filteredConversations.length > 0 ? (
                filteredConversations.map(({ profile, lastMessage, unreadCount }) => (
                    <div key={profile.id} className="group flex items-center p-4 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 relative">
                        <div className="flex items-center flex-1">
                            <div 
                                className="relative flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewProfile(profile);
                                }}
                                title="View Profile"
                            >
                                <img src={profile.imageUrls[0]} alt={profile.name} className="w-14 h-14 rounded-full object-cover" />
                                {unreadCount > 0 && <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-violet-500 ring-2 ring-white dark:ring-gray-800"></span>}
                            </div>
                            <div className="flex-1 ml-4 overflow-hidden cursor-pointer" onClick={() => onOpenChat(profile)}>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">{profile.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{lastMessage ? formatTimestamp(lastMessage.timestamp) : ''}</p>
                                </div>
                                <p className={`text-sm text-gray-600 dark:text-gray-400 truncate ${unreadCount > 0 ? 'font-semibold text-gray-800 dark:text-gray-200' : ''}`}>
                                    {lastMessage ? getMessagePreview(lastMessage) : 'No messages yet...'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-20">
                    <EnvelopeOpenIcon />
                    <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Your inbox is empty</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Start a conversation to see it here.</p>
                </div>
            )}
        </div>
    );
    
     const renderNotifications = () => (
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => {
                    const actor = allProfiles.find(p => p.id === notification.actorId);
                    if (!actor) return null;

                    let notificationText: React.ReactNode;
                    let IconComponent: React.ReactNode;

                    switch (notification.type) {
                        case 'follow':
                            notificationText = <><span className="font-semibold">{actor.name}</span> started following you.</>;
                            IconComponent = (
                                <div className="absolute -bottom-1 -right-1 bg-violet-500 text-white rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" /></svg>
                                </div>
                            );
                            break;
                        case 'profile_view':
                            notificationText = <><span className="font-semibold">{actor.name}</span> viewed your profile.</>;
                            IconComponent = (
                                <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            );
                            break;
                        case 'error_report':
                            notificationText = (
                                <>
                                    <span className="font-semibold">{actor.name}</span> encountered an application error.
                                    {notification.message && <p className="text-xs italic text-red-600 dark:text-red-400 mt-1">Error: "{notification.message}"</p>}
                                </>
                            );
                            IconComponent = (
                                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            );
                            break;
                        case 'like_post':
                            notificationText = <><span className="font-semibold">{actor.name}</span> liked your post.</>;
                            IconComponent = (
                                <div className="absolute -bottom-1 -right-1 bg-violet-500 text-white rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                </div>
                            );
                            break;
                        case 'comment_post':
                            notificationText = <><span className="font-semibold">{actor.name}</span> commented on your post.</>;
                            IconComponent = (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                                </div>
                            );
                            break;
                        case 'comment_like':
                            notificationText = <><span className="font-semibold">{actor.name}</span> liked your comment.</>;
                            IconComponent = (
                                <div className="absolute -bottom-1 -right-1 bg-violet-500 text-white rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                </div>
                            );
                            break;
                        case 'comment_reply':
                            notificationText = <><span className="font-semibold">{actor.name}</span> replied to your comment.</>;
                            IconComponent = (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                                </div>
                            );
                            break;
                        case 'message':
                            notificationText = <><span className="font-semibold">{actor.name}</span> sent you a message.</>;
                            IconComponent = (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                </div>
                            );
                            break;
                        case 'user_report':
                            notificationText = (
                                <>
                                    <span className="font-semibold text-red-600 dark:text-red-400">REPORT ALERT: </span>
                                    {notification.message}
                                </>
                            );
                            IconComponent = (
                                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </div>
                            );
                            break;
                        default:
                            notificationText = <span>Notification</span>;
                            IconComponent = null;
                    }

                    const handleNotificationClick = () => {
                        if (['like_post', 'comment_post', 'comment_like', 'comment_reply'].includes(notification.type) && notification.postId) {
                            const post = posts.find(p => p.id === notification.postId);
                            if (post) {
                                const postAuthor = allProfiles.find(p => p.id === post.authorId);
                                if (postAuthor) {
                                    onViewProfile(postAuthor, notification.postId);
                                    return;
                                }
                            }
                        }
                        if (notification.type === 'message') {
                            onOpenChat(actor);
                            return;
                        }
                        // Default behavior: view actor's profile
                        onViewProfile(actor);
                    };

                    return (
                        <div
                          key={notification.id}
                          onClick={handleNotificationClick}
                          className={`p-4 flex items-center transition-colors duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 ${!notification.isRead ? 'bg-violet-50 dark:bg-violet-900/20' : ''}`}
                        >
                            <div className="relative flex-shrink-0">
                                <img src={actor.imageUrls[0]} alt={actor.name} className="w-14 h-14 rounded-full object-cover" />
                                {IconComponent}
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    {notificationText}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimestamp(notification.timestamp)}</p>
                            </div>
                             {!notification.isRead && <span className="block h-2.5 w-2.5 rounded-full bg-violet-500 flex-shrink-0"></span>}
                        </div>
                    )
                })
            ) : (
                 <div className="text-center py-20">
                    <BellIcon />
                    <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">No new notifications</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">You're all caught up!</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto animate-fade-in">
            <div className="p-4 sm:p-6 border-b dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-3xl font-bold text-violet-800 dark:text-violet-400">Inbox</h2>
                    <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-800 dark:hover:text-violet-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Dashboard
                    </button>
                </div>
                <div className="mt-6 relative">
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full dark:bg-gray-700 dark:text-white focus:ring-violet-500 focus:border-violet-500" />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    </div>
                </div>
            </div>
            
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <TabButton label="Messages" value="messages" activeTab={activeTab} setTab={setActiveTab} count={unreadMessagesCount} />
                <TabButton label="Notifications" value="notifications" activeTab={activeTab} setTab={setActiveTab} count={unreadNotificationsCount} />
            </div>

            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'notifications' && renderNotifications()}

            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg border-t dark:border-gray-700 text-right">
                {activeTab === 'messages' && <button onClick={onMarkAllAsRead} className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-violet-700 dark:hover:text-violet-300">Mark all messages as read</button>}
                {activeTab === 'notifications' && unreadNotificationsCount > 0 && <button onClick={onMarkNotificationsAsRead} className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-violet-700 dark:hover:text-violet-300">Mark all notifications as read</button>}
            </div>
        </div>
    );
};

export default InboxView;

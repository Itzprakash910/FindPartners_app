
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import ProfileCard from './components/ProfileCard';
import ProfileDetail from './components/ProfileDetail';
import ChatModal from './components/ChatModal';
import EditProfileModal from './components/EditProfileModal';
import MostViewedProfiles from './components/MostViewedProfiles';
import VerificationModal from './components/VerificationModal';
import PrivacySettingsModal from './components/PrivacySettingsModal';
import BlockedProfilesModal from './components/BlockedProfilesModal';
import Pagination from './components/Pagination';
import ReportModal from './components/ReportModal';
import ReportedProfilesModal from './components/ReportedProfilesModal';
import InboxView from './components/InboxView';
import StatusIndicator from './components/StatusIndicator';
import { Profile, FilterCriteria, Message, ReportedProfileInfo, Notification, Post, Comment, ErrorLog, AppRating, AppSettings, HashtagResult } from './types';
import ConfirmActionModal from './components/ConfirmActionModal';
import ProfileCounter from './components/ProfileCounter';
import AuthPage from './components/AuthPage';
import AdminPanel from './components/AdminPanel';
import { getUsers, saveUsers, findUser } from './utils/auth';
import { getMessages, saveMessages } from './services/chatService';
import { getFollowMap, saveFollowMap, getNotifications, saveNotifications, getMutedUsers, saveMutedUsers, getReportedProfiles, saveReportedProfiles, getProfileViews, saveProfileViews, getBlockMap, saveBlockMap, getErrorLogs, getAppRatings, saveAppRatings, getAppSettings, saveAppSettings } from './utils/storage';
import { calculateDistance } from './utils';
import UserListModal from './components/FollowListModal';
import UserGuideModal from './components/UserGuideModal';
import InfoModal from './components/InfoModal';
import ProfileSetupWizard from './components/ProfileSetupWizard';
import FeedView from './components/FeedView';
import LikesHistoryView from './components/LikesHistoryView';
import SearchResults from './components/SearchResults';
import { mockPosts } from './data/mockPosts';
import ProfileCompletionBanner from './components/ProfileCompletionBanner';
import RateAppModal from './components/RateAppModal';
import AppSettingsModal from './components/AppSettingsModal';
import ProfessionalDashboard from './components/ProfessionalDashboard';

type AppView = 'dashboard' | 'shortlisted' | 'myProfile' | 'inbox' | 'admin' | 'feed' | 'likesHistory';
type Theme = 'light' | 'dark';

const PROFILES_PER_PAGE = 6;
const ADMIN_EMAIL = 'neelustlove@gmail.com';

const App: React.FC = () => {
  const [currentUserState, setCurrentUserState] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>(getUsers());
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [chattingWithProfile, setChattingWithProfile] = useState<Profile | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [editingUserByAdmin, setEditingUserByAdmin] = useState<Profile | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isReportedModalOpen, setIsReportedModalOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isRateAppModalOpen, setIsRateAppModalOpen] = useState(false);
  const [isAppSettingsOpen, setIsAppSettingsOpen] = useState(false);
  const [isProfessionalDashboardOpen, setIsProfessionalDashboardOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [suspendedIds, setSuspendedIds] = useState<number[]>([]);
  const [reportingProfile, setReportingProfile] = useState<Profile | null>(null);
  const [isFilterSidebarVisible, setIsFilterSidebarVisible] = useState(false);
  const [isConfirmDeleteSelfOpen, setIsConfirmDeleteSelfOpen] = useState(false);
  
  const [shortlistMap, setShortlistMap] = useState<Record<string, number[]>>({ '3': [1], '5': [1] });
  const [blockMap, setBlockMap] = useState<Record<string, number[]>>(getBlockMap());
  const [reportedProfiles, setReportedProfiles] = useState<ReportedProfileInfo[]>(getReportedProfiles());
  const [profileViews, setProfileViews] = useState<Record<number, { viewerId: number; timestamp: string }[]>>(getProfileViews());
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>(getErrorLogs());
  const [appRatings, setAppRatings] = useState<AppRating[]>(getAppRatings());
  const [appSettings, setAppSettings] = useState<AppSettings>(getAppSettings());
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);

  // Initialize messages state
  const [messagesByProfileId, setMessagesByProfileId] = useState<Record<number, Message[]>>({});
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);

  const [isConfirmClearInboxOpen, setIsConfirmClearInboxOpen] = useState(false);

  const [followMap, setFollowMap] = useState<Record<number, number[]>>(getFollowMap());
  const [notifications, setNotifications] = useState<Notification[]>(getNotifications());
  const [viewingUserList, setViewingUserList] = useState<{ type: 'followers' | 'following' | 'shortlisters'; profile: Profile } | null>(null);
  const [viewedProfilesInSession, setViewedProfilesInSession] = useState<number[]>([]);

  // New state for Feed and Search
  const [posts, setPosts] = useState<Post[]>(() => {
    const savedPosts = localStorage.getItem('matrimony_posts');
    return savedPosts ? JSON.parse(savedPosts) : mockPosts;
  });
  const [mutedUserIds, setMutedUserIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  
  // Location state
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  
  // Post Highlighting State
  const [highlightPostId, setHighlightPostId] = useState<number | null>(null);
  
  // Hashtag Filter State
  const [activeHashtagFilter, setActiveHashtagFilter] = useState<string | null>(null);

  useEffect(() => {
    const loggedInIdentifier = sessionStorage.getItem('loggedInUserPhone') || sessionStorage.getItem('loggedInUserEmail');
    if (loggedInIdentifier) {
      const user = findUser(loggedInIdentifier);
      if (user) {
        if (user.isProfileComplete === false) setIsSettingUpProfile(true);
        setCurrentUserState(user);
        if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) setIsAdmin(true);
        setMutedUserIds(getMutedUsers(user.id));
      }
    }
  }, []);

  // Async load messages from IndexedDB
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await getMessages();
        setMessagesByProfileId(msgs);
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setIsMessagesLoaded(true);
      }
    };
    loadMessages();
  }, []);

  useEffect(() => { saveUsers(allProfiles) }, [allProfiles]);
  
  // Only save messages if they have been loaded to prevent overwriting DB with empty state
  useEffect(() => { 
    if (isMessagesLoaded) {
      saveMessages(messagesByProfileId);
    }
  }, [messagesByProfileId, isMessagesLoaded]);

  useEffect(() => { saveFollowMap(followMap) }, [followMap]);
  useEffect(() => { saveNotifications(notifications) }, [notifications]);
  useEffect(() => { localStorage.setItem('matrimony_posts', JSON.stringify(posts))}, [posts]);
  useEffect(() => { if (currentUser) saveMutedUsers(currentUser.id, mutedUserIds); }, [mutedUserIds, currentUserState]);
  useEffect(() => { saveReportedProfiles(reportedProfiles) }, [reportedProfiles]);
  useEffect(() => { saveProfileViews(profileViews) }, [profileViews]);
  useEffect(() => { saveBlockMap(blockMap) }, [blockMap]);
  useEffect(() => { saveAppRatings(appRatings) }, [appRatings]);
  useEffect(() => { saveAppSettings(appSettings) }, [appSettings]);

  const currentUser = useMemo(() => {
      if (!currentUserState) return null;
      return allProfiles.find(p => p.id === currentUserState.id) || null;
  }, [currentUserState, allProfiles]);

  useEffect(() => {
    const bannerDismissed = sessionStorage.getItem('completionBannerDismissed');
    if (
      currentUser && 
      currentView === 'dashboard' &&
      currentUser.isProfileComplete && 
      (!currentUser.about || currentUser.about.length < 50) && 
      !bannerDismissed
    ) {
        setShowCompletionBanner(true);
    } else {
        setShowCompletionBanner(false);
    }
  }, [currentUser, currentView]);

  const handleLogin = (user: Profile, isNew: boolean) => {
    if (isNew) {
      setAllProfiles(prev => [...prev, user]);
    }
    setCurrentUserState(user);
    sessionStorage.setItem('loggedInUserPhone', user.phone);
    sessionStorage.setItem('loggedInUserEmail', user.email);
    setMutedUserIds(getMutedUsers(user.id));
    if (isNew || user.isProfileComplete === false) setIsSettingUpProfile(true);
    else setIsSettingUpProfile(false);
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) setIsAdmin(true);
  };
  
  const handleProfileSetupComplete = (updatedProfile: Profile) => {
    setAllProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    setCurrentUserState(updatedProfile);
    setIsSettingUpProfile(false);
    setToastMessage("Your profile is all set. Welcome!");
    setTimeout(() => {
        setToastMessage(null);
        setIsUserGuideOpen(true);
    }, 3000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUserPhone');
    sessionStorage.removeItem('loggedInUserEmail');
    sessionStorage.removeItem('completionBannerDismissed');
    setCurrentUserState(null);
    setIsAdmin(false);
    setCurrentView('dashboard');
    setViewedProfilesInSession([]);
  };
  
  const handleDismissCompletionBanner = () => {
    setShowCompletionBanner(false);
    sessionStorage.setItem('completionBannerDismissed', 'true');
  };

  const handleCompleteProfileClick = () => {
    setShowCompletionBanner(false);
    if (currentUser) {
      setEditingUserByAdmin(currentUser);
    }
  };
  
  const unreadMessagesCount = useMemo(() => {
    if (!currentUserState) return 0;
    return Object.values(messagesByProfileId).flat().filter((msg: Message) => msg.sender === 'profile' && !msg.isRead).length;
  }, [messagesByProfileId, currentUserState]);
  
  const unreadNotificationCount = useMemo(() => {
      if (!currentUserState) return 0;
      return notifications.filter(n => n.recipientId === currentUserState.id && !n.isRead).length;
  }, [notifications, currentUserState]);

  const totalInboxCount = unreadMessagesCount + unreadNotificationCount;

  const [filters, setFilters] = useState<FilterCriteria>({
    minAge: 18, maxAge: 70, gender: 'Any', religion: [], education: [], occupation: [], lifestyle: [], nearbyOnly: false
  });
  
  useEffect(() => {
    if (currentUser) {
        setFilters(prev => ({ ...prev, gender: currentUser.gender === 'Male' ? 'Female' : 'Male' }));
    }
  }, [currentUser]);

  // Handle geolocation when nearby filter is toggled
  useEffect(() => {
      if (filters.nearbyOnly && !appSettings.locationEnabled) {
          alert("Location services are disabled in App Settings. Please enable them to use this feature.");
          setFilters(prev => ({ ...prev, nearbyOnly: false }));
          return;
      }

      if (filters.nearbyOnly && !userLocation) {
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                  (position) => {
                      setUserLocation({
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude
                      });
                  },
                  (error) => {
                      console.error("Geolocation error:", error);
                      alert("Unable to access location. Please check browser permissions.");
                      setFilters(prev => ({ ...prev, nearbyOnly: false }));
                  }
              );
          } else {
              alert("Geolocation is not supported by your browser.");
              setFilters(prev => ({ ...prev, nearbyOnly: false }));
          }
      }
  }, [filters.nearbyOnly, userLocation, appSettings.locationEnabled]);

  const handleShortlistToggle = (profileId: number) => {
      if (!currentUser) return;
      const currentList = shortlistMap[String(currentUser.id)] || [];
      const isShortlisted = currentList.includes(profileId);
      
      setShortlistMap(prev => {
          const newShortlists = isShortlisted ? currentList.filter(id => id !== profileId) : [...currentList, profileId];
          return { ...prev, [String(currentUser.id)]: newShortlists };
      });

      setAllProfiles(prev => prev.map(p => 
          p.id === profileId 
              ? { ...p, shortlistedByCount: Math.max(0, (p.shortlistedByCount || 0) + (isShortlisted ? -1 : 1)) }
              : p
      ));
  };

  const handleFollowToggle = (profileId: number) => {
      if (!currentUser || currentUser.id === profileId) return;
      const newFollowMap = { ...followMap };
      const followingList = newFollowMap[currentUser.id] || [];
      if (followingList.includes(profileId)) {
          newFollowMap[currentUser.id] = followingList.filter(id => id !== profileId);
      } else {
          newFollowMap[currentUser.id] = [...followingList, profileId];
          const newNotification: Notification = {
              id: Date.now() + Math.random(), recipientId: profileId, actorId: currentUser.id, type: 'follow', isRead: false, timestamp: new Date().toISOString()
          };
          setNotifications(prev => [...prev, newNotification]);
      }
      setFollowMap(newFollowMap);
  };

  const handleBlockProfile = (profileId: number) => {
    if (!currentUser) return;
    setBlockMap(prev => {
        const current = prev[String(currentUser.id)] || [];
        if (!current.includes(profileId)) return { ...prev, [String(currentUser.id)]: [...current, profileId] };
        return prev;
    });
    setToastMessage("Profile has been blocked.");
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const handleUnblockProfile = (profileId: number) => {
    if (!currentUser) return;
     setBlockMap(prev => ({ ...prev, [String(currentUser.id)]: (prev[String(currentUser.id)] || []).filter(id => id !== profileId) }));
    setToastMessage("Profile unblocked.");
    setTimeout(() => setToastMessage(null), 3000);
  }

  const handleViewProfile = (profile: Profile, postId?: number) => {
      if (postId) {
          setHighlightPostId(postId);
      } else {
          setHighlightPostId(null);
      }

      if (!currentUser) return;

      if (currentUser.id === profile.id) {
          setCurrentView('myProfile');
          setSelectedProfile(null);
          return;
      }

      setSelectedProfile(profile);
      
      setProfileViews(prev => ({...prev, [profile.id]: [...(prev[profile.id] || []), { viewerId: currentUser.id, timestamp: new Date().toISOString() }]}));
      setAllProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, visitorCount: (p.visitorCount || 0) + 1 } : p));

      if (!viewedProfilesInSession.includes(profile.id)) {
          const newNotification: Notification = { id: Date.now() + Math.random(), recipientId: profile.id, actorId: currentUser.id, type: 'profile_view', isRead: false, timestamp: new Date().toISOString() };
          setNotifications(prev => [...prev, newNotification]);
          setViewedProfilesInSession(prev => [...prev, profile.id]);
      }
  };
  
  const handleEditProfileSave = (updatedProfile: Profile) => {
      setAllProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
      if (currentUser?.id === updatedProfile.id) setCurrentUserState(updatedProfile);
      setEditingUserByAdmin(null);
      setToastMessage("Your profile has been updated successfully!");
      setTimeout(() => setToastMessage(null), 3000);
  };
  
  const handleVerification = () => {
    setIsVerificationModalOpen(false);
    if (!currentUser) return;
     const updatedUser = { ...currentUser, isVerified: true };
     setAllProfiles(prev => prev.map(p => p.id === currentUser.id ? updatedUser : p));
     setCurrentUserState(updatedUser);
     setToastMessage("Your profile is now verified!");
     setTimeout(() => setToastMessage(null), 3000);
  };
  
  const handlePrivacySave = (updatedProfile: Profile) => {
    setAllProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    if (currentUser?.id === updatedProfile.id) setCurrentUserState(updatedProfile);
    setToastMessage("Privacy settings saved.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteAccount = () => {
      if (!currentUser) return;
      setIsConfirmDeleteSelfOpen(false);
      setIsPrivacyModalOpen(false);
      setAllProfiles(prev => prev.filter(p => p.id !== currentUser.id));
      handleLogout();
      setToastMessage("Account deleted successfully.");
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAppSettingsSave = (newSettings: AppSettings) => {
      setAppSettings(newSettings);
      setToastMessage("App settings updated.");
      setTimeout(() => setToastMessage(null), 3000);
  };
  
  const handleReportSubmit = (reason: string, details?: string) => {
    if (!reportingProfile || !currentUser) return;
    const report: ReportedProfileInfo = { reporterId: currentUser.id, profile: reportingProfile, reason, details, date: new Date().toLocaleDateString() };
    setReportedProfiles(prev => [...prev, report]);

    const adminUser = allProfiles.find(p => p.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    if (adminUser && adminUser.id !== currentUser.id) {
        const newNotification: Notification = {
            id: Date.now() + Math.random(),
            recipientId: adminUser.id,
            actorId: currentUser.id,
            type: 'user_report',
            isRead: false,
            timestamp: new Date().toISOString(),
            message: `User '${reportingProfile.name}' (ID: ${reportingProfile.id}) reported for: ${reason}.`,
        };
        setNotifications(prev => [newNotification, ...prev]);
    }

    setReportingProfile(null);
    setToastMessage("Report submitted. Thank you for keeping our community safe.");
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const handleNewMessage = (profileId: number, message: Message) => {
    setMessagesByProfileId(prev => ({...prev, [profileId]: [...(prev[profileId] || []), message]}));
    
    const now = new Date().toISOString();

    if (message.sender === 'profile') {
        if (currentUser) {
            const notification: Notification = {
                id: Date.now() + Math.random(),
                recipientId: currentUser.id,
                actorId: profileId,
                type: 'message',
                isRead: false,
                timestamp: now,
                message: message.content.type === 'text' ? message.content.text : 'Sent an attachment'
            };
            setNotifications(prev => [notification, ...prev]);
        }
        
        setAllProfiles(prev => prev.map(p => 
            p.id === profileId ? { ...p, lastSeen: now } : p
        ));

        if (chattingWithProfile && chattingWithProfile.id === profileId) {
            setChattingWithProfile(prev => prev ? { ...prev, lastSeen: now } : null);
        }
    }
  };

  const handleUpdateMessage = (profileId: number, messageId: number, updates: Partial<Message>) => {
    setMessagesByProfileId(prev => ({
        ...prev,
        [profileId]: (prev[profileId] || []).map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
        )
    }));
  };

  const handleDeleteMessages = (profileId: number, messageIds: number[]) => {
    setMessagesByProfileId(prev => ({
        ...prev,
        [profileId]: (prev[profileId] || []).filter(msg => !messageIds.includes(msg.id))
    }));
  };

  const handleMarkAsRead = (profileId: number) => {
    setMessagesByProfileId(prev => ({...prev, [profileId]: (prev[profileId] || []).map(msg => msg.sender === 'profile' ? { ...msg, isRead: true } : msg)}));
  };

  const handleMarkAllAsRead = () => {
    setMessagesByProfileId(prev => {
        const newMessages = { ...prev };
        Object.keys(newMessages).forEach(id => {
            newMessages[Number(id)] = newMessages[Number(id)].map(msg => msg.sender === 'profile' ? { ...msg, isRead: true } : msg);
        });
        return newMessages;
    });
  };

  const handleMarkNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.recipientId === currentUser.id ? { ...n, isRead: true } : n));
  };
  
  const handleClearInbox = () => {
    if (!currentUser) return;
    setMessagesByProfileId({});
    setNotifications(prev => prev.filter(n => n.recipientId !== currentUser.id));
    setIsConfirmClearInboxOpen(false);
  };

  const handleClearChat = (profileId: number) => {
      setMessagesByProfileId(prev => {
          const newState = { ...prev };
          delete newState[profileId];
          return newState;
      });
  };
  
  const handleOpenChat = (profile: Profile) => {
    setChattingWithProfile(profile);
    handleMarkAsRead(profile.id);
  };

  const handleCreatePost = ({ text, image, audio, audioFileName, hideLikes, hideViews }: { text?: string; image?: File; audio?: Blob, audioFileName?: string, hideLikes?: boolean, hideViews?: boolean }) => {
    if (!currentUser) return;
    const newPost: Post = {
        id: Date.now(),
        authorId: currentUser.id,
        text,
        imageUrl: image ? URL.createObjectURL(image) : undefined,
        audioUrl: audio ? URL.createObjectURL(audio) : undefined,
        audioFileName,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: [],
        viewCount: 0,
        hideLikes,
        hideViews,
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLikePost = (postId: number) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            const newLikes = p.likes.includes(currentUser.id) ? p.likes.filter(id => id !== currentUser.id) : [...p.likes, currentUser.id];
            
            if (!p.likes.includes(currentUser.id) && p.authorId !== currentUser.id) {
               const newNotification: Notification = {
                    id: Date.now() + Math.random(),
                    recipientId: p.authorId,
                    actorId: currentUser.id,
                    type: 'like_post',
                    isRead: false,
                    timestamp: new Date().toISOString(),
                    postId: p.id
               };
               setNotifications(curr => [newNotification, ...curr]);
            }

            return { ...p, likes: newLikes };
        }
        return p;
    }));
  };
  
  const handleAddComment = (postId: number, commentText: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
             const newComment: Comment = {
                id: Date.now(),
                authorId: currentUser.id,
                text: commentText,
                timestamp: new Date().toISOString(),
                likes: [],
                replies: []
            };
            
            if (p.authorId !== currentUser.id) {
               const newNotification: Notification = {
                    id: Date.now() + Math.random(),
                    recipientId: p.authorId,
                    actorId: currentUser.id,
                    type: 'comment_post',
                    isRead: false,
                    timestamp: new Date().toISOString(),
                    postId: p.id,
                    message: commentText
               };
               setNotifications(curr => [newNotification, ...curr]);
            }

            return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
    }));
  };

  const updateCommentsRecursively = (comments: Comment[], targetId: number, updateFn: (c: Comment) => Comment): Comment[] => {
      return comments.map(c => {
          if (c.id === targetId) {
              return updateFn(c);
          }
          if (c.replies && c.replies.length > 0) {
              return { ...c, replies: updateCommentsRecursively(c.replies, targetId, updateFn) };
          }
          return c;
      });
  };

  const handleLikeComment = (postId: number, commentId: number) => {
      if (!currentUser) return;
      setPosts(prev => prev.map(post => {
          if (post.id === postId) {
              const updatedComments = updateCommentsRecursively(post.comments, commentId, (comment) => {
                  const isLiked = comment.likes?.includes(currentUser.id);
                  const newLikes = isLiked 
                      ? comment.likes.filter(id => id !== currentUser.id) 
                      : [...(comment.likes || []), currentUser.id];
                  
                  if (!isLiked && comment.authorId !== currentUser.id) {
                      const newNotification: Notification = {
                          id: Date.now() + Math.random(),
                          recipientId: comment.authorId,
                          actorId: currentUser.id,
                          type: 'comment_like',
                          isRead: false,
                          timestamp: new Date().toISOString(),
                          postId: postId,
                      };
                      setNotifications(curr => [newNotification, ...curr]);
                  }

                  return { ...comment, likes: newLikes };
              });
              return { ...post, comments: updatedComments };
          }
          return post;
      }));
  };

  const handleReplyComment = (postId: number, commentId: number, text: string) => {
      if (!currentUser) return;
      setPosts(prev => prev.map(post => {
          if (post.id === postId) {
              const updatedComments = updateCommentsRecursively(post.comments, commentId, (comment) => {
                  const newReply: Comment = {
                      id: Date.now(),
                      authorId: currentUser.id,
                      text: text,
                      timestamp: new Date().toISOString(),
                      likes: [],
                      replies: []
                  };

                  if (comment.authorId !== currentUser.id) {
                      const newNotification: Notification = {
                          id: Date.now() + Math.random(),
                          recipientId: comment.authorId,
                          actorId: currentUser.id,
                          type: 'comment_reply',
                          isRead: false,
                          timestamp: new Date().toISOString(),
                          postId: postId,
                          message: text
                      };
                      setNotifications(curr => [newNotification, ...curr]);
                  }

                  return { ...comment, replies: [...(comment.replies || []), newReply] };
              });
              return { ...post, comments: updatedComments };
          }
          return post;
      }));
  };

  const handleMuteUser = (userId: number) => setMutedUserIds(prev => [...new Set([...prev, userId])]);
  const handleUnmuteUser = (userId: number) => setMutedUserIds(prev => prev.filter(id => id !== userId));

  const handleSearchChange = (query: string) => setSearchQuery(query);

  const hashtagStats = useMemo(() => {
      const stats: Record<string, number> = {};
      posts.forEach(post => {
          if (post.text) {
              const matches = post.text.match(/#[a-zA-Z0-9_]+/g);
              if (matches) {
                  matches.forEach(tag => {
                      stats[tag] = (stats[tag] || 0) + 1;
                  });
              }
          }
      });
      return Object.entries(stats).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
  }, [posts]);

  // Combined Search Results - Filter out blocked users
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    // Get list of users blocked by current user AND users who blocked current user
    const blockedIds = blockMap[String(currentUser?.id)] || [];
    const blockedByIds = Object.entries(blockMap)
        .filter(([, list]) => Array.isArray(list) && list.includes(currentUser?.id || 0))
        .map(([blockerId]) => Number(blockerId));
    
    const excludedIds = new Set([...blockedIds, ...blockedByIds]);

    if (searchQuery.trim().startsWith('#')) {
        return hashtagStats.filter(h => h.tag.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return allProfiles.filter(p => 
        p.id !== currentUser?.id && 
        !excludedIds.has(p.id) &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.username.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, allProfiles, currentUser, hashtagStats, blockMap]);

  const handleSelectSearchResult = (item: Profile | HashtagResult) => {
    if ('tag' in item) {
        setSearchQuery('');
        setActiveHashtagFilter(item.tag);
        setCurrentView('feed');
    } else {
        setSearchQuery('');
        handleViewProfile(item);
    }
  };
  
  const handleHashtagClick = (tag: string) => {
      setActiveHashtagFilter(tag);
      setCurrentView('feed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewUserList = (type: 'followers' | 'following' | 'shortlisters', profile: Profile) => {
    setViewingUserList({ type, profile });
  };

  const handleRateApp = (rating: number, feedback: string) => {
      if (!currentUser) return;
      const newRating: AppRating = {
          id: Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          userImage: currentUser.imageUrls[0],
          rating,
          feedback,
          timestamp: new Date().toISOString()
      };
      setAppRatings(prev => [...prev, newRating]);
      setIsRateAppModalOpen(false);
      setToastMessage("Thank you for your feedback!");
      setTimeout(() => setToastMessage(null), 3000);
  };

  const mostViewed = useMemo(() => {
    return [...allProfiles].filter(p => p.visitorCount && p.visitorCount > 0).sort((a, b) => (b.visitorCount || 0) - (a.visitorCount || 0)).slice(0, 10);
  }, [allProfiles]);
  
  const mostShortlistedProfiles = useMemo(() => {
    const shortlistCounts = Object.values(shortlistMap).reduce((acc, list) => {
        if (Array.isArray(list)) {
            list.forEach(id => {
                acc[id] = (acc[id] || 0) + 1;
            });
        }
        return acc;
    }, {} as Record<number, number>);

    return [...allProfiles]
        .map(p => ({ ...p, shortlistCount: shortlistCounts[p.id] || 0 }))
        .filter(p => p.shortlistCount > 0)
        .sort((a, b) => b.shortlistCount - a.shortlistCount)
        .slice(0, 5);
  }, [allProfiles, shortlistMap]);

  const mostReportedProfiles = useMemo(() => {
    const reportCounts: Record<number, number> = reportedProfiles.reduce((acc, report) => {
        if (report.profile) {
            const id = report.profile.id;
            acc[id] = (acc[id] || 0) + 1;
        }
        return acc;
    }, {} as Record<number, number>);

    return [...allProfiles]
        .map(p => ({ ...p, reportCount: reportCounts[p.id] || 0 }))
        .filter(p => p.reportCount > 0)
        .sort((a, b) => (b.reportCount || 0) - (a.reportCount || 0))
        .slice(0, 5);
  }, [allProfiles, reportedProfiles]);
  
  const shortlistedProfiles = useMemo(() => {
    if (!currentUser) return [];
    return allProfiles.filter(p => (shortlistMap[String(currentUser.id)] || []).includes(p.id));
  }, [allProfiles, shortlistMap, currentUser]);

  const blockedProfileIds = useMemo(() => {
      if (!currentUser) return [];
      const blockedByCurrent = blockMap[String(currentUser.id)] || [];
      const blockedCurrent = Object.entries(blockMap)
        .filter(([, list]) => Array.isArray(list) && list.includes(currentUser.id))
        .map(([blockerId]) => parseInt(blockerId));
      return [...new Set([...blockedByCurrent, ...blockedCurrent])];
  }, [blockMap, currentUser]);

  const profilesForDashboard = useMemo(() => {
    return allProfiles.filter(p => p.id !== currentUser?.id && !blockedProfileIds.includes(p.id) && !suspendedIds.includes(p.id));
  }, [allProfiles, currentUser, blockedProfileIds, suspendedIds]);

  const filteredProfiles = useMemo(() => {
    return profilesForDashboard.filter(p => {
      const basicFilters = (
          p.age >= filters.minAge && 
          p.age <= filters.maxAge && 
          (filters.gender === 'Any' || p.gender === filters.gender) && 
          (filters.religion.length === 0 || filters.religion.includes(p.religion)) && 
          (filters.education.length === 0 || filters.education.includes(p.education)) && 
          (filters.occupation.length === 0 || filters.occupation.includes(p.occupation)) && 
          (filters.lifestyle.length === 0 || filters.lifestyle.includes(p.lifestyle))
      );

      if (!basicFilters) return false;

      if (filters.nearbyOnly && userLocation && p.coordinates) {
          const distance = calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              p.coordinates.latitude, 
              p.coordinates.longitude
          );
          return distance <= 100;
      }

      return true;
    });
  }, [profilesForDashboard, filters, userLocation]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const paginatedProfiles = useMemo(() => {
    const data = currentView === 'shortlisted' ? shortlistedProfiles : filteredProfiles;
    const startIndex = (currentPage - 1) * PROFILES_PER_PAGE;
    return data.slice(startIndex, startIndex + PROFILES_PER_PAGE);
  }, [filteredProfiles, shortlistedProfiles, currentPage, currentView]);

  const totalPages = useMemo(() => {
     const data = currentView === 'shortlisted' ? shortlistedProfiles : filteredProfiles;
    return Math.ceil(data.length / PROFILES_PER_PAGE);
  }, [filteredProfiles, shortlistedProfiles, currentView]);
  
  useEffect(() => { setCurrentPage(1) }, [currentView, filters]);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark') }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleToggleVerifyUser = (userId: number) => setAllProfiles(prev => prev.map(p => p.id === userId ? { ...p, isVerified: !p.isVerified } : p));
  const handleSuspendUser = (userId: number) => setSuspendedIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  const handleConfirmDelete = () => { if (userToDelete) setAllProfiles(prev => prev.filter(p => p.id !== userToDelete.id)); setUserToDelete(null); };
  const handleSendMessageToUser = (userId: number, message: string) => {
      handleNewMessage(userId, { id: Date.now(), content: { type: 'text', text: message }, sender: 'profile', timestamp: new Date().toISOString(), isRead: false, isAdminMessage: true });
      setToastMessage(`Message sent to user ID ${userId}`);
      setTimeout(() => setToastMessage(null), 3000);
  };

  if (!currentUser) return <AuthPage onLoginSuccess={handleLogin} />;
  if (isSettingUpProfile) return <ProfileSetupWizard user={currentUser} onComplete={handleProfileSetupComplete} />;

  const renderCurrentView = () => {
    switch (currentView) {
      case 'inbox':
        return <InboxView conversations={Object.keys(messagesByProfileId).map(id => allProfiles.find(p => p.id === parseInt(id))).filter(Boolean) as Profile[]} messagesByProfileId={messagesByProfileId} notifications={notifications.filter(n => n.recipientId === currentUser.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())} allProfiles={allProfiles} onOpenChat={handleOpenChat} onBack={() => setCurrentView('dashboard')} onClearInbox={() => setIsConfirmClearInboxOpen(true)} onMarkAsRead={handleMarkAsRead} onMarkAllAsRead={handleMarkAllAsRead} onMarkNotificationsAsRead={handleMarkNotificationsAsRead} onViewProfile={handleViewProfile} posts={posts} />;
      
      case 'myProfile':
        const myShortlisters = Object.entries(shortlistMap)
          .filter(([, ids]) => Array.isArray(ids) && ids.includes(currentUser.id))
          .map(([listerId]) => Number(listerId));
          
        return <ProfileDetail 
            profile={currentUser} 
            onClose={() => setCurrentView('dashboard')}
            currentUser={currentUser} 
            onShortlistToggle={handleShortlistToggle} 
            isShortlisted={false} 
            onSendMessage={handleOpenChat} 
            onBlockProfile={handleBlockProfile} 
            onReportProfile={setReportingProfile} 
            onFollowToggle={handleFollowToggle} 
            isFollowing={false} 
            followMap={followMap} 
            onViewUserList={handleViewUserList} 
            shortlistedByCount={myShortlisters.length} 
            posts={posts} 
            allProfiles={allProfiles} 
            onLikePost={handleLikePost} 
            onAddComment={handleAddComment} 
            onMuteUser={handleMuteUser} 
            onUnmuteUser={handleUnmuteUser} 
            mutedUserIds={mutedUserIds} 
            onViewProfile={handleViewProfile} 
            onLikeComment={handleLikeComment} 
            onReplyComment={handleReplyComment} 
            highlightPostId={highlightPostId} 
            isCurrentUserProfile={true}
            profileViews={profileViews}
            notifications={notifications}
        />;

      case 'admin':
        return <AdminPanel profiles={allProfiles} currentUser={currentUser} onBack={() => setCurrentView('dashboard')} reports={reportedProfiles} onViewUser={handleViewProfile} onToggleVerify={handleToggleVerifyUser} onSuspendUser={handleSuspendUser} suspendedIds={suspendedIds} blockMap={blockMap} shortlistMap={shortlistMap} followMap={followMap} onDeleteUser={(user) => setUserToDelete(user)} onEditUser={setEditingUserByAdmin} onSendMessage={handleSendMessageToUser} profileViews={profileViews} posts={posts} mostViewed={mostViewed} mostShortlisted={mostShortlistedProfiles} mostReported={mostReportedProfiles} errorLogs={errorLogs} appRatings={appRatings} />;

      case 'feed':
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <button onClick={() => setCurrentView('dashboard')} className="mb-4 flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-800 dark:hover:text-violet-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
                <FeedView 
                    currentUser={currentUser} 
                    allProfiles={allProfiles.filter(p => !blockedProfileIds.includes(p.id))} 
                    posts={posts.filter(p => !blockedProfileIds.includes(p.authorId))} 
                    mutedUserIds={mutedUserIds} 
                    onCreatePost={handleCreatePost} 
                    onLikePost={handleLikePost} 
                    onAddComment={handleAddComment} 
                    onMuteUser={handleMuteUser} 
                    onUnmuteUser={handleUnmuteUser} 
                    onViewProfile={handleViewProfile} 
                    onLikeComment={handleLikeComment} 
                    onReplyComment={handleReplyComment} 
                    userLocation={userLocation} 
                    appSettings={appSettings} 
                    activeHashtag={activeHashtagFilter}
                    onClearHashtag={() => setActiveHashtagFilter(null)}
                    onHashtagClick={handleHashtagClick}
                    onBlockUser={handleBlockProfile}
                    onReportUser={setReportingProfile}
                />
            </div>
        );

      case 'likesHistory':
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <button onClick={() => setCurrentView('dashboard')} className="mb-4 flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-800 dark:hover:text-violet-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
                <LikesHistoryView 
                    currentUser={currentUser} 
                    allProfiles={allProfiles} 
                    posts={posts.filter(p => !blockedProfileIds.includes(p.authorId))} 
                    onLikePost={handleLikePost} 
                    onAddComment={handleAddComment} 
                    onMuteUser={handleMuteUser} 
                    onUnmuteUser={handleUnmuteUser} 
                    onViewProfile={handleViewProfile} 
                    onLikeComment={handleLikeComment} 
                    onReplyComment={handleReplyComment} 
                    mutedUserIds={mutedUserIds} 
                    onBlockUser={handleBlockProfile}
                    onReportUser={setReportingProfile}
                />
            </div>
        );

      case 'shortlisted':
      case 'dashboard':
      default:
        return (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {showCompletionBanner && (
                    <ProfileCompletionBanner 
                        onCompleteProfile={handleCompleteProfileClick} 
                        onDismiss={handleDismissCompletionBanner} 
                    />
                )}
                
                {searchQuery && searchResults.length > 0 && (
                    <SearchResults results={searchResults} onSelect={handleSelectSearchResult} onClose={() => setSearchQuery('')} />
                )}

                {currentView === 'dashboard' && !searchQuery && (
                    <>
                        <MostViewedProfiles profiles={mostViewed.filter(p => !blockedProfileIds.includes(p.id))} onViewProfile={handleViewProfile} />
                    </>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">
                        {currentView === 'shortlisted' ? 'Shortlisted Profiles' : 'Discover Matches'}
                    </h2>
                    <div className="flex space-x-2">
                        {currentView === 'dashboard' && (
                            <button onClick={() => setIsFilterSidebarVisible(true)} className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4" /></svg>
                                Filters
                            </button>
                        )}
                        {currentView === 'shortlisted' && (
                            <button onClick={() => setCurrentView('dashboard')} className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                View All
                            </button>
                        )}
                    </div>
                </div>

                <ProfileCounter viewedCount={paginatedProfiles.length} totalCount={currentView === 'shortlisted' ? shortlistedProfiles.length : filteredProfiles.length} />

                {paginatedProfiles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paginatedProfiles.map(profile => (
                            <ProfileCard
                                key={profile.id}
                                profile={profile}
                                onViewProfile={handleViewProfile}
                                onShortlistToggle={handleShortlistToggle}
                                isShortlisted={(shortlistMap[String(currentUser.id)] || []).includes(profile.id)}
                                onSendMessage={handleOpenChat}
                                onShareProfile={handleViewProfile} 
                                onReportProfile={setReportingProfile}
                                onFollowToggle={handleFollowToggle}
                                isFollowing={(followMap[currentUser.id] || []).includes(profile.id)}
                                shortlisters={allProfiles.filter(p => (shortlistMap[String(p.id)] || []).includes(profile.id))}
                                isCurrentUser={profile.id === currentUser.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">No profiles found</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your filters or check back later.</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                )}
            </main>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <Header 
            onNavigate={setCurrentView} 
            activeView={currentView} 
            onGetVerifiedClick={() => setIsVerificationModalOpen(true)} 
            theme={theme} 
            onToggleTheme={handleToggleTheme}
            onPrivacySettingsClick={() => setIsPrivacyModalOpen(true)}
            onBlockedProfilesClick={() => setIsBlockedModalOpen(true)}
            onReportedProfilesClick={() => setIsReportedModalOpen(true)}
            onAppSettingsClick={() => setIsAppSettingsOpen(true)}
            onProfessionalDashboardClick={() => setIsProfessionalDashboardOpen(true)}
            inboxCount={totalInboxCount}
            currentUser={currentUser}
            onLogout={handleLogout}
            isAdmin={isAdmin}
            onUserGuideClick={() => setIsUserGuideOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onInfoClick={() => setIsInfoModalOpen(true)}
        />
        
        {renderCurrentView()}

        {/* Modal for viewing OTHER profiles */}
        {selectedProfile && (
            <ProfileDetail
                profile={selectedProfile}
                onClose={() => setSelectedProfile(null)}
                currentUser={currentUser}
                onShortlistToggle={handleShortlistToggle}
                isShortlisted={(shortlistMap[String(currentUser.id)] || []).includes(selectedProfile.id)}
                onSendMessage={handleOpenChat}
                onBlockProfile={handleBlockProfile}
                onReportProfile={setReportingProfile}
                onFollowToggle={handleFollowToggle}
                isFollowing={(followMap[currentUser.id] || []).includes(selectedProfile.id)}
                followMap={followMap}
                onViewUserList={handleViewUserList}
                shortlistedByCount={(Object.entries(shortlistMap).filter(([, ids]) => Array.isArray(ids) && ids.includes(selectedProfile.id))).length}
                posts={posts}
                allProfiles={allProfiles}
                onLikePost={handleLikePost}
                onAddComment={handleAddComment}
                onMuteUser={handleMuteUser}
                onUnmuteUser={handleUnmuteUser}
                mutedUserIds={mutedUserIds}
                onViewProfile={handleViewProfile}
                onLikeComment={handleLikeComment}
                onReplyComment={handleReplyComment}
                highlightPostId={highlightPostId}
                isCurrentUserProfile={false}
                profileViews={profileViews}
                notifications={notifications}
            />
        )}

        {chattingWithProfile && <ChatModal profile={chattingWithProfile} onClose={() => setChattingWithProfile(null)} onNewMessage={handleNewMessage} initialMessages={messagesByProfileId[chattingWithProfile.id] || []} onClearChat={handleClearChat} onViewProfile={handleViewProfile} onDeleteMessages={handleDeleteMessages} onUpdateMessage={handleUpdateMessage} appSettings={appSettings} />}
        {editingUserByAdmin && <EditProfileModal profile={editingUserByAdmin} onClose={() => setEditingUserByAdmin(null)} onSave={handleEditProfileSave} />}
        {isVerificationModalOpen && <VerificationModal onClose={() => setIsVerificationModalOpen(false)} onVerified={handleVerification} />}
        {isPrivacyModalOpen && <PrivacySettingsModal profile={currentUser} onClose={() => setIsPrivacyModalOpen(false)} onSave={handlePrivacySave} onDeleteAccount={() => setIsConfirmDeleteSelfOpen(true)} />}
        {isAppSettingsOpen && <AppSettingsModal currentSettings={appSettings} onClose={() => setIsAppSettingsOpen(false)} onSave={handleAppSettingsSave} />}
        {isBlockedModalOpen && <BlockedProfilesModal profiles={allProfiles.filter(p => (blockMap[String(currentUser.id)] || []).includes(p.id))} onClose={() => setIsBlockedModalOpen(false)} onUnblock={handleUnblockProfile} />}
        {isReportedModalOpen && <ReportedProfilesModal reportedProfiles={reportedProfiles.filter(r => r.reporterId === currentUser.id)} onClose={() => setIsReportedModalOpen(false)} />}
        {reportingProfile && <ReportModal profile={reportingProfile} onClose={() => setReportingProfile(null)} onSubmit={handleReportSubmit} />}
        {isUserGuideOpen && <UserGuideModal onClose={() => setIsUserGuideOpen(false)} />}
        {isInfoModalOpen && <InfoModal onClose={() => setIsInfoModalOpen(false)} onRateAppClick={() => { setIsInfoModalOpen(false); setIsRateAppModalOpen(true); }} ratings={appRatings} />}
        {isRateAppModalOpen && <RateAppModal currentUser={currentUser} onClose={() => setIsRateAppModalOpen(false)} onSubmit={handleRateApp} existingRatings={appRatings} />}
        {isProfessionalDashboardOpen && (
            <ProfessionalDashboard 
                currentUser={currentUser} 
                posts={posts} 
                allProfiles={allProfiles} 
                onClose={() => setIsProfessionalDashboardOpen(false)} 
                profileViews={profileViews[currentUser.id] || []}
                notifications={notifications}
            />
        )}
        
        <ConfirmActionModal isOpen={isConfirmClearInboxOpen} onClose={() => setIsConfirmClearInboxOpen(false)} onConfirm={handleClearInbox} title="Clear Inbox?" message="Are you sure you want to delete all messages and notifications? This action cannot be undone." confirmButtonText="Yes, Clear Inbox" />
        <ConfirmActionModal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} onConfirm={handleConfirmDelete} title={`Delete ${userToDelete?.name}?`} message={<p>Are you sure you want to permanently delete this user? All their data will be lost. This action is irreversible.</p>} confirmButtonText="Yes, Delete User" />
        <ConfirmActionModal isOpen={isConfirmDeleteSelfOpen} onClose={() => setIsConfirmDeleteSelfOpen(false)} onConfirm={handleDeleteAccount} title="Delete Your Account?" message={<p className="text-red-600 font-medium">Warning: This action is permanent. All your data, messages, matches, and posts will be deleted forever.</p>} confirmButtonText="Yes, Delete My Account" />
        
        {isFilterSidebarVisible && <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsFilterSidebarVisible(false)}><div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}><FilterSidebar initialFilters={filters} onFilterChange={setFilters} onClose={() => setIsFilterSidebarVisible(false)} /></div></div>}
        {viewingUserList && <UserListModal type={viewingUserList.type} profile={viewingUserList.profile} allProfiles={allProfiles} followMap={followMap} shortlistMap={shortlistMap} onClose={() => setViewingUserList(null)} onViewProfile={(profile) => { setViewingUserList(null); handleViewProfile(profile); }} />}
        
        <StatusIndicator />
        {toastMessage && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold text-center z-50 animate-slide-down-then-up">{toastMessage}</div>}
    </div>
  );
};

export default App;

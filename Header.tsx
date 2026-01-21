
import React, { useState, useRef, useEffect } from 'react';
import { APP_TITLE } from '../constants';
import { Profile } from '../types';

type AppView = 'dashboard' | 'shortlisted' | 'myProfile' | 'inbox' | 'admin' | 'feed' | 'likesHistory';
type Theme = 'light' | 'dark';

interface HeaderProps {
  onNavigate: (view: AppView) => void;
  activeView: AppView;
  onGetVerifiedClick: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onPrivacySettingsClick: () => void;
  onBlockedProfilesClick: () => void;
  onReportedProfilesClick: () => void;
  onAppSettingsClick: () => void;
  onProfessionalDashboardClick: () => void;
  inboxCount?: number;
  currentUser: Profile;
  onLogout: () => void;
  isAdmin: boolean;
  onUserGuideClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onInfoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, activeView, onGetVerifiedClick, theme, onToggleTheme, onPrivacySettingsClick, onBlockedProfilesClick, onReportedProfilesClick, onAppSettingsClick, onProfessionalDashboardClick, inboxCount = 0, currentUser, onLogout, isAdmin, onUserGuideClick, searchQuery, onSearchChange, onInfoClick }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  
  // Search Loading State
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  
  // Notification Animation State
  const [animateNotification, setAnimateNotification] = useState(false);
  const prevInboxCountRef = useRef(inboxCount);

  // Search History State
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isHistorySelectionMode, setIsHistorySelectionMode] = useState(false);
  const [selectedHistoryItems, setSelectedHistoryItems] = useState<Set<string>>(new Set());
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowHistory(false);
        setIsHistorySelectionMode(false);
        setSelectedHistoryItems(new Set());
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load History
  useEffect(() => {
      const history = localStorage.getItem('search_history');
      if (history) {
          try {
            setSearchHistory(JSON.parse(history));
          } catch (e) {
            console.error("Failed to parse search history", e);
          }
      }
  }, []);

  // Update History Helper
  const updateHistory = (newHistory: string[]) => {
      setSearchHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  // Simulate Search Loading
  useEffect(() => {
      if (searchQuery) {
          setIsSearchLoading(true);
          const timer = setTimeout(() => setIsSearchLoading(false), 500);
          return () => clearTimeout(timer);
      } else {
          setIsSearchLoading(false);
      }
  }, [searchQuery]);

  // Animate Notification Badge
  useEffect(() => {
      if (inboxCount > prevInboxCountRef.current) {
          setAnimateNotification(true);
          const timer = setTimeout(() => setAnimateNotification(false), 300); // Quick pop animation
          return () => clearTimeout(timer);
      }
      prevInboxCountRef.current = inboxCount;
  }, [inboxCount]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && searchQuery.trim()) {
          const term = searchQuery.trim();
          const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 8);
          updateHistory(newHistory);
          setShowHistory(false);
          (e.target as HTMLInputElement).blur();
      }
  };

  const handleHistoryItemClick = (term: string) => {
      onSearchChange(term);
      setShowHistory(false);
  };

  const handleDeleteHistoryItem = (term: string) => {
      const newHistory = searchHistory.filter(h => h !== term);
      updateHistory(newHistory);
  };

  const handleClearAllHistory = () => {
      updateHistory([]);
      setShowHistory(false);
  };

  const toggleHistorySelection = (term: string) => {
      const newSet = new Set(selectedHistoryItems);
      if (newSet.has(term)) {
          newSet.delete(term);
      } else {
          newSet.add(term);
      }
      setSelectedHistoryItems(newSet);
  };

  const handleDeleteSelectedHistory = () => {
      const newHistory = searchHistory.filter(h => !selectedHistoryItems.has(h));
      updateHistory(newHistory);
      setSelectedHistoryItems(new Set());
      if (newHistory.length === 0) setIsHistorySelectionMode(false);
  };

  const navLinkClasses = (view: AppView) => 
    `px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-300 ${
      activeView === view
        ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 font-semibold'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
    }`;
    
  const mobileNavLinkClasses = (view: AppView) => 
    `block px-3 py-2 rounded-md text-base font-medium cursor-pointer transition-colors duration-300 ${
      activeView === view
        ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 font-semibold'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
    }`;

  const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
  
  const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  const EnvelopeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
  const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zM5.468 15.118A8 8 0 0012 18a8 8 0 006.532-2.882 4 4 0 00-1.78-1.42A4.97 4.97 0 0012 14c-1.42 0-2.75.53-3.752 1.42A4 4 0 005.468 15.118z" clipRule="evenodd" /></svg>;
  const HamburgerIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;
  const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
  const SearchIcon = () => <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-20 border-b border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
             <div className="md:hidden mr-2">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-600 dark:text-gray-300">
                    {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
                </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-violet-800 dark:text-violet-400 cursor-pointer" onClick={() => onNavigate('dashboard')}>{APP_TITLE}</h1>
            <nav className="hidden md:flex ml-10 space-x-4 items-center">
              <a onClick={() => onNavigate('dashboard')} className={navLinkClasses('dashboard')}>Dashboard</a>
              <a onClick={() => onNavigate('feed')} className={navLinkClasses('feed')}>Feed</a>
              <a onClick={() => onNavigate('likesHistory')} className={navLinkClasses('likesHistory')}>
                  Likes Post
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Input with Tooltip, Spinner & History */}
            <div className="relative hidden md:block group" ref={searchContainerRef}>
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setShowHistory(true)}
                className="w-48 pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 dark:text-white focus:ring-violet-500 focus:border-violet-500 focus:w-64 transition-all duration-300" 
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              {isSearchLoading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent"></div>
                </div>
              )}
              
              {/* Search History Dropdown */}
              {showHistory && searchHistory.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-40 animate-fade-in w-64">
                      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Recent</span>
                          <div className="flex space-x-2">
                              {!isHistorySelectionMode ? (
                                  <>
                                      <button onClick={() => setIsHistorySelectionMode(true)} className="text-xs text-violet-600 dark:text-violet-400 hover:underline">Select</button>
                                      <button onClick={handleClearAllHistory} className="text-xs text-red-500 hover:underline">Clear All</button>
                                  </>
                              ) : (
                                  <button onClick={() => { setIsHistorySelectionMode(false); setSelectedHistoryItems(new Set()); }} className="text-xs text-gray-500 hover:underline">Cancel</button>
                              )}
                          </div>
                      </div>
                      
                      <ul className="max-h-60 overflow-y-auto">
                          {searchHistory.map((term, idx) => (
                              <li key={idx} className="flex items-center px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-0" onClick={() => !isHistorySelectionMode && handleHistoryItemClick(term)}>
                                 {isHistorySelectionMode ? (
                                     <input 
                                          type="checkbox" 
                                          checked={selectedHistoryItems.has(term)}
                                          onChange={() => toggleHistorySelection(term)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="mr-3 h-4 w-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500 dark:bg-gray-700 dark:border-gray-600"
                                     />
                                 ) : (
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                 )}
                                 <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate">{term}</span>
                                 {!isHistorySelectionMode && (
                                     <button onClick={(e) => { e.stopPropagation(); handleDeleteHistoryItem(term); }} className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                         <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                     </button>
                                 )}
                              </li>
                          ))}
                      </ul>

                      {isHistorySelectionMode && (
                          <div className="p-2 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{selectedHistoryItems.size} selected</span>
                              <button 
                                  onClick={handleDeleteSelectedHistory}
                                  disabled={selectedHistoryItems.size === 0}
                                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  Delete
                              </button>
                          </div>
                      )}
                  </div>
              )}

              {/* Search Tooltip - Hide when history is open to reduce clutter */}
              {!showHistory && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
                    Search Profiles
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-gray-800"></div>
                </div>
              )}
            </div>

            <div className="relative group">
              <button onClick={() => onNavigate('inbox')} className="relative p-1 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors">
                  <EnvelopeIcon />
                  {inboxCount > 0 && (
                    <span className={`absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-violet-600 rounded-full transition-all duration-300 ${animateNotification ? 'scale-125 bg-rose-500' : 'scale-100'}`}>
                      {inboxCount}
                    </span>
                  )}
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  Inbox & Notifications
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
              </div>
            </div>
            
            <button 
              onClick={onToggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform active:scale-90"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            
            <div className="relative" ref={settingsMenuRef}>
              <button onClick={() => setIsSettingsOpen(prev => !prev)} className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <img className="h-10 w-10 rounded-full object-cover" src={currentUser.imageUrls[0]} alt={currentUser.name} />
                <div className="hidden sm:flex flex-col items-start text-left">
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm leading-tight">{currentUser.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs leading-tight">@{currentUser.username}</span>
                </div>
                <svg className={`hidden sm:block w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isSettingsOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              
              {isSettingsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none py-1 z-10 animate-fade-in">
                   <a onClick={() => { onNavigate('myProfile'); setIsSettingsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">My Profile</a>
                   <a onClick={() => { onProfessionalDashboardClick(); setIsSettingsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">Professional Dashboard</a>
                   <a onClick={() => { onPrivacySettingsClick(); setIsSettingsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">Privacy Settings</a>
                   <a onClick={() => { onAppSettingsClick(); setIsSettingsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">App Permissions</a>
                   <a onClick={() => { onBlockedProfilesClick(); setIsSettingsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">Blocked Profiles</a>
                   <a onClick={() => { onReportedProfilesClick(); setIsSettingsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">Reported Profiles</a>
                   <a onClick={() => { onUserGuideClick(); setIsSettingsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">सहायता / गाइड (Help)</a>
                   <a onClick={() => { onInfoClick(); setIsSettingsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">App Info (ऐप जानकारी)</a>
                   {!currentUser.isVerified && <a onClick={() => { onGetVerifiedClick(); setIsSettingsOpen(false); }} className="block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">Get Verified</a>}
                   {isAdmin && (
                    <>
                     <div className="border-t my-1 dark:border-gray-700"></div>
                     <a onClick={() => { onNavigate('admin'); setIsSettingsOpen(false); }} className="flex items-center px-4 py-2 text-sm font-bold text-violet-700 dark:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <AdminIcon /> Admin Panel
                     </a>
                    </>
                   )}
                   <div className="border-t my-1 dark:border-gray-700"></div>
                   <a onClick={() => { onLogout(); setIsSettingsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">Logout</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 animate-slide-down">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                 <div className="relative p-2">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 dark:text-white focus:ring-violet-500 focus:border-violet-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <SearchIcon />
                  </div>
                </div>
                <a onClick={() => { onNavigate('dashboard'); setIsMobileMenuOpen(false); }} className={mobileNavLinkClasses('dashboard')}>Dashboard</a>
                <a onClick={() => { onNavigate('feed'); setIsMobileMenuOpen(false); }} className={mobileNavLinkClasses('feed')}>Feed</a>
                <a onClick={() => { onNavigate('likesHistory'); setIsMobileMenuOpen(false); }} className={mobileNavLinkClasses('likesHistory')}>Likes Post</a>
                <a onClick={() => { onProfessionalDashboardClick(); setIsMobileMenuOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium cursor-pointer transition-colors duration-300 text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50">
                    Professional Dashboard
                </a>
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;

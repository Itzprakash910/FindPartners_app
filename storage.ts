
import { Notification, ReportedProfileInfo, Profile, ErrorLog, AppRating, AppSettings } from '../types';

const FOLLOW_MAP_KEY = 'matrimony_follow_map';
const NOTIFICATIONS_KEY = 'matrimony_notifications';
const MUTED_USERS_KEY = 'matrimony_muted_users';
const REPORTS_KEY = 'matrimony_reports';
const VIEWS_KEY = 'matrimony_profile_views';
const BLOCK_MAP_KEY = 'matrimony_block_map';
const ERROR_LOGS_KEY = 'matrimony_error_logs';
const APP_RATINGS_KEY = 'matrimony_app_ratings';
const APP_SETTINGS_KEY = 'matrimony_app_settings';


// Follow Map
export const getFollowMap = (): Record<number, number[]> => {
    const storedMap = localStorage.getItem(FOLLOW_MAP_KEY);
    return storedMap ? JSON.parse(storedMap) : {};
};

export const saveFollowMap = (followMap: Record<number, number[]>): void => {
    try {
        localStorage.setItem(FOLLOW_MAP_KEY, JSON.stringify(followMap));
    } catch (e) {
        console.error("Failed to save follow map:", e);
    }
};

// Notifications
export const getNotifications = (): Notification[] => {
    const storedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
    return storedNotifications ? JSON.parse(storedNotifications) : [];
};

export const saveNotifications = (notifications: Notification[]): void => {
    try {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (e) {
        console.error("Failed to save notifications:", e);
    }
};

// Muted Users
export const getMutedUsers = (currentUserId: number): number[] => {
    const storedMuted = localStorage.getItem(MUTED_USERS_KEY);
    const mutedMap = storedMuted ? JSON.parse(storedMuted) : {};
    return mutedMap[currentUserId] || [];
};

export const saveMutedUsers = (currentUserId: number, mutedIds: number[]): void => {
    try {
        const storedMuted = localStorage.getItem(MUTED_USERS_KEY);
        const mutedMap = storedMuted ? JSON.parse(storedMuted) : {};
        mutedMap[currentUserId] = mutedIds;
        localStorage.setItem(MUTED_USERS_KEY, JSON.stringify(mutedMap));
    } catch (e) {
        console.error("Failed to save muted users:", e);
    }
};

// Reported Profiles
export const getReportedProfiles = (): ReportedProfileInfo[] => {
    const storedReports = localStorage.getItem(REPORTS_KEY);
    if (!storedReports) return [];
    
    const parsed = JSON.parse(storedReports);
    // Quick validation to handle cases where a reported profile might have been deleted
    return parsed.filter((report: ReportedProfileInfo) => report.profile);
};

export const saveReportedProfiles = (reports: ReportedProfileInfo[]): void => {
    try {
        localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch (e) {
        console.error("Failed to save reported profiles:", e);
    }
};

// Profile Views
export const getProfileViews = (): Record<number, { viewerId: number; timestamp: string }[]> => {
    const storedViews = localStorage.getItem(VIEWS_KEY);
    return storedViews ? JSON.parse(storedViews) : {};
};

export const saveProfileViews = (views: Record<number, { viewerId: number; timestamp: string }[]>): void => {
    try {
        localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
    } catch (e) {
        console.error("Failed to save profile views:", e);
    }
};

// Block Map
export const getBlockMap = (): Record<string, number[]> => {
    const storedMap = localStorage.getItem(BLOCK_MAP_KEY);
    return storedMap ? JSON.parse(storedMap) : {};
};

export const saveBlockMap = (blockMap: Record<string, number[]>): void => {
    try {
        localStorage.setItem(BLOCK_MAP_KEY, JSON.stringify(blockMap));
    } catch (e) {
        console.error("Failed to save block map:", e);
    }
};

// Error Logs
export const getErrorLogs = (): ErrorLog[] => {
    const stored = localStorage.getItem(ERROR_LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const saveErrorLogs = (logs: ErrorLog[]): void => {
    try {
        localStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
        console.error("Failed to save error logs:", e);
    }
};

// App Ratings
export const getAppRatings = (): AppRating[] => {
    const stored = localStorage.getItem(APP_RATINGS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const saveAppRatings = (ratings: AppRating[]): void => {
    try {
        localStorage.setItem(APP_RATINGS_KEY, JSON.stringify(ratings));
    } catch (e) {
        console.error("Failed to save app ratings:", e);
    }
};

// App Settings
export const getAppSettings = (): AppSettings => {
    const stored = localStorage.getItem(APP_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { cameraEnabled: true, microphoneEnabled: true, locationEnabled: true };
};

export const saveAppSettings = (settings: AppSettings): void => {
    try {
        localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save app settings:", e);
    }
};

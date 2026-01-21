
export interface PrivacySettings {
  showAge: boolean;
  showLocation: boolean;
  showOccupation: boolean;
  showFollowers: boolean;
  showReligion: boolean;
  showMotherTongue: boolean;
  showEducation: boolean;
  showHeight: boolean;
  showLifestyle: boolean;
  showSocialMedia: boolean;
}

export interface AppSettings {
    cameraEnabled: boolean;
    microphoneEnabled: boolean;
    locationEnabled: boolean;
}

export interface SocialMedia {
  platform: 'Instagram' | 'Twitter' | 'Facebook' | 'LinkedIn';
  url: string;
}

export interface Profile {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  age: number;
  gender: 'Male' | 'Female';
  religion: 'Hindu' | 'Muslim' | 'Sikh' | 'Christian' | 'Jain' | 'Buddhist';
  motherTongue: string;
  location: string;
  coordinates?: { // New field for location features
    latitude: number;
    longitude: number;
  };
  occupation: string;
  education: string;
  height: string; // e.g., "5' 8\""
  about: string;
  interests: string[];
  imageUrls: string[];
  lifestyle: 'Vegetarian' | 'Non-Vegetarian' | 'Occasionally Non-Vegetarian';
  isVerified: boolean;
  privacySettings?: PrivacySettings;
  socialMedia?: SocialMedia[];
  visitorCount?: number;
  joinedDate: string;
  shortlistedByCount?: number;
  blockedByCount?: number;
  lastSeen: string;
  isProfileComplete?: boolean;
  isEmailVerified?: boolean;
  verificationToken?: string;
}

export interface FilterCriteria {
  minAge: number;
  maxAge: number;
  religion: string[];
  gender: 'Male' | 'Female' | 'Any';
  education: string[];
  occupation: string[];
  lifestyle: string[];
  nearbyOnly?: boolean; // New filter criteria
}

export interface TextContent { type: 'text'; text: string; }
export interface ImageContent { type: 'image'; imageUrl: string; }
export interface VideoContent { type: 'video'; videoUrl: string; }
export interface AudioContent { type: 'audio'; audioUrl: string; }
export interface LocationContent { type: 'location'; latitude: number; longitude: number; }

export interface Message {
  id: number;
  content: TextContent | ImageContent | AudioContent | LocationContent | VideoContent;
  sender: 'user' | 'profile';
  timestamp: string;
  isRead?: boolean;
  isAdminMessage?: boolean;
}

export interface ReportedProfileInfo {
    reporterId: number;
    profile: Profile;
    reason: string;
    details?: string;
    date: string;
}

export interface Notification {
  id: number;
  recipientId: number;
  actorId: number;
  type: 'follow' | 'profile_view' | 'error_report' | 'like_post' | 'comment_post' | 'user_report' | 'comment_like' | 'comment_reply' | 'message';
  isRead: boolean;
  timestamp: string;
  message?: string;
  postId?: number;
}

export interface Comment {
  id: number;
  authorId: number;
  text: string;
  timestamp: string;
  likes: number[];
  replies: Comment[];
}

export interface Post {
  id: number;
  authorId: number;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  audioFileName?: string;
  timestamp: string;
  likes: number[];
  comments: Comment[];
  viewCount?: number;
  hideLikes?: boolean;
  hideViews?: boolean;
}

export interface AISuggestion {
  profileId: number;
  reason: string;
}

export interface ErrorLog {
    id: number;
    userId: number;
    username: string;
    errorName: string;
    errorMessage: string;
    timestamp: string;
    stackTrace?: string;
}

export interface AppRating {
    id: number;
    userId: number;
    userName: string;
    userImage: string;
    rating: number; // 1 to 5
    feedback: string;
    timestamp: string;
}

export interface HashtagResult {
    tag: string;
    count: number;
}

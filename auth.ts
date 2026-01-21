
import { Profile } from '../types';
import { mockProfiles } from '../data/mockProfiles';
import { currentUser } from '../data/currentUser';

const USERS_KEY = 'matrimony_users';

// Helper to validate the shape of a profile object from localStorage
const isProfileValid = (profile: any): profile is Profile => {
    return profile && Array.isArray(profile.imageUrls) && (typeof profile.email === 'string' || typeof profile.phone === 'string');
};

export const getInitialUsers = (): Profile[] => {
    const storedUsersRaw = localStorage.getItem(USERS_KEY);

    if (storedUsersRaw) {
        try {
            const storedUsers = JSON.parse(storedUsersRaw);
            // If the stored data is an array and every profile has the correct shape, use it.
            if (Array.isArray(storedUsers) && storedUsers.length > 0 && storedUsers.every(isProfileValid)) {
                return storedUsers;
            }
        } catch (e) {
            console.error("Failed to parse or validate stored users, resetting data.", e);
            // If parsing or validation fails, fall through to re-initialize.
        }
    }

    // This block runs if localStorage is empty, corrupted, or contains outdated data.
    console.warn("Re-initializing user data in localStorage due to missing, invalid, or outdated format.");
    
    // Default legacy users to true for email verification
    const initialUsers = [currentUser, ...mockProfiles].map(u => ({
        ...u, 
        isProfileComplete: true,
        isEmailVerified: true 
    }));
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    } catch (e) {
        console.error("Failed to initialize users in localStorage:", e);
    }
    
    return initialUsers;
};

// Initialize users on application load. This will now self-heal bad data.
getInitialUsers();

export const getUsers = (): Profile[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: Profile[]): void => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
        console.error("Failed to save users to localStorage (Storage Quota Exceeded):", e);
        alert("Warning: Local storage is full. Your profile changes may not be saved. Please clear some space or use smaller images.");
    }
};

export const findUser = (identifier: string): Profile | undefined => {
    const users = getUsers();
    const lowercasedIdentifier = identifier.toLowerCase();
    return users.find(user => user.phone === lowercasedIdentifier || user.email.toLowerCase() === lowercasedIdentifier);
};

export const authenticateUser = (identifier: string, password: string): Profile | null => {
    const users = getUsers();
    const lowerIdentifier = identifier.toLowerCase();
    
    // Check both email and phone for login
    const user = users.find(u => 
        u.email.toLowerCase() === lowerIdentifier || 
        (u.phone && u.phone === lowerIdentifier)
    );
    
    if (user && user.password === password) {
        // Check if email is verified. If the field is missing (legacy users), assume verified.
        if (user.isEmailVerified === false) {
            throw new Error('Your email address is not verified. Please check your inbox for the activation link.');
        }
        return user;
    }
    return null;
};

export const registerUser = (email: string, password: string): Profile => {
    const users = getUsers();
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email address already exists.');
    }

    const tempName = email.split('@')[0];
    const username = tempName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 100);
    const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    const userWithId: Profile = { 
        id: Date.now() + Math.random(), // simple unique ID
        name: '', // Will be collected in wizard
        email,
        password,
        username,
        phone: '', // Will be collected in wizard
        age: 18,
        gender: 'Female', // default
        religion: 'Hindu', // default
        motherTongue: '',
        location: '',
        occupation: '',
        education: '',
        height: '',
        about: '',
        interests: [],
        imageUrls: [`https://ui-avatars.com/api/?name=${encodeURIComponent(email.charAt(0))}&background=random&size=128&font-size=0.5`],
        lifestyle: 'Vegetarian', // default
        isVerified: false,
        joinedDate: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isProfileComplete: false, // <-- New flag for the wizard
        isEmailVerified: false, // <-- Email not verified by default
        verificationToken, // <-- Store token
        privacySettings: {
            showAge: true,
            showLocation: true,
            showOccupation: true,
            showFollowers: true,
            showReligion: true,
            showMotherTongue: true,
            showEducation: true,
            showHeight: true,
            showLifestyle: true,
            showSocialMedia: true,
        },
    };
    
    users.push(userWithId);
    saveUsers(users);
    
    return userWithId;
};

export const verifyUserEmail = (email: string, token: string): boolean => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) return false;
    
    const user = users[userIndex];
    if (user.verificationToken === token) {
        users[userIndex] = { ...user, isEmailVerified: true };
        saveUsers(users);
        return true;
    }
    
    return false;
};


import { Profile, AISuggestion } from '../types';

// AI Service is disabled/removed.
export const getSuggestedProfiles = async (currentUser: Profile, profiles: Profile[]): Promise<AISuggestion[]> => {
    return [];
};

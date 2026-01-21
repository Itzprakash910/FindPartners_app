import React, { useState, useEffect } from 'react';
import { Profile, AISuggestion } from '../types';
import { getSuggestedProfiles } from '../services/geminiService';
import SuggestedProfileCard from './SuggestedProfileCard';
import { SparkleIcon } from '../constants';
import Carousel from './Carousel';

interface SuggestedProfilesProps {
    currentUser: Profile;
    profiles: Profile[];
    onViewProfile: (profile: Profile) => void;
}

const ErrorDisplay = ({ message }: { message: string }) => {
    const isQuotaError = message.includes("Limit Reached");
    const docLink = "https://ai.google.dev/gemini-api/docs/rate-limits";

    const bgColor = isQuotaError ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30';
    const iconColor = isQuotaError ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
    const textColor = isQuotaError ? 'text-amber-800 dark:text-amber-300' : 'text-red-800 dark:text-red-300';

    return (
        <div className={`flex items-start p-4 rounded-lg ${bgColor}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mr-3 flex-shrink-0 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
                <p className={`text-sm font-medium ${textColor}`}>
                    {message}
                </p>
                {isQuotaError && (
                    <a href={docLink} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-200 hover:underline block">
                        Learn more about API quotas.
                    </a>
                )}
            </div>
        </div>
    );
};

const SuggestedProfiles: React.FC<SuggestedProfilesProps> = ({ currentUser, profiles, onViewProfile }) => {
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (profiles.length < 3) {
                setIsLoading(false);
                return;
            };
            try {
                setIsLoading(true);
                setError(null);
                const result = await getSuggestedProfiles(currentUser, profiles);
                setSuggestions(result);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [currentUser, profiles]);

    const getProfileById = (id: number) => profiles.find(p => p.id === id);

    const renderHeader = () => (
        <h3 className="text-2xl font-bold text-rose-800 dark:text-rose-400 mb-4 flex items-center">
            <SparkleIcon className="w-6 h-6 mr-2 text-amber-500" />
            AI Suggestions For You
        </h3>
    );

    if (isLoading) {
        return (
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                {renderHeader()}
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-800 dark:border-rose-400"></div>
                    <p className="ml-4 text-gray-600 dark:text-gray-300">Finding your perfect match...</p>
                </div>
            </div>
        );
    }
    
    if (suggestions.length === 0 && !error) {
        return null; // Don't show the component if there are no suggestions and no error
    }

    return (
        <div className="mb-12">
            {renderHeader()}
            {error ? (
                <ErrorDisplay message={error} />
            ) : (
                <Carousel>
                    {suggestions.map(suggestion => {
                        const profile = getProfileById(suggestion.profileId);
                        if (!profile) return null;
                        return (
                            <SuggestedProfileCard
                                key={profile.id}
                                profile={profile}
                                reason={suggestion.reason}
                                onViewProfile={onViewProfile}
                            />
                        );
                    })}
                </Carousel>
            )}
        </div>
    );
};

export default SuggestedProfiles;
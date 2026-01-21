import React, { useState } from 'react';
import { Profile, AppRating } from '../types';
import { formatTimestamp } from '../utils';

interface RateAppModalProps {
    currentUser: Profile;
    onClose: () => void;
    onSubmit: (rating: number, feedback: string) => void;
    existingRatings: AppRating[];
}

interface StarIconProps {
    filled: boolean;
    className?: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const StarIcon: React.FC<StarIconProps> = ({ filled, className, onClick, onMouseEnter, onMouseLeave }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={`w-8 h-8 transition-colors duration-200 cursor-pointer ${filled ? 'text-amber-400' : 'text-gray-300'} ${className}`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

const RateAppModal: React.FC<RateAppModalProps> = ({ currentUser, onClose, onSubmit, existingRatings }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0) {
            onSubmit(rating, feedback);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    <h2 className="text-xl font-bold">Rate Our App</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
                    <div className="text-center mb-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">How was your experience with FindPartners? We'd love to hear from you!</p>
                        <div className="flex justify-center gap-2 mb-4" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon 
                                    key={star} 
                                    filled={star <= (hoverRating || rating)} 
                                    onMouseEnter={() => setHoverRating(star)}
                                    onClick={() => setRating(star)}
                                    className="hover:scale-110 transform transition-transform"
                                />
                            ))}
                        </div>
                        {rating > 0 && <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">{rating} out of 5 stars</p>}
                    </div>

                    <form onSubmit={handleSubmit} className="mb-8 border-b dark:border-gray-700 pb-8">
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                            rows={4}
                            placeholder="Tell us what you liked or what we can improve..."
                        />
                        <div className="flex justify-end mt-4">
                            <button 
                                type="submit" 
                                disabled={rating === 0}
                                className="px-6 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    </form>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Recent Reviews</h3>
                        {existingRatings.length > 0 ? (
                            <div className="space-y-4">
                                {existingRatings.slice().reverse().map((review) => (
                                    <div key={review.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <img src={review.userImage} alt={review.userName} className="w-8 h-8 rounded-full object-cover" />
                                                <span className="font-semibold text-gray-900 dark:text-white text-sm">{review.userName}</span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(review.timestamp)}</span>
                                        </div>
                                        <div className="flex items-center mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        {review.feedback && <p className="text-sm text-gray-700 dark:text-gray-300">{review.feedback}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 italic">No reviews yet. Be the first!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RateAppModal;
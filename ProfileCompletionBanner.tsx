import React from 'react';

interface ProfileCompletionBannerProps {
  onCompleteProfile: () => void;
  onDismiss: () => void;
}

const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({ onCompleteProfile, onDismiss }) => {
  return (
    <div className="relative bg-gradient-to-r from-rose-700 to-amber-600 rounded-lg shadow-xl p-8 mb-12 text-white overflow-hidden animate-fade-in">
      <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full opacity-50"></div>
      <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white/10 rounded-full opacity-50"></div>
      
      <div className="relative z-10">
        <button onClick={onDismiss} className="absolute top-2 right-2 text-white/70 hover:text-white/100 transition-colors" aria-label="Dismiss">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold">Your Profile is Your Story</h2>
        <p className="mt-2 text-lg opacity-90">
          A complete profile helps you get <span className="font-bold">better suggestions</span> and <span className="font-bold">more matches</span>. Tell us a bit more about yourself!
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={onCompleteProfile}
            className="w-full sm:w-auto px-8 py-3 bg-white text-rose-800 font-semibold rounded-lg hover:bg-rose-50 transition-colors text-md shadow-md hover:shadow-lg"
          >
            Enhance My Profile
          </button>
          <button onClick={onDismiss} className="w-full sm:w-auto text-white/80 hover:text-white font-semibold transition-colors">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;

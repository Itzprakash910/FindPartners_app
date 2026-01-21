
import React, { useState } from 'react';
import { Profile, PrivacySettings } from '../types';

interface PrivacySettingsModalProps {
    profile: Profile;
    onClose: () => void;
    onSave: (updatedProfile: Profile) => void;
    onDeleteAccount: () => void;
}

const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({ profile, onClose, onSave, onDeleteAccount }) => {
    const [settings, setSettings] = useState<PrivacySettings>(
        profile.privacySettings ?? { 
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
        }
    );

    const handleToggle = (key: keyof PrivacySettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedProfile = { ...profile, privacySettings: settings };
        onSave(updatedProfile);
        onClose();
    };

    const Toggle = ({ label, isEnabled, onToggle }: { label: string, isEnabled: boolean, onToggle: () => void }) => (
        <div 
            onClick={onToggle}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        >
            <span className="font-medium text-gray-800 dark:text-gray-200">{label}</span>
            <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isEnabled ? 'bg-rose-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
        </div>
    );
    
    const SectionHeader = ({ title }: { title: string }) => (
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-3">{title}</h3>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-rose-800 dark:text-rose-400">Privacy Settings</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Choose what information you want to share on your profile. Hidden details will not be visible to other members.</p>
                    
                    <SectionHeader title="Basic Info" />
                    <div className="space-y-3">
                        <Toggle label="Show my Age" isEnabled={settings.showAge} onToggle={() => handleToggle('showAge')} />
                        <Toggle label="Show my Location" isEnabled={settings.showLocation} onToggle={() => handleToggle('showLocation')} />
                        <Toggle label="Show my Occupation" isEnabled={settings.showOccupation} onToggle={() => handleToggle('showOccupation')} />
                    </div>

                    <SectionHeader title="Detailed Info" />
                     <div className="space-y-3">
                        <Toggle label="Show my Religion" isEnabled={settings.showReligion} onToggle={() => handleToggle('showReligion')} />
                        <Toggle label="Show my Mother Tongue" isEnabled={settings.showMotherTongue} onToggle={() => handleToggle('showMotherTongue')} />
                        <Toggle label="Show my Education" isEnabled={settings.showEducation} onToggle={() => handleToggle('showEducation')} />
                        <Toggle label="Show my Height" isEnabled={settings.showHeight} onToggle={() => handleToggle('showHeight')} />
                        <Toggle label="Show my Lifestyle" isEnabled={settings.showLifestyle} onToggle={() => handleToggle('showLifestyle')} />
                    </div>

                    <SectionHeader title="Social & Connections" />
                     <div className="space-y-3">
                        <Toggle label="Show my Follower/Following count" isEnabled={settings.showFollowers} onToggle={() => handleToggle('showFollowers')} />
                        <Toggle label="Show my Social Media links" isEnabled={settings.showSocialMedia} onToggle={() => handleToggle('showSocialMedia')} />
                    </div>

                    <SectionHeader title="Danger Zone" />
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300 mb-3">Deleting your account is permanent. All your data, matches, and messages will be wiped.</p>
                        <button 
                            type="button" 
                            onClick={onDeleteAccount}
                            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors shadow-sm"
                        >
                            Delete Account
                        </button>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 mt-6 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-rose-800 text-white rounded-md hover:bg-rose-900">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrivacySettingsModal;

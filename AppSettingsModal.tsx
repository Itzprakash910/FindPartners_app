
import React, { useState } from 'react';
import { AppSettings } from '../types';

interface AppSettingsModalProps {
    currentSettings: AppSettings;
    onClose: () => void;
    onSave: (settings: AppSettings) => void;
}

const AppSettingsModal: React.FC<AppSettingsModalProps> = ({ currentSettings, onClose, onSave }) => {
    const [settings, setSettings] = useState<AppSettings>(currentSettings);

    const handleToggle = (key: keyof AppSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(settings);
        onClose();
    };

    const Toggle = ({ label, isEnabled, onToggle, description, icon }: { label: string, isEnabled: boolean, onToggle: () => void, description: string, icon: React.ReactNode }) => (
        <div 
            className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 mb-3"
        >
            <div className="flex items-start">
                <div className={`p-2 rounded-lg mr-3 ${isEnabled ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400'}`}>
                    {icon}
                </div>
                <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 block">{label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block pr-4">{description}</span>
                </div>
            </div>
            
            <button 
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isEnabled ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                role="switch" 
                aria-checked={isEnabled}
            >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
                    <h2 className="text-2xl font-bold text-violet-800 dark:text-violet-400">App Settings</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-white dark:bg-gray-800">
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                        Manage permissions for the FindPartners app. Disabling these will prevent the app from accessing these features on your device.
                    </p>
                    
                    <Toggle 
                        label="Camera Access" 
                        isEnabled={settings.cameraEnabled} 
                        onToggle={() => handleToggle('cameraEnabled')}
                        description="Used for video calls and taking profile photos."
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                    />

                    <Toggle 
                        label="Microphone Access" 
                        isEnabled={settings.microphoneEnabled} 
                        onToggle={() => handleToggle('microphoneEnabled')}
                        description="Used for audio/video calls and voice notes."
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                    />

                    <Toggle 
                        label="Location Access" 
                        isEnabled={settings.locationEnabled} 
                        onToggle={() => handleToggle('locationEnabled')}
                        description="Used to find matches nearby and filter your feed."
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    />

                    <div className="flex justify-end gap-3 mt-8 border-t dark:border-gray-700 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 shadow-md transition-colors font-medium">Save Settings</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppSettingsModal;


import React from 'react';

interface UserGuideModalProps {
    onClose: () => void;
}

const Section: React.FC<{ title: string; hindiTitle: string; children: React.ReactNode; icon: React.ReactNode; }> = ({ title, hindiTitle, children, icon }) => (
    <div className="mb-6">
        <h3 className="text-xl font-bold text-rose-800 dark:text-rose-400 mb-3 flex items-center">
            <div className="flex-shrink-0 w-8 h-8 mr-3 bg-rose-100 dark:bg-rose-900/50 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <span>{hindiTitle} / {title}</span>
        </h3>
        <div className="text-gray-700 dark:text-gray-300 space-y-3 text-base pl-11 border-l-2 border-rose-100 dark:border-rose-900/50 ml-4">
            {children}
        </div>
    </div>
);

const UserGuideModal: React.FC<UserGuideModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-2xl font-bold text-rose-800 dark:text-rose-400">सहायता केंद्र / App Guide</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="overflow-y-auto p-6 custom-scrollbar">

                    <Section 
                        title="Getting Started" 
                        hindiTitle="शुरुआत करना" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>}
                    >
                        <p><b>प्रोफ़ाइल निर्माण (Profile Creation):</b> Sign up and complete the 3-step wizard. Add a photo, bio, and lifestyle details to attract better matches.</p>
                        <p><b>सत्यापन (Verification):</b> Upload an ID to get the <span className="text-blue-500 font-bold">Blue Badge</span>. Verified profiles get more trust and visibility.</p>
                    </Section>

                    <Section 
                        title="Dashboard & Discovery" 
                        hindiTitle="डैशबोर्ड और खोज" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                    >
                         <p><b>फ़िल्टर (Filters):</b> Use the filter sidebar to find profiles by Age, Religion, Occupation, and more.</p>
                         <p><b>आस-पास (Nearby):</b> Toggle 'Profiles Near Me' to find people within 100km. <i>(Requires Location Permission)</i></p>
                         <p><b>शॉर्टलिस्ट (Shortlist):</b> Tap the ❤️ heart icon on a profile card to save them for later.</p>
                    </Section>
                    
                    <Section 
                        title="Social Feed" 
                        hindiTitle="सोशल फ़ीड" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                    >
                        <p><b>पोस्ट करें (Post):</b> Share your thoughts, photos, or even record <b>Voice Notes</b> directly in the feed!</p>
                        <p><b>हैशटैग (Hashtags):</b> Use #tags to categorize your posts. Click on any tag to see related content.</p>
                        <p><b>गोपनीयता (Post Privacy):</b> While creating a post, you can choose to hide like counts or view counts for that specific post.</p>
                    </Section>

                    <Section 
                        title="Professional Dashboard" 
                        hindiTitle="प्रोफेशनल डैशबोर्ड" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                    >
                        <p>Available on your profile page. View detailed analytics like:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Total Profile Views & Post Reach.</li>
                            <li>Top Fans (who likes your posts the most).</li>
                            <li>Traffic Sources (Feed vs Profile visits).</li>
                        </ul>
                    </Section>

                    <Section 
                        title="Chat & Calls" 
                        hindiTitle="बातचीत और कॉल" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                    >
                        <p><b>मैसेजिंग (Messaging):</b> Send text, images, videos, and audio clips. Long-press messages to delete them.</p>
                        <p><b>कॉलिंग (Calling):</b> High-quality Audio and Video calls available within the chat. <i>(Requires Camera/Mic Permissions)</i></p>
                    </Section>
                    
                    <Section 
                        title="Privacy & Safety" 
                        hindiTitle="सुरक्षा और सेटिंग्स" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                    >
                        <p><b>गोपनीयता सेटिंग्स (Privacy Settings):</b> Control who sees your Age, Income, Contact Info, etc., from the user menu.</p>
                        <p><b>ब्लॉक/रिपोर्ट (Block/Report):</b> Encountered a problem? Report users or block them instantly from their profile page.</p>
                        <p><b>अनुमतियाँ (Permissions):</b> Manage Camera, Microphone, and Location access in 'App Settings'.</p>
                    </Section>

                </div>
                 <div className="flex justify-end p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <button onClick={onClose} className="px-6 py-2 bg-rose-800 text-white rounded-md hover:bg-rose-900 transition-colors shadow-sm">Got it!</button>
                </div>
            </div>
        </div>
    );
};

export default UserGuideModal;

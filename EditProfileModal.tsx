
import React, { useState, useRef, useEffect } from 'react';
import { Profile, SocialMedia } from '../types';
import { compressImage } from '../utils';

interface EditProfileModalProps {
    profile: Profile;
    onClose: () => void;
    onSave: (updatedProfile: Profile) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, onClose, onSave }) => {
    const [formData, setFormData] = useState(profile);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Camera State & Refs
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        setFormData(profile);
    }, [profile]);

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value) : value }));
    };
    
    const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const interestsArray = e.target.value.split(',').map(item => item.trim());
        setFormData(prev => ({ ...prev, interests: interestsArray }));
    };

    const handleSocialChange = (platform: SocialMedia['platform'], url: string) => {
        setFormData(prev => {
            const existingSocials = prev.socialMedia ? [...prev.socialMedia] : [];
            const socialIndex = existingSocials.findIndex(s => s.platform === platform);

            if (socialIndex > -1) {
                if (url) {
                    existingSocials[socialIndex] = { ...existingSocials[socialIndex], url };
                } else {
                    existingSocials.splice(socialIndex, 1);
                }
            } else if (url) {
                existingSocials.push({ platform, url });
            }

            return { ...prev, socialMedia: existingSocials };
        });
    };
    
    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedBase64 = await compressImage(file);
                setFormData(prev => ({ ...prev, imageUrls: [compressedBase64] }));
            } catch (error) {
                console.error("Error processing image:", error);
                alert("Failed to process image. Please try a smaller file.");
            }
        }
    };

    // Camera Functions
    const handleStartCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } } 
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOpen(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const handleStopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const handleCapturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            const video = videoRef.current;
            
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Mirror the context to match the mirrored video preview
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Convert to Base64
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setFormData(prev => ({ ...prev, imageUrls: [dataUrl] }));
                handleStopCamera();
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };
    
    const inputStyle = "w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 focus:ring-rose-500 focus:border-rose-500";
    const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    
    const CameraIcon = ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
    
    const socialIconMap: Record<SocialMedia['platform'], React.ReactNode> = {
        Instagram: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.441c-3.171 0-3.535.012-4.762.069-2.825.129-3.922 1.229-4.05 4.05-.057 1.227-.069 1.592-.069 4.762s.012 3.535.069 4.762c.129 2.825 1.229 3.922 4.05 4.05 1.227.057 1.592.069 4.762.069s3.535-.012 4.762-.069c2.825-.129 3.922-1.229 4.05-4.05.057-1.227.069-1.592.069-4.762-.069zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm0 1.441a2.31 2.31 0 110 4.62 2.31 2.31 0 010-4.62zM18.803 6.11a1.425 1.425 0 10-2.85 0 1.425 1.425 0 002.85 0z"/></svg>,
        Twitter: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
        Facebook: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>,
        LinkedIn: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11-4.125 0 2.062 2.062 0 014.125 0zM7.142 20.452H3.555V9h3.587v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>,
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
                 <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-rose-800 dark:text-rose-400">Edit Your Profile</h2>
                    <button onClick={() => { handleStopCamera(); onClose(); }} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                    <div className="flex flex-col items-center mb-4">
                        {isCameraOpen ? (
                            <div className="w-full flex flex-col items-center">
                                <div className="relative w-full max-w-xs aspect-square bg-black rounded-lg overflow-hidden mb-4">
                                    <video 
                                        ref={videoRef} 
                                        autoPlay 
                                        playsInline 
                                        muted 
                                        className="w-full h-full object-cover transform -scale-x-100" 
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        type="button" 
                                        onClick={handleStopCamera} 
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCapturePhoto} 
                                        className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 font-semibold flex items-center"
                                    >
                                        <CameraIcon className="w-5 h-5 mr-2" />
                                        Capture
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="relative group w-32 h-32 mb-4">
                                    <img src={formData.imageUrls[0]} alt="Profile Preview" className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg" />
                                    <div 
                                        onClick={handleImageUploadClick} 
                                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={handleImageUploadClick} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold text-sm">
                                        Choose Photo
                                    </button>
                                    <button type="button" onClick={handleStartCamera} className="px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 rounded-md hover:bg-rose-200 dark:hover:bg-rose-900/50 font-semibold text-sm flex items-center">
                                        <CameraIcon className="w-4 h-4 mr-1.5" />
                                        Take Photo
                                    </button>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden" 
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className={labelStyle}>Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="age" className={labelStyle}>Age</label>
                            <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} className={inputStyle} />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="username" className={labelStyle}>Username (cannot be changed)</label>
                        <input type="text" name="username" id="username" value={formData.username} className={`${inputStyle} bg-gray-100 dark:bg-gray-800 cursor-not-allowed`} readOnly />
                    </div>
                     <div>
                        <label htmlFor="location" className={labelStyle}>Location</label>
                        <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className={inputStyle} />
                    </div>
                     <div>
                        <label htmlFor="occupation" className={labelStyle}>Occupation</label>
                        <input type="text" name="occupation" id="occupation" value={formData.occupation} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="about" className={labelStyle}>About Me</label>
                        <textarea name="about" id="about" value={formData.about} onChange={handleChange} rows={4} className={inputStyle}></textarea>
                    </div>
                    <div>
                        <label htmlFor="interests" className={labelStyle}>Interests (comma-separated)</label>
                        <input type="text" name="interests" id="interests" value={formData.interests.join(', ')} onChange={handleInterestsChange} className={inputStyle} />
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 border-t dark:border-gray-700 pt-4 mt-2">Social Links</h3>
                        <div className="space-y-3 mt-2">
                             {(['LinkedIn', 'Instagram', 'Twitter', 'Facebook'] as SocialMedia['platform'][]).map(platform => (
                                <div key={platform}>
                                    <label htmlFor={platform.toLowerCase()} className={labelStyle}>{platform}</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {socialIconMap[platform]}
                                        </div>
                                        <input
                                            type="url"
                                            name={platform.toLowerCase()}
                                            id={platform.toLowerCase()}
                                            value={formData.socialMedia?.find(s => s.platform === platform)?.url || ''}
                                            onChange={(e) => handleSocialChange(platform, e.target.value)}
                                            className={`${inputStyle} pl-10`}
                                            placeholder={`https://www.${platform.toLowerCase()}.com/username`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={() => { handleStopCamera(); onClose(); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-rose-800 text-white rounded-md hover:bg-rose-900">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;

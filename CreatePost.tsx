
import React, { useState, useRef } from 'react';
import { Profile } from '../types';
import { compressImage } from '../utils';

interface CreatePostProps {
  currentUser: Profile;
  onCreatePost: (postData: { text?: string; image?: File; audio?: Blob, audioFileName?: string, hideLikes?: boolean, hideViews?: boolean }) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onCreatePost }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [audio, setAudio] = useState<Blob | null>(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    // Privacy Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [hideLikes, setHideLikes] = useState(false);
    const [hideViews, setHideViews] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMsg(null);
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
            } catch (e) {
                console.error(e);
                setErrorMsg("Failed to load image.");
            }
        }
    };

    const handleRecordAudio = async () => {
        setErrorMsg(null);
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    setAudio(audioBlob);
                    setAudioPreviewUrl(URL.createObjectURL(audioBlob));
                    audioChunksRef.current = [];
                     // Stop all tracks to release microphone
                    stream.getTracks().forEach(track => track.stop());
                };
                audioChunksRef.current = [];
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err: any) {
                // Use warn to avoid console error noise for permission issues
                console.warn("Microphone access warning:", err.message);
                
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setErrorMsg("Microphone access denied. Please allow microphone access in your browser settings to record audio.");
                } else if (err.name === 'NotFoundError') {
                    setErrorMsg("No microphone found on this device.");
                } else {
                    setErrorMsg("Could not access the microphone. Please check your browser permissions.");
                }
            }
        }
    };
    
    const removeAudio = () => {
        setAudio(null);
        if (audioPreviewUrl) {
            URL.revokeObjectURL(audioPreviewUrl);
            setAudioPreviewUrl(null);
        }
    };

    const removeImage = () => {
        setImage(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    const handleSubmit = () => {
        if (!text.trim() && !image && !audio) return;
        onCreatePost({ 
            text: text.trim(), 
            image: image ?? undefined, 
            audio: audio ?? undefined, 
            audioFileName: audio ? `recording-${Date.now()}.webm` : undefined,
            hideLikes,
            hideViews
        });
        setText('');
        removeImage();
        removeAudio();
        setErrorMsg(null);
        setHideLikes(false);
        setHideViews(false);
        setShowSettings(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8">
            <div className="flex items-start">
                <img src={currentUser.imageUrls[0]} alt="You" className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 ml-4">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg p-3 focus:ring-rose-500 focus:border-rose-500 text-gray-800 dark:text-white"
                        placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}? Use #hashtags to reach more people!`}
                        rows={3}
                    />
                    {errorMsg && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                            {errorMsg}
                        </div>
                    )}
                </div>
            </div>

            {imagePreview && (
                 <div className="mt-4 relative w-full sm:w-1/2 ml-16">
                    <img src={imagePreview} alt="Preview" className="rounded-lg w-full h-auto object-cover" />
                    <button onClick={removeImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/75">&times;</button>
                </div>
            )}
            {audioPreviewUrl && (
                 <div className="mt-4 flex items-center gap-2 ml-16">
                    <audio src={audioPreviewUrl} controls />
                    <button onClick={removeAudio} className="bg-red-500/20 text-red-700 dark:text-red-300 rounded-full p-1.5 hover:bg-red-500/40">&times;</button>
                </div>
            )}

            {/* Post Settings Section */}
            {showSettings && (
                <div className="mt-3 ml-16 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 animate-fade-in">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Post Privacy Settings</h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={hideLikes} 
                                onChange={(e) => setHideLikes(e.target.checked)} 
                                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Hide Like Count</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={hideViews} 
                                onChange={(e) => setHideViews(e.target.checked)} 
                                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Hide View Count</span>
                        </label>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                    <button onClick={() => imageInputRef.current?.click()} className="flex items-center text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 p-2 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                        Photo
                    </button>
                    <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    
                     <button onClick={handleRecordAudio} className={`flex items-center p-2 rounded-lg transition-colors ${isRecording ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 animate-pulse' : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        {isRecording ? 'Stop Recording' : 'Audio'}
                    </button>

                    <button 
                        onClick={() => setShowSettings(!showSettings)} 
                        className={`flex items-center p-2 rounded-lg transition-colors ${showSettings ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                        title="Post Settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
                 <button onClick={handleSubmit} className="px-6 py-2 bg-rose-700 text-white font-semibold rounded-lg hover:bg-rose-800 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!text.trim() && !image && !audio}>
                    Post
                </button>
            </div>
        </div>
    );
};

export default CreatePost;

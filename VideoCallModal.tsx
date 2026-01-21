
import React, { useEffect, useRef, useState } from 'react';
import { Profile, AppSettings } from '../types';

interface VideoCallModalProps {
    profile: Profile;
    onEndCall: () => void;
    isVideo: boolean; // true for video call, false for audio call
    appSettings: AppSettings;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ profile, onEndCall, isVideo, appSettings }) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null); // Use ref for reliable cleanup
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(!isVideo);
    const [callStatus, setCallStatus] = useState('Connecting...');
    const [duration, setDuration] = useState(0);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Timer for call duration
    useEffect(() => {
        let timer: number;
        if (callStatus === 'Connected') {
            timer = window.setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [callStatus]);

    useEffect(() => {
        let isMounted = true;

        const startStream = async () => {
            if (isDemoMode) return;

            setPermissionDenied(false);
            setErrorMsg(null);
            setCallStatus('Connecting...');
            
            // App Settings Check
            if (!appSettings.microphoneEnabled) {
                if (isMounted) {
                    setCallStatus('Access Denied');
                    setErrorMsg("Microphone is disabled in App Settings.");
                    setPermissionDenied(true);
                }
                return;
            }

            if (isVideo && !appSettings.cameraEnabled) {
                 if (isMounted) {
                    setCallStatus('Access Denied');
                    setErrorMsg("Camera is disabled in App Settings.");
                    setPermissionDenied(true);
                 }
                 return;
            }
            
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                if (isMounted) {
                    setCallStatus('Not Supported');
                    setErrorMsg("Media devices are not supported in this browser context (try HTTPS).");
                    setPermissionDenied(true);
                }
                return;
            }

            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: isVideo ? { facingMode: "user" } : false,
                    audio: true
                });
                
                if (!isMounted) {
                    mediaStream.getTracks().forEach(track => track.stop());
                    return;
                }

                streamRef.current = mediaStream;
                setStream(mediaStream);
                
                if (localVideoRef.current && isVideo) {
                    localVideoRef.current.srcObject = mediaStream;
                }

                // Simulate connection delay
                setTimeout(() => {
                    if (isMounted) setCallStatus('Connected');
                }, 1500);

            } catch (err: any) {
                if (!isMounted) return;

                console.warn("Media access warning:", err.message); // Warn instead of Error to reduce noise
                setPermissionDenied(true);
                
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied')) {
                    setCallStatus('Permission Denied');
                    setErrorMsg("Access to camera/microphone was denied.");
                } else if (err.name === 'NotFoundError') {
                    setCallStatus('Device Not Found');
                    setErrorMsg("No camera or microphone found.");
                } else {
                    setCallStatus('Connection Failed');
                    setErrorMsg(err.message || "An unknown error occurred.");
                }
            }
        };

        startStream();

        return () => {
            isMounted = false;
            // Cleanup: Stop all tracks when component unmounts
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [isVideo, appSettings, isDemoMode]);

    // Toggle Microphone
    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMicMuted(!isMicMuted);
        } else if (isDemoMode) {
            setIsMicMuted(!isMicMuted);
        }
    };

    // Toggle Camera
    const toggleCamera = () => {
        if (!appSettings.cameraEnabled && !isDemoMode) {
            alert("Camera is disabled in App Settings.");
            return;
        }
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
                videoTracks.forEach(track => {
                    track.enabled = !track.enabled;
                });
                setIsCameraOff(!isCameraOff);
            } else {
               // If audio only, we can't switch to video easily
            }
        } else if (isDemoMode) {
            setIsCameraOff(!isCameraOff);
        }
    };

    const enterDemoMode = () => {
        setIsDemoMode(true);
        setPermissionDenied(false);
        setErrorMsg(null);
        setCallStatus('Connected');
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-gray-900 z-[60] flex flex-col h-full w-full animate-fade-in">
            {/* Main Remote Video Area (Simulated for Demo) */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-4">
                
                {/* Background Blur Effect using Profile Pic */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl"
                    style={{ backgroundImage: `url(${profile.imageUrls[0]})` }}
                ></div>

                {/* Remote User Content or Error Message */}
                <div className="relative z-10 flex flex-col items-center max-w-md text-center">
                    {permissionDenied ? (
                        <div className="bg-red-500/20 backdrop-blur-md p-6 rounded-xl border border-red-500/50 mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 className="text-white font-bold text-lg">{callStatus}</h3>
                            <p className="text-gray-200 mt-2 mb-4">{errorMsg}</p>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => { setIsDemoMode(false); setCallStatus('Connecting...'); }}
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-semibold"
                                >
                                    Retry Connection
                                </button>
                                <button 
                                    onClick={enterDemoMode}
                                    className="px-4 py-2 bg-transparent border border-white/30 hover:bg-white/10 text-white rounded-lg transition-colors text-sm"
                                >
                                    Continue in Demo Mode
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative mb-6">
                            <img 
                                src={profile.imageUrls[0]} 
                                alt={profile.name} 
                                className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-gray-700 shadow-2xl ${callStatus === 'Connected' ? 'animate-pulse' : ''}`} 
                            />
                            {callStatus === 'Connected' && <span className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-gray-900 rounded-full"></span>}
                        </div>
                    )}
                    
                    {!permissionDenied && (
                        <>
                            <h2 className="text-3xl font-bold text-white mb-2">{profile.name}</h2>
                            <p className="text-lg text-gray-300 font-medium tracking-wide">
                                {callStatus === 'Connected' ? formatDuration(duration) : callStatus}
                            </p>
                            {isDemoMode && <span className="text-xs text-yellow-400 mt-2 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">Demo Mode</span>}
                        </>
                    )}
                </div>

                {/* Local User Video (Picture in Picture) */}
                {!permissionDenied && isVideo && !isDemoMode && (
                    <div className="absolute top-4 right-4 w-32 sm:w-48 aspect-[3/4] bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                        {!isCameraOff ? (
                            <video 
                                ref={localVideoRef} 
                                autoPlay 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover transform -scale-x-100" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L9 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" transform="rotate(135 10 10)" /> 
                                    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                                </svg>
                                <span className="text-xs text-gray-400 absolute bottom-2">Camera Off</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="bg-gray-800/80 backdrop-blur-md p-6 pb-8 rounded-t-3xl flex items-center justify-center gap-6 sm:gap-10 shadow-lg border-t border-gray-700/50">
                
                {/* Mute Button */}
                <button 
                    onClick={toggleMic}
                    disabled={permissionDenied && !isDemoMode}
                    className={`p-4 rounded-full transition-all duration-300 ${isMicMuted ? 'bg-white text-gray-900' : 'bg-gray-600/50 text-white hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isMicMuted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12.732a1 1 0 01-1.707.707L4.586 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.586l3.707-3.414a1 1 0 011.09-.51zM13.293 6.293a1 1 0 011.414 0 5 5 0 010 7.414 1 1 0 01-1.414-1.414 3 3 0 000-4.586 1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    )}
                </button>

                {/* End Call Button */}
                <button 
                    onClick={onEndCall}
                    className="p-5 bg-red-600 rounded-full text-white shadow-lg hover:bg-red-700 transform hover:scale-110 transition-all duration-300 ring-4 ring-red-600/30"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" transform="rotate(135 10 10)" />
                    </svg>
                </button>

                {/* Toggle Camera Button */}
                {isVideo && (
                    <button 
                        onClick={toggleCamera}
                        disabled={(!isVideo || permissionDenied) && !isDemoMode} 
                        className={`p-4 rounded-full transition-all duration-300 ${isCameraOff ? 'bg-white text-gray-900' : 'bg-gray-600/50 text-white hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isCameraOff ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L9 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default VideoCallModal;

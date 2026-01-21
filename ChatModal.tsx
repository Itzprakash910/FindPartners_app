
import React, { useState, useEffect, useRef } from 'react';
import { Profile, Message, AppSettings } from '../types';
import VerifiedBadge from './VerifiedBadge';
import { formatTimestamp, formatLastSeen } from '../utils';
import VideoCallModal from './VideoCallModal';
import ConfirmActionModal from './ConfirmActionModal';

interface ChatModalProps {
  profile: Profile;
  onClose: () => void;
  onNewMessage: (profileId: number, message: Message) => void;
  initialMessages: Message[];
  onClearChat: (profileId: number) => void;
  onViewProfile?: (profile: Profile) => void;
  onDeleteMessages?: (profileId: number, messageIds: number[]) => void;
  onUpdateMessage?: (profileId: number, messageId: number, updates: Partial<Message>) => void;
  appSettings: AppSettings;
}

// Icon for Sent/Delivered/Read status
const MessageStatusIcon = ({ isRead, timestamp }: { isRead: boolean, timestamp: string }) => {
    // Logic to simulate "Delivered" vs "Read". 
    const isDelivered = new Date().getTime() - new Date(timestamp).getTime() > 1000;

    if (isRead) {
        // Double Blue Tick (Read)
        return (
            <div className="flex items-center -space-x-1">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-blue-400" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-blue-400" fill="currentColor" style={{ marginTop: '-2px' }}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
            </div>
        );
    } 
    
    if (isDelivered) {
        // Double Grey Tick (Delivered)
        return (
            <div className="flex items-center -space-x-1">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-gray-400" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-gray-400" fill="currentColor" style={{ marginTop: '-2px' }}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
            </div>
        );
    }

    // Single Grey Tick (Sent)
    return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-gray-400" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
    );
};

const ChatModal: React.FC<ChatModalProps> = ({ profile, onClose, onNewMessage, initialMessages, onClearChat, onViewProfile, onDeleteMessages, onUpdateMessage, appSettings }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<number>>(new Set());

  // Delete Confirmation State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: 'clear' | 'delete_selected' | null }>({ isOpen: false, type: null });

  // Call States
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  // Long press refs
  const longPressTimerRef = useRef<number | null>(null);

  // Derive status from profile
  const { text: statusText, isOnline } = formatLastSeen(profile.lastSeen);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    // Only scroll to bottom if NOT in selection mode, to avoid jumping while selecting
    if (!isSelectionMode) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isCurrentUserTyping, isSelectionMode]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
              setShowOptions(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, []);

  // Helper to mark message as read after a delay to simulate "Seen" status
  const simulateMessageSeen = (messageId: number) => {
      setTimeout(() => {
          if (onUpdateMessage) {
              onUpdateMessage(profile.id, messageId, { isRead: true });
          } else {
              setMessages(prevMessages => 
                  prevMessages.map(msg => 
                      msg.id === messageId ? { ...msg, isRead: true } : msg
                  )
              );
          }
      }, 3000); // 3 seconds delay for "Seen" tick
  };
  
  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim()) return;

    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }
    setIsCurrentUserTyping(false);

    const messageId = Date.now();
    const userMessage: Message = {
      id: messageId,
      content: { type: 'text', text: messageText },
      sender: 'user',
      timestamp: new Date().toISOString(),
      isRead: false, // Initially unread
    };
    
    // Optimistic update
    setMessages(prev => [...prev, userMessage]);
    onNewMessage(profile.id, userMessage);
    setNewMessage('');
    setErrorMsg(null);
    
    // Simulate the other user reading the message after a delay
    simulateMessageSeen(messageId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    setErrorMsg(null);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim()) {
      setIsCurrentUserTyping(true);
      typingTimeoutRef.current = window.setTimeout(() => {
        setIsCurrentUserTyping(false);
      }, 1500);
    } else {
      setIsCurrentUserTyping(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      setErrorMsg(null);
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
          const url = reader.result as string;
          const messageId = Date.now();
          const userMessage: Message = {
              id: messageId,
              content: type === 'image' ? { type: 'image', imageUrl: url } : { type: 'video', videoUrl: url },
              sender: 'user',
              timestamp: new Date().toISOString(),
              isRead: false,
          };
          setMessages(prev => [...prev, userMessage]);
          onNewMessage(profile.id, userMessage);
          simulateMessageSeen(messageId);
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
  };

  const handleAudioRecord = async () => {
      setErrorMsg(null);
      if (!appSettings.microphoneEnabled) {
          setErrorMsg("Microphone is disabled in App Settings.");
          return;
      }

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
                  const url = URL.createObjectURL(audioBlob);
                  
                  const messageId = Date.now();
                  const userMessage: Message = {
                      id: messageId,
                      content: { type: 'audio', audioUrl: url },
                      sender: 'user',
                      timestamp: new Date().toISOString(),
                      isRead: false
                  };
                  setMessages(prev => [...prev, userMessage]);
                  onNewMessage(profile.id, userMessage);
                  simulateMessageSeen(messageId);
                  
                  audioChunksRef.current = [];
                  stream.getTracks().forEach(track => track.stop());
              };
              mediaRecorderRef.current.start();
              setIsRecording(true);
          } catch (err: any) {
              console.warn("Microphone access error:", err);
              setErrorMsg("Could not access microphone.");
          }
      }
  }

  const handleCall = (type: 'audio' | 'video') => {
      setCallType(type);
      setIsInCall(true);
      setErrorMsg(null);
      
      const messageId = Date.now();
      const callText = type === 'video' ? '📹 Video Call' : '📞 Audio Call';
      
      const callMessage: Message = {
          id: messageId,
          content: { type: 'text', text: callText },
          sender: 'user',
          timestamp: new Date().toISOString(),
          isRead: true, 
          isAdminMessage: true 
      };
      
      setMessages(prev => [...prev, callMessage]);
      onNewMessage(profile.id, callMessage);
  };
  
  const handleEndCall = () => {
      setIsInCall(false);
  }

  // Triggered from dropdown
  const handleClearChatClick = () => {
      setConfirmModal({ isOpen: true, type: 'clear' });
      setShowOptions(false);
  };

  // Triggered from header button
  const handleDeleteSelectedClick = () => {
      if (selectedMessageIds.size === 0) return;
      setConfirmModal({ isOpen: true, type: 'delete_selected' });
  };

  // Confirmed Action
  const handleConfirmAction = () => {
      if (confirmModal.type === 'clear') {
          onClearChat(profile.id);
          setMessages([]);
          setErrorMsg(null);
      } else if (confirmModal.type === 'delete_selected') {
          if (onDeleteMessages) {
              onDeleteMessages(profile.id, Array.from(selectedMessageIds));
          }
          // Update local state immediately
          setMessages(prev => prev.filter(m => !selectedMessageIds.has(m.id)));
          setIsSelectionMode(false);
          setSelectedMessageIds(new Set());
      }
      setConfirmModal({ isOpen: false, type: null });
  };

  const handleHeaderClick = () => {
      if (!isSelectionMode && onViewProfile) {
          onViewProfile(profile);
      }
  };

  // Selection Logic
  const handleToggleSelectionMode = () => {
      setIsSelectionMode(!isSelectionMode);
      setSelectedMessageIds(new Set());
      setShowOptions(false);
  };

  const handleSelectMessage = (messageId: number) => {
      const newSelected = new Set(selectedMessageIds);
      if (newSelected.has(messageId)) {
          newSelected.delete(messageId);
      } else {
          newSelected.add(messageId);
      }
      setSelectedMessageIds(newSelected);
      if (newSelected.size === 0) {
          setIsSelectionMode(false);
      }
  };

  // Long Press Handlers
  const handleMessageTouchStart = (id: number) => {
      if (isSelectionMode) return;
      longPressTimerRef.current = window.setTimeout(() => {
          setIsSelectionMode(true);
          setSelectedMessageIds(new Set([id]));
          if (navigator.vibrate) navigator.vibrate(50);
      }, 500);
  };

  const handleMessageTouchEnd = () => {
      if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
      }
  };

  const renderMessageContent = (msg: Message) => {
      switch (msg.content.type) {
          case 'text':
              return <p className="text-sm sm:text-base break-words leading-relaxed whitespace-pre-wrap">{msg.content.text}</p>;
          case 'image':
              return <img src={msg.content.imageUrl} alt="Sent" className="max-w-[240px] w-full rounded-lg shadow-sm" />;
          case 'video':
              return <video src={msg.content.videoUrl} controls className="max-w-[240px] w-full rounded-lg shadow-sm" />;
          case 'audio':
              return <audio src={msg.content.audioUrl} controls className="max-w-[220px]" />;
          case 'location':
              const { latitude, longitude } = msg.content;
              const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
              return (
                  <div className="rounded-lg overflow-hidden max-w-[250px] w-full border border-gray-200 dark:border-gray-600">
                      <iframe title="Map" width="100%" height="150" src={mapUrl} className="border-0" allowFullScreen></iframe>
                  </div>
              );
          default:
              return null;
      }
  };

  const chatBgPattern = `
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.05">
      <path d="M15 15 L45 45 M45 15 L15 45" stroke="currentColor" stroke-width="2"/>
    </svg>
  `;
  const chatBgStyle = {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(chatBgPattern)}")`
  };

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-0 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 sm:rounded-2xl shadow-2xl w-full max-w-lg flex flex-col h-full sm:max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 transition-colors duration-300 ${isSelectionMode ? 'bg-violet-50 dark:bg-violet-900/20' : 'bg-white dark:bg-gray-800'}`}>
           {isSelectionMode ? (
               <div className="flex items-center justify-between w-full animate-fade-in">
                   <div className="flex items-center gap-4">
                        <button onClick={() => { setIsSelectionMode(false); setSelectedMessageIds(new Set()); }} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <span className="text-lg font-bold text-gray-800 dark:text-white">
                            {selectedMessageIds.size} Selected
                        </span>
                   </div>
                   <button 
                        onClick={handleDeleteSelectedClick} 
                        className="p-2.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                        title="Delete Selected"
                   >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
               </div>
           ) : (
               <>
               <div className="flex items-center gap-1">
                   <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div 
                        className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={handleHeaderClick}
                    >
                        <div className="relative">
                           <img src={profile.imageUrls[0]} alt={profile.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                           {isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>}
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center leading-none">
                                {profile.name}
                                {profile.isVerified && <VerifiedBadge className="ml-1 w-3.5 h-3.5" />}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {isOnline ? <span className="text-green-600 dark:text-green-400 font-medium">Online</span> : statusText}
                            </p>
                        </div>
                    </div>
               </div>
               
               <div className="flex items-center gap-1">
                    <button onClick={() => handleCall('audio')} className="p-2.5 rounded-full text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors" title="Audio Call">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                    </button>
                    <button onClick={() => handleCall('video')} className="p-2.5 rounded-full text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors" title="Video Call">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                    </button>
                    <div className="relative" ref={optionsRef}>
                        <button onClick={() => setShowOptions(!showOptions)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </button>
                        {showOptions && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-20 origin-top-right animate-pop-in">
                                <button onClick={handleToggleSelectionMode} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Select Messages
                                </button>
                                <button onClick={handleClearChatClick} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center border-t dark:border-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Clear Chat History
                                </button>
                            </div>
                        )}
                    </div>
               </div>
               </>
           )}
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-violet-50 dark:bg-gray-900 relative text-gray-900 dark:text-gray-100" style={chatBgStyle}>
          {errorMsg && (
            <div className="sticky top-2 z-20 mx-auto w-max px-4 py-2 bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-full text-red-700 dark:text-red-300 text-xs font-medium shadow-md flex items-center mb-4 animate-slide-down">
                {errorMsg}
                <button onClick={() => setErrorMsg(null)} className="ml-2 hover:text-red-900 dark:hover:text-red-100">&times;</button>
            </div>
          )}
          
          <div className="flex flex-col space-y-1.5 pb-2">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full pt-20 text-center opacity-60">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No messages yet.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start the conversation by saying Hi! 👋</p>
                </div>
            ) : (
                messages.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    const isAdminMsg = msg.isAdminMessage && !isUser;
                    const isSelected = selectedMessageIds.has(msg.id);
                    
                    // Grouping logic for visuals
                    const prevMsg = messages[index - 1];
                    const isSameSender = prevMsg && prevMsg.sender === msg.sender && !prevMsg.isAdminMessage && !msg.isAdminMessage;
                    
                    return (
                        <div 
                            key={msg.id}
                            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} ${isSameSender ? 'mt-0.5' : 'mt-3'} ${isSelectionMode ? 'cursor-pointer' : ''}`}
                            onClick={isSelectionMode ? () => handleSelectMessage(msg.id) : undefined}
                            onTouchStart={() => handleMessageTouchStart(msg.id)}
                            onTouchEnd={handleMessageTouchEnd}
                            onMouseDown={() => handleMessageTouchStart(msg.id)}
                            onMouseUp={handleMessageTouchEnd}
                        >
                            <div className={`relative max-w-[80%] sm:max-w-[70%] group flex ${isSelectionMode && isSelected ? 'opacity-80' : ''}`}>
                                
                                {/* Selection Checkbox */}
                                {isSelectionMode && (
                                    <div className={`flex items-center justify-center mr-3 ${isUser ? 'order-last ml-3 mr-0' : ''}`}>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-violet-600 border-violet-600 scale-110' : 'border-gray-400 bg-white/50'}`}>
                                            {isSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                                        </div>
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div 
                                    className={`px-3 py-2 shadow-sm relative text-sm sm:text-base transition-all duration-200
                                    ${isAdminMsg 
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 border border-blue-200 dark:border-blue-800 rounded-lg mx-auto text-center w-max px-6 py-1.5 text-xs' 
                                        : isUser 
                                            ? `bg-violet-600 text-white rounded-2xl ${isSameSender ? 'rounded-tr-md' : 'rounded-tr-none'}` 
                                            : `bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-2xl ${isSameSender ? 'rounded-tl-md' : 'rounded-tl-none'}`
                                    } 
                                    ${isSelected ? 'ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}
                                >
                                    <div className={isAdminMsg ? 'flex justify-center' : ''}>
                                        {renderMessageContent(msg)}
                                    </div>
                                    
                                    {!isAdminMsg && (
                                        <div className={`flex items-center justify-end gap-1 mt-1 select-none ${isUser ? 'text-violet-100' : 'text-gray-400'}`}>
                                            <span className="text-[10px] opacity-90">{formatTimestamp(msg.timestamp)}</span>
                                            {isUser && <MessageStatusIcon isRead={!!msg.isRead} timestamp={msg.timestamp} />}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 sm:p-3 ${isSelectionMode ? 'opacity-50 pointer-events-none' : ''}`}>
            <div style={{ height: '20px' }}>
              {isCurrentUserTyping && (
                  <div className="flex items-center space-x-1 px-4 mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">typing</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  </div>
              )}
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(newMessage); }} className="flex items-center gap-2">
              <div className="flex gap-1 sm:gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors bg-gray-100 dark:bg-gray-700 rounded-full" title="Photo">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </button>
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />

                  <button type="button" onClick={handleAudioRecord} className={`p-2.5 rounded-full transition-all ${isRecording ? 'text-white bg-red-500 animate-pulse shadow-lg ring-2 ring-red-300' : 'text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 bg-gray-100 dark:bg-gray-700'}`} title={isRecording ? "Stop Recording" : "Record Audio"}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </button>
              </div>

              <input 
                type="text" 
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..." 
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-shadow placeholder-gray-500 dark:placeholder-gray-400"
              />
              
              <button 
                type="submit" 
                className="bg-violet-600 text-white p-3 rounded-full hover:bg-violet-700 transition-all duration-300 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md transform active:scale-95 flex items-center justify-center" 
                disabled={!newMessage.trim()}
              >
                <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
        </div>
      </div>
    </div>
    
    {isInCall && (
        <VideoCallModal 
            profile={profile} 
            onEndCall={handleEndCall} 
            isVideo={callType === 'video'}
            appSettings={appSettings}
        />
    )}

    {confirmModal.isOpen && (
        <ConfirmActionModal 
            isOpen={confirmModal.isOpen} 
            onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
            onConfirm={handleConfirmAction}
            title={confirmModal.type === 'clear' ? 'Clear Chat?' : 'Delete Messages?'}
            message={confirmModal.type === 'clear' 
                ? "This will delete your copy of the conversation history. This cannot be undone." 
                : `Are you sure you want to delete ${selectedMessageIds.size} message(s)? This cannot be undone.`}
            confirmButtonText="Delete"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
        />
    )}
    </>
  );
};

export default ChatModal;

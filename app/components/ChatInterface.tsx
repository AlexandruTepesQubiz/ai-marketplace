'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import AuthModal from './AuthModal';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'system';
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { user, signOut, loading } = useAuth();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);

        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Add system message
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: 'Recording... Click the microphone again to stop.',
        type: 'system',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMessage]);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userMessage: Message = {
          id: Date.now().toString(),
          text: data.text,
          type: 'user',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
      } else {
        console.error('Transcription error:', data.error);
        alert(`Transcription failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleMicClick = () => {
    // Require authentication before recording
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    setMessages([]);
  };

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U';
    const names = user.user_metadata.full_name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Voice-First Marketplace
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {user ? 'Click the microphone to start speaking' : 'Sign in to start using the marketplace'}
            </p>
          </div>

          {/* Auth Section */}
          {loading ? (
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {getUserInitials()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <p className="text-lg font-medium">
                {user ? 'No messages yet' : 'Welcome to AI Marketplace'}
              </p>
              <p className="text-sm mt-2">
                {user
                  ? 'Click the microphone to start a conversation'
                  : 'Sign in to start buying and selling with voice'}
              </p>
              {!user && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {isTranscribing && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3">
              <p className="text-sm">Transcribing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Microphone Button */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-6">
        <div className="flex items-center justify-center">
          <button
            onClick={handleMicClick}
            disabled={isTranscribing}
            className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : isTranscribing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-110'
            }`}
          >
            {isRecording ? (
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
          {isRecording
            ? 'Recording... Click to stop'
            : isTranscribing
            ? 'Transcribing your message...'
            : 'Click to start recording'}
        </p>
      </div>
    </div>
  );
}

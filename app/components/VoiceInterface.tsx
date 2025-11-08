'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useConversation } from '@elevenlabs/react';
import { Button } from '@/components/ui/button';

export default function VoiceInterface() {
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setConversationStarted(true);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setConversationStarted(false);
      setIsListening(false);
    },
    onMessage: (message) => {
      console.log('Message:', message);
    },
    onError: (error) => {
      console.error('Conversation error:', error);
    },
    onModeChange: ({ mode }) => {
      setIsListening(mode === 'listening');
    },
  });

  const startConversation = async () => {
    if (!user) return;

    try {
      // Get signed URL from backend
      const response = await fetch('/api/elevenlabs/signed-url', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to get signed URL');
      }

      const { signedUrl, userId, userName } = await response.json();

      // Start session with signed URL
      await conversation.startSession({
        signedUrl,
        overrides: {
          agent: {
            variables: {
              user_id: userId,
              user_name: userName,
            },
          },
        },
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const endConversation = async () => {
    await conversation.endSession();
  };

  const getVolumeLevel = () => {
    // Simple animation based on listening state
    return isListening ? 'scale-110' : 'scale-100';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      {/* Voice Bubble */}
      <div className="relative flex items-center justify-center">
        {/* Animated rings when listening */}
        {isListening && (
          <>
            <div className="absolute w-96 h-96 rounded-full bg-primary/10 animate-ping"></div>
            <div className="absolute w-80 h-80 rounded-full bg-primary/20 animate-pulse"></div>
          </>
        )}

        {/* Main bubble */}
        <div
          className={`relative z-10 w-64 h-64 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center transition-all duration-300 shadow-2xl ${getVolumeLevel()}`}
        >
          {conversationStarted ? (
            <div className="text-center text-white">
              <svg
                className={`w-24 h-24 mx-auto ${isListening ? 'animate-pulse' : ''}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
              <p className="mt-4 text-sm font-medium">
                {isListening ? 'Listening...' : 'Thinking...'}
              </p>
            </div>
          ) : (
            <div className="text-center text-white">
              <svg
                className="w-24 h-24 mx-auto"
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
              <p className="mt-4 text-sm font-medium">Ready to talk</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center max-w-md">
        {conversationStarted ? (
          <p className="text-muted-foreground">
            {isListening
              ? 'Speak now... I\'m listening'
              : 'Processing your request...'}
          </p>
        ) : (
          <p className="text-muted-foreground">
            Click the button below to start talking with the marketplace assistant
          </p>
        )}
      </div>

      {/* Control Button */}
      <div className="flex gap-4">
        {!conversationStarted ? (
          <Button
            size="lg"
            onClick={startConversation}
            disabled={!user}
            className="px-8"
          >
            Start Conversation
          </Button>
        ) : (
          <Button
            size="lg"
            variant="destructive"
            onClick={endConversation}
            className="px-8"
          >
            End Conversation
          </Button>
        )}
      </div>
    </div>
  );
}

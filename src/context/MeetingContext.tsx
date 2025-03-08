import { createContext, useState, useEffect, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { Participant } from '../types/participant';
import { ChatMessage } from '@/types/chat';

interface MeetingContextType {
  meetingId: string | null;
  participants: Participant[];
  messages: ChatMessage[];
  isHost: boolean;
  isRecording: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  joinMeeting: (meetingId: string) => void;
  leaveMeeting: () => void;
  sendMessage: (content: string) => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  startRecording: () => void;
  stopRecording: () => void;
}

export const MeetingContext = createContext<MeetingContextType>({
  meetingId: null,
  participants: [],
  messages: [],
  isHost: false,
  isRecording: false,
  isMuted: false,
  isVideoOn: true,
  isScreenSharing: false,
  joinMeeting: () => {},
  leaveMeeting: () => {},
  sendMessage: () => {},
  toggleMute: () => {},
  toggleVideo: () => {},
  toggleScreenShare: () => {},
  startRecording: () => {},
  stopRecording: () => {},
});

interface MeetingProviderProps {
  children: ReactNode;
}

export const MeetingProvider = ({ children }: MeetingProviderProps) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Socket event listeners
    socket.on('participant-joined', (participant: Participant) => {
      setParticipants((prev) => [...prev, participant]);
    });

    socket.on('participant-left', (participantId: string) => {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    });

    socket.on('chat-message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('meeting-ended', () => {
      leaveMeeting();
    });

    return () => {
      socket.off('participant-joined');
      socket.off('participant-left');
      socket.off('chat-message');
      socket.off('meeting-ended');
    };
  }, [socket]);

  const joinMeeting = (id: string) => {
    if (!socket || !user) return;

    socket.emit('join-meeting', {
      meetingId: id,
      userId: user.uid,
      displayName: user.displayName,
    });

    setMeetingId(id);
  };

  const leaveMeeting = () => {
    if (!socket || !meetingId) return;

    socket.emit('leave-meeting', {
      meetingId,
      userId: user?.uid,
    });

    setMeetingId(null);
    setParticipants([]);
    setMessages([]);
    setIsHost(false);
    setIsRecording(false);
  };

  const sendMessage = (content: string) => {
    if (!socket || !meetingId || !user) return;

    const message: Omit<ChatMessage, 'id'> = {
      content,
      senderId: user.uid,
      senderName: user.displayName || 'Anonymous',
      timestamp: new Date(), // Changed from string to Date object
    };

    socket.emit('send-message', {
      meetingId,
      message,
    });
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    setIsVideoOn((prev) => !prev);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing((prev) => !prev);
  };

  const startRecording = () => {
    if (!socket || !meetingId) return;

    socket.emit('start-recording', { meetingId });
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!socket || !meetingId) return;

    socket.emit('stop-recording', { meetingId });
    setIsRecording(false);
  };

  return (
    <MeetingContext.Provider
      value={{
        meetingId,
        participants,
        messages,
        isHost,
        isRecording,
        isMuted,
        isVideoOn,
        isScreenSharing,
        joinMeeting,
        leaveMeeting,
        sendMessage,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
        startRecording,
        stopRecording,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};
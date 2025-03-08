import { useState, useEffect, useRef } from 'react';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';
import { PeerConnection } from '../services/webrtc/peerConnection';
import { mediaDevicesService } from '../services/webrtc/mediaDevices';

interface UseWebRTCProps {
  meetingId: string | null;
  onParticipantJoined?: (userId: string, stream: MediaStream) => void;
  onParticipantLeft?: (userId: string) => void;
}

export const useWebRTC = ({ meetingId, onParticipantJoined, onParticipantLeft }: UseWebRTCProps) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Record<string, MediaStream>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const peerConnectionRef = useRef<PeerConnection | null>(null);
  
  // Initialize WebRTC
  useEffect(() => {
    if (!socket || !user || !meetingId) return;

    const initializeWebRTC = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // Get local media stream
        const stream = await mediaDevicesService.getLocalStream();
        setLocalStream(stream);

        // Create peer connection manager
        peerConnectionRef.current = new PeerConnection({
          socket,
          userId: user.uid,
          meetingId,
          onTrack: (stream, userId) => {
            setParticipants((prev) => ({ ...prev, [userId]: stream }));
            onParticipantJoined?.(userId, stream);
          },
          onConnectionStateChange: (state, userId) => {
            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
              setParticipants((prev) => {
                const newParticipants = { ...prev };
                delete newParticipants[userId];
                return newParticipants;
              });
              onParticipantLeft?.(userId);
            }
          },
        });

        // Set local stream for peer connections
        peerConnectionRef.current.setLocalStream(stream);

        // Join the meeting room
        socket.emit('join-room', { roomId: meetingId, userId: user.uid });

        // Listen for new users
        socket.on('user-connected', ({ userId }) => {
          if (userId !== user.uid && peerConnectionRef.current) {
            peerConnectionRef.current.call(userId);
          }
        });

        setIsConnecting(false);
      } catch (err) {
        console.error('Error initializing WebRTC:', err);
        setError('Failed to access media devices. Please check your camera and microphone permissions.');
        setIsConnecting(false);
      }
    };

    initializeWebRTC();

    return () => {
      // Clean up
      socket.off('user-connected');
      if (peerConnectionRef.current) {
        peerConnectionRef.current.closeAllConnections();
      }
      mediaDevicesService.stopLocalStream();
      mediaDevicesService.stopScreenShare();
    };
  }, [socket, user, meetingId]);

  // Toggle audio
  const toggleMute = () => {
    if (localStream) {
      const newMuteState = !isMuted;
      mediaDevicesService.toggleAudio(!newMuteState);
      setIsMuted(newMuteState);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const newVideoState = !isVideoOff;
      mediaDevicesService.toggleVideo(!newVideoState);
      setIsVideoOff(newVideoState);
    }
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        mediaDevicesService.stopScreenShare();
        setScreenStream(null);
        setIsScreenSharing(false);

        // Replace with camera video
        if (localStream && peerConnectionRef.current) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            peerConnectionRef.current.replaceTrack(
              screenStream!.getVideoTracks()[0],
              videoTrack
            );
          }
        }
      } else {
        // Start screen sharing
        const stream = await mediaDevicesService.getScreenShareStream();
        setScreenStream(stream);
        setIsScreenSharing(true);

        // Replace camera video with screen share
        if (peerConnectionRef.current) {
          peerConnectionRef.current.replaceTrack(
            localStream!.getVideoTracks()[0],
            stream.getVideoTracks()[0]
          );
        }
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      setError('Failed to share screen. Please try again.');
    }
  };

  // Switch audio device
  const switchAudioDevice = async (deviceId: string) => {
    try {
      if (localStream) {
        const newStream = await mediaDevicesService.switchAudioDevice(deviceId);
        setLocalStream(newStream);
        
        if (peerConnectionRef.current) {
          peerConnectionRef.current.setLocalStream(newStream);
        }
      }
    } catch (error) {
      console.error('Error switching audio device:', error);
      setError('Failed to switch audio device. Please try again.');
    }
  };

  // Switch video device
  const switchVideoDevice = async (deviceId: string) => {
    try {
      if (localStream) {
        const newStream = await mediaDevicesService.switchVideoDevice(deviceId);
        setLocalStream(newStream);
        
        if (peerConnectionRef.current) {
          peerConnectionRef.current.setLocalStream(newStream);
        }
      }
    } catch (error) {
      console.error('Error switching video device:', error);
      setError('Failed to switch video device. Please try again.');
    }
  };

  return {
    localStream,
    screenStream,
    participants,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isConnecting,
    error,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    switchAudioDevice,
    switchVideoDevice
  };
};
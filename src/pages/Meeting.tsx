import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWebRTC } from '../hooks/useWebRTC';

const Meeting = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [participants, setParticipants] = useState<Record<string, { stream: MediaStream, name: string }>>({});
  
  const {
    localStream,
    isScreenSharing,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    error
  } = useWebRTC({
    meetingId,
    onParticipantJoined: (userId, stream) => {
      setParticipants(prev => ({
        ...prev,
        [userId]: { stream, name: `User ${Object.keys(prev).length + 1}` }
      }));
    },
    onParticipantLeft: (userId) => {
      setParticipants(prev => {
        const newParticipants = { ...prev };
        delete newParticipants[userId];
        return newParticipants;
      });
    }
  });

  useEffect(() => {
    if (!meetingId) {
      navigate('/');
    }
  }, [meetingId, navigate]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleLeaveMeeting = () => {
    navigate('/');
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <div className="video-grid">
          {/* Local video */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary-800">
                <div className="h-20 w-20 rounded-full bg-secondary-600 flex items-center justify-center text-white text-2xl">
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              You {isMuted && '(Muted)'} {isScreenSharing && '(Sharing)'}
            </div>
          </div>

          {/* Remote videos */}
          {Object.entries(participants).map(([userId, { stream, name }]) => (
            <div key={userId} className="relative bg-black rounded-lg overflow-hidden">
              <video
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                srcObject={stream}
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meeting controls */}
      <div className="meeting-controls">
        <button
          onClick={toggleMute}
          className={`control-btn ${isMuted ? 'bg-red-500 text-white' : 'bg-secondary-200 text-secondary-800'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMuted ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            )}
          </svg>
          <span className="text-xs mt-1">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button
          onClick={toggleVideo}
          className={`control-btn ${isVideoOff ? 'bg-red-500 text-white' : 'bg-secondary-200 text-secondary-800'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isVideoOff ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            )}
          </svg>
          <span className="text-xs mt-1">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
        </button>

        <button
          onClick={toggleScreenShare}
          className={`control-btn ${isScreenSharing ? 'bg-green-500 text-white' : 'bg-secondary-200 text-secondary-800'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-xs mt-1">{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
        </button>

        <button
          onClick={handleLeaveMeeting}
          className="control-btn bg-red-600 text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-xs mt-1">Leave</span>
        </button>
      </div>
    </div>
  );
};

export default Meeting;
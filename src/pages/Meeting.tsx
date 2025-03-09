import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase/config';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const Meeting = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [user, setUser] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{[key: string]: MediaStream}>({});
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<{[key: string]: RTCPeerConnection}>({});
  const navigate = useNavigate();

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const preferences = JSON.parse(localStorage.getItem('meeting-preferences') || '{}');
      if (preferences) {
        setIsCameraOn(preferences.camera);
        setIsMicOn(preferences.microphone);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, []);

  // Get user from Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);
  // Initialize media stream
  useEffect(() => {
    const setupMediaDevices = async () => {
      try {
        // Try to get media devices with fallback options
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: isCameraOn,
            audio: isMicOn
          });
        } catch (deviceError) {
          console.error('Error accessing media devices:', deviceError);
          // Fallback: try audio only if video fails
          if (isCameraOn) {
            toast.error('Camera not found. Using audio only.');
            setIsCameraOn(false);
            stream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: isMicOn
            });
          } else if (isMicOn) {
            toast.error('Microphone not found. Joining without audio/video.');
            setIsMicOn(false);
            // Join without media devices
          } else {
            toast.error('No media devices available.');
          }
        }
        
        if (stream) {
          setLocalStream(stream);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          // Setup WebRTC
          setupWebRTC(stream);
        } else {
          // Continue without media stream
          setupWebRTC(null);
        }
      } catch (error) {
        console.error('Error in media setup:', error);
        toast.error('Could not access media devices');
        // Continue without media
        setupWebRTC(null);
      }
    };
    
    if (meetingId) {
      setupMediaDevices();
    }
    // Cleanup function
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      // Close all peer connections
      Object.values(peerConnections.current).forEach(connection => {
        connection.close();
      });
    };
  }, [meetingId]);
  // Setup WebRTC
  const setupWebRTC = async (stream: MediaStream | null) => {
    if (!meetingId) return;
    try {
      // Create or join meeting room
      const meetingRef = doc(db, 'meetings', meetingId);
      const meetingDoc = await getDoc(meetingRef);
      
      if (!meetingDoc.exists()) {
        // Create meeting if it doesn't exist
        await setDoc(meetingRef, {
          createdAt: serverTimestamp(),
          createdBy: user?.uid || 'anonymous',
          active: true
        });
      }
      // Add current user as participant
      const participantsRef = collection(meetingRef, 'participants');
      const userId = user?.uid || `anonymous-${Date.now()}`;
      
      await setDoc(doc(participantsRef, userId), {
        name: user?.displayName || localStorage.getItem('name') || 'Guest',
        joined: serverTimestamp(),
        isHost: !meetingDoc.exists()
      });
      // Listen for participants changes
      const unsubscribeParticipants = onSnapshot(participantsRef, (snapshot) => {
        const participantsList: any[] = [];
        snapshot.forEach(doc => {
          participantsList.push({
            id: doc.id,
            ...doc.data()
          });
          // Create peer connection for new participants
          if (doc.id !== userId && !peerConnections.current[doc.id] && stream) {
            createPeerConnection(doc.id, stream);
          }
        });
        setParticipants(participantsList);
      });
      // Listen for signaling messages
      const signalRef = collection(meetingRef, 'signals');
      const unsubscribeSignals = onSnapshot(signalRef, (snapshot) => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.to === userId) {
              handleSignalingMessage(data.from, data.message);
            }
          }
        });
      });
      // Listen for chat messages
      const messagesRef = collection(meetingRef, 'messages');
      const unsubscribeMessages = onSnapshot(messagesRef, (snapshot) => {
        const messages: any[] = [];
        snapshot.forEach(doc => {
          messages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        // Sort messages by timestamp
        messages.sort((a, b) => {
          if (!a.timestamp || !b.timestamp) return 0;
          return a.timestamp.seconds - b.timestamp.seconds;
        });
        setChatMessages(messages);
      });
      return () => {
        unsubscribeParticipants();
        unsubscribeSignals();
        unsubscribeMessages();
      };
    } catch (error) {
      console.error('Error setting up WebRTC:', error);
      toast.error('Failed to connect to meeting. Please try again.');
      return () => {}; // Return empty cleanup function in case of error
    }
  };
  // Create peer connection for a participant
  const createPeerConnection = (participantId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    // Add local tracks to peer connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage(participantId, {
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };
    // Handle remote tracks
    pc.ontrack = (event) => {
      const remoteStream = new MediaStream();
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
      setRemoteStreams(prev => ({
        ...prev,
        [participantId]: remoteStream
      }));
    };
    // Create and send offer
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .then(() => {
        sendSignalingMessage(participantId, {
          type: 'offer',
          sdp: pc.localDescription
        });
      })
      .catch(error => {
        console.error('Error creating offer:', error);
      });
    peerConnections.current[participantId] = pc;
    return pc;
  };
  // Send signaling message to a participant
  const sendSignalingMessage = async (to: string, message: any) => {
    if (!meetingId) return;
    try {
      const meetingRef = doc(db, 'meetings', meetingId);
      const signalRef = collection(meetingRef, 'signals');
      
      await addDoc(signalRef, {
        from: user?.uid || 'anonymous',
        to,
        message,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending signaling message:', error);
      // Don't show toast for every signaling error to avoid spamming the user
    }
  };
  // Handle incoming signaling message
  const handleSignalingMessage = async (from: string, message: any) => {
    if (!peerConnections.current[from]) {
      if (localStream) {
        createPeerConnection(from, localStream);
      }
    }
    const pc = peerConnections.current[from];
    if (!pc) return;
    if (message.type === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignalingMessage(from, {
        type: 'answer',
        sdp: pc.localDescription
      });
    } else if (message.type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
    } else if (message.type === 'ice-candidate') {
      await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  };
  // Toggle camera
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOn;
      });
      setIsCameraOn(!isCameraOn);
    }
  };
  // Toggle microphone
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    }
  };
  // Toggle screen sharing
  const toggleScreenSharing = async () => {
    if (!isScreenSharing) {
      try {
        // Request screen sharing with a more user-friendly approach
        toast.info("Please select the screen or window you want to share");
        
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
            displaySurface: "monitor"
          },
          audio: false
        });
        
        // Replace video track with screen track
        if (localStream) {
          const videoTrack = screenStream.getVideoTracks()[0];
          
          // Replace track in all peer connections
          Object.values(peerConnections.current).forEach(pc => {
            const senders = pc.getSenders();
            const sender = senders.find(s => s.track?.kind === 'video');
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          });
          
          // Update local video
          if (localVideoRef.current) {
            const newStream = new MediaStream([
              videoTrack, 
              ...localStream.getAudioTracks()
            ]);
            localVideoRef.current.srcObject = newStream;
            setLocalStream(newStream);
          }
          
          // Listen for screen sharing end
          videoTrack.onended = () => {
            toggleScreenSharing();
          };
          
          setIsScreenSharing(true);
          toast.success("Screen sharing started");
        }
      } catch (error) {
        console.error('Error sharing screen:', error);
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          toast.error('Screen sharing permission denied. Please allow access to share your screen.');
        } else {
          toast.error('Could not share screen. Please try again.');
        }
      }
    } else {
      // Revert to camera
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true
        }).catch(() => {
          // If camera access fails, just stop screen sharing without camera
          if (localStream) {
            const emptyStream = new MediaStream([
              ...localStream.getAudioTracks()
            ]);
            
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = emptyStream;
            }
            
            setLocalStream(emptyStream);
            setIsCameraOn(false);
          }
          return null;
        });
        
        if (cameraStream) {
          const videoTrack = cameraStream.getVideoTracks()[0];
          
          // Replace screen track with camera track in all peer connections
          Object.values(peerConnections.current).forEach(pc => {
            const senders = pc.getSenders();
            const sender = senders.find(s => s.track?.kind === 'video');
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          });
          
          // Update local video
          if (localVideoRef.current) {
            const newStream = new MediaStream([
              videoTrack, 
              ...(localStream ? localStream.getAudioTracks() : [])
            ]);
            localVideoRef.current.srcObject = newStream;
            setLocalStream(newStream);
          }
        }
        
        setIsScreenSharing(false);
        toast.info("Screen sharing stopped");
      } catch (error) {
        console.error('Error reverting to camera:', error);
        setIsScreenSharing(false);
      }
    }
  };
  // Leave meeting
  const leaveMeeting = () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    // Close all peer connections
    Object.values(peerConnections.current).forEach(connection => {
      connection.close();
    });
    // Navigate back to home
    navigate('/');
  };
  // Send chat message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !meetingId) return;
    
    try {
      const meetingRef = doc(db, 'meetings', meetingId);
      const messagesRef = collection(meetingRef, 'messages');
      
      await addDoc(messagesRef, {
        text: newMessage,
        sender: user?.displayName || localStorage.getItem('name') || 'Guest',
        senderId: user?.uid || 'anonymous',
        timestamp: serverTimestamp()
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  return (
    <div className="flex flex-col h-screen bg-secondary-900">
      {/* Meeting header */}
      <div className="bg-secondary-800 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-white font-semibold">Meeting: {meetingId}</h1>
          <div className="ml-4 flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-white text-sm">{participants.length} participants</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="text-white border-white hover:bg-secondary-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Chat
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={leaveMeeting}
          >
            Leave
          </Button>
        </div>
      </div>
{/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div className={`flex-1 p-4 ${showChat ? 'w-3/4' : 'w-full'} overflow-auto`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Local video */}
            <div className="relative bg-secondary-800 rounded-lg overflow-hidden aspect-square">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover ${!isCameraOn && 'hidden'}`}
              />
              {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-secondary-700 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'Y'}
                    </span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-secondary-900 bg-opacity-70 px-2 py-1 rounded text-white text-sm">
                You {isScreenSharing && '(Screen)'}
              </div>
              <div className="absolute bottom-2 right-2 flex space-x-1">
                {!isMicOn && (
                  <div className="bg-red-500 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                  </div>
                )}
                {!isCameraOn && (
                  <div className="bg-red-500 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Remote videos */}
            {Object.entries(remoteStreams).map(([participantId, stream]) => {
              const participant = participants.find(p => p.id === participantId);
              return (
                <div key={participantId} className="relative bg-secondary-800 rounded-lg overflow-hidden aspect-square">
                  <video
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    ref={el => {
                      if (el) el.srcObject = stream;
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-secondary-900 bg-opacity-70 px-2 py-1 rounded text-white text-sm">
                    {participant?.name || 'Participant'}
                  </div>
                </div>
              );
            })}

            {/* Empty placeholders for grid layout */}
            {Array.from({ length: Math.max(0, 3 - Object.keys(remoteStreams).length - 1) }).map((_, i) => (
              <div key={i} className="bg-secondary-800 rounded-lg flex items-center justify-center aspect-square">
                <div className="text-secondary-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        {showChat && (
          <div className="w-1/4 bg-secondary-800 border-l border-secondary-700 flex flex-col h-full">
            <div className="p-3 border-b border-secondary-700">
              <h2 className="text-white font-medium">Meeting Chat</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-secondary-500 py-8">
                  No messages yet
                </div>
              ) : (
                chatMessages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex flex-col ${message.senderId === (user?.uid || 'anonymous') ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-xs text-secondary-400 mb-1">
                      {message.sender}
                    </div>
                    <div className={`px-3 py-2 rounded-lg max-w-[85%] ${
                      message.senderId === (user?.uid || 'anonymous')
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-700 text-white'
                    }`}>
                      {message.text}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-secondary-700">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="bg-secondary-700 border-secondary-600 text-white"
                />
                <Button type="submit" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Meeting controls */}
      <div className="bg-secondary-800 p-4 flex justify-center">
        <div className="flex space-x-4">
          <Button
            variant={isMicOn ? "outline" : "destructive"}
            size="icon"
            onClick={toggleMic}
            className={isMicOn ? "border-white text-white hover:bg-secondary-700" : ""}
          >
            {isMicOn ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            )}
          </Button>
          
          <Button
            variant={isCameraOn ? "outline" : "destructive"}
            size="icon"
            onClick={toggleCamera}
            className={isCameraOn ? "border-white text-white hover:bg-secondary-700" : ""}
          >
            {isCameraOn ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            )}
          </Button>
          
          <Button
            variant={isScreenSharing ? "destructive" : "outline"}
            size="icon"
            onClick={toggleScreenSharing}
            className={!isScreenSharing ? "border-white text-white hover:bg-secondary-700" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </Button>
          
          <Button
            variant="destructive"
            onClick={leaveMeeting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Leave Meeting
          </Button>
        </div>
      </div>
    </div>
  );
};
// Helper function to retry Firebase operations
  const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`Operation failed (attempt ${i + 1}/${maxRetries}):`, error);
        lastError = error;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw lastError;
  };
export default Meeting;
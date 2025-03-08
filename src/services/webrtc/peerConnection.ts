import { Socket } from 'socket.io-client';

interface PeerConnectionConfig {
  socket: Socket;
  userId: string;
  meetingId: string;
  onTrack: (stream: MediaStream, userId: string) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState, userId: string) => void;
}

export class PeerConnection {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private config: PeerConnectionConfig;

  constructor(config: PeerConnectionConfig) {
    this.config = config;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    const { socket, meetingId, userId } = this.config;

    socket.on('ice-candidate', async ({ candidate, from }) => {
      try {
        const peerConnection = this.peerConnections.get(from);
        if (peerConnection && candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Error adding ice candidate:', error);
      }
    });

    socket.on('offer', async ({ offer, from }) => {
      try {
        const peerConnection = this.createPeerConnection(from);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.emit('answer', {
          answer,
          to: from,
          from: userId,
          meetingId,
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    socket.on('answer', async ({ answer, from }) => {
      try {
        const peerConnection = this.peerConnections.get(from);
        if (peerConnection) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    socket.on('user-disconnected', ({ userId }) => {
      this.closePeerConnection(userId);
    });
  }

  private createPeerConnection(remoteUserId: string): RTCPeerConnection {
    if (this.peerConnections.has(remoteUserId)) {
      this.closePeerConnection(remoteUserId);
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Add local tracks to the peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.config.socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: remoteUserId,
          from: this.config.userId,
          meetingId: this.config.meetingId,
        });
      }
    };

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      const remoteStream = new MediaStream();
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      this.config.onTrack(remoteStream, remoteUserId);
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      this.config.onConnectionStateChange(peerConnection.connectionState, remoteUserId);
    };

    this.peerConnections.set(remoteUserId, peerConnection);
    return peerConnection;
  }

  public async call(remoteUserId: string) {
    try {
      const peerConnection = this.createPeerConnection(remoteUserId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      this.config.socket.emit('offer', {
        offer,
        to: remoteUserId,
        from: this.config.userId,
        meetingId: this.config.meetingId,
      });
    } catch (error) {
      console.error('Error calling peer:', error);
    }
  }

  public setLocalStream(stream: MediaStream) {
    this.localStream = stream;

    // Add tracks to existing peer connections
    if (stream) {
      this.peerConnections.forEach((peerConnection) => {
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
      });
    }
  }

  public replaceTrack(oldTrack: MediaStreamTrack, newTrack: MediaStreamTrack) {
    this.peerConnections.forEach((peerConnection) => {
      const sender = peerConnection.getSenders().find((s) => s.track?.kind === oldTrack.kind);
      if (sender) {
        sender.replaceTrack(newTrack);
      }
    });
  }

  public closePeerConnection(userId: string) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }
  }

  public closeAllConnections() {
    this.peerConnections.forEach((connection, userId) => {
      this.closePeerConnection(userId);
    });
  }
}
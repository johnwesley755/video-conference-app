const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Track participants in rooms
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Get user info from auth
  const { token: userId, displayName } = socket.handshake.auth;

  socket.on('join-room', ({ roomId }) => {
    console.log(`User ${userId} (${displayName}) joined room ${roomId}`);
    
    // Join the socket room
    socket.join(roomId);
    
    // Store the roomId on the socket for later use
    socket.roomId = roomId;
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    
    // Add participant to room
    rooms.get(roomId).set(userId, {
      id: userId,
      socketId: socket.id,
      displayName,
    });

    // Notify others in the room
    socket.to(roomId).emit('user-connected', {
      userId,
      displayName,
    });

    // Send list of existing participants to the new user
    const participants = Array.from(rooms.get(roomId).values());
    socket.emit('existing-participants', participants);
  });

  // WebRTC signaling
  socket.on('offer', ({ to, from, offer }) => {
    io.to(getSocketIdFromUserId(to)).emit('offer', { from, offer });
  });

  socket.on('answer', ({ to, from, answer }) => {
    io.to(getSocketIdFromUserId(to)).emit('answer', { from, answer });
  });

  socket.on('ice-candidate', ({ to, from, candidate }) => {
    io.to(getSocketIdFromUserId(to)).emit('ice-candidate', { from, candidate });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and remove user from their room
    rooms.forEach((participants, roomId) => {
      participants.forEach((participant, participantId) => {
        if (participant.socketId === socket.id) {
          participants.delete(participantId);
          socket.to(roomId).emit('user-disconnected', { userId: participantId });
          
          // Clean up empty rooms
          if (participants.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });
  });

  // Helper function to get socket ID from user ID
  function getSocketIdFromUserId(userId) {
    for (const [roomId, participants] of rooms.entries()) {
      const participant = participants.get(userId);
      if (participant) {
        return participant.socketId;
      }
    }
    return null;
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
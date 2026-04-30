const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

// Placeholder routes for later implementation
// app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/paper', require('./routes/paperRoutes'));
app.use('/api/srs', require('./routes/srsRoutes'));

const PORT = process.env.PORT || 5000;

// Socket.io Group Quiz Logic
const rooms = {}; // { roomId: { host: socketId, players: [{id, name, score, answers}], quizData: [], state: 'waiting' | 'playing' | 'finished' } }

// Global Online Users Map
const globalOnlineUsers = new Map(); // socket.id -> name

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Register user with their name
  socket.on('registerUser', (name) => {
    globalOnlineUsers.set(socket.id, name);
    io.emit('onlineUsersCount', io.engine.clientsCount);
    io.emit('onlineUsersList', Array.from(globalOnlineUsers.values()));
  });

  // Broadcast total online users count
  io.emit('onlineUsersCount', io.engine.clientsCount);
  io.emit('onlineUsersList', Array.from(globalOnlineUsers.values()));

  const broadcastActiveRooms = () => {
    const activeRooms = Object.keys(rooms)
      .filter(roomId => rooms[roomId].state === 'waiting')
      .map(roomId => ({
        roomId,
        hostName: rooms[roomId].players[0]?.name || 'Unknown',
        playerCount: rooms[roomId].players.length,
        topic: rooms[roomId].quizData?.[0]?.topic || 'General' // we'd need topic if we stored it, let's just use roomId and host
      }));
    io.emit('activeRooms', activeRooms);
  };

  socket.on('getActiveRooms', () => {
    broadcastActiveRooms();
  });

  socket.on('createRoom', ({ roomId, quizData, hostName }) => {
    rooms[roomId] = {
      host: socket.id,
      players: [{ id: socket.id, name: hostName, score: 0, answers: {} }],
      quizData,
      state: 'waiting'
    };
    socket.join(roomId);
    io.to(roomId).emit('roomUpdated', rooms[roomId]);
    broadcastActiveRooms();
  });

  socket.on('joinRoom', ({ roomId, playerName }) => {
    if (rooms[roomId] && rooms[roomId].state === 'waiting') {
      rooms[roomId].players.push({ id: socket.id, name: playerName, score: 0, answers: {} });
      socket.join(roomId);
      io.to(roomId).emit('roomUpdated', rooms[roomId]);
      broadcastActiveRooms();
    } else {
      socket.emit('error', 'Room not found or already started');
    }
  });

  socket.on('startQuiz', (roomId) => {
    if (rooms[roomId] && rooms[roomId].host === socket.id) {
      rooms[roomId].state = 'playing';
      io.to(roomId).emit('quizStarted', rooms[roomId].quizData);
      broadcastActiveRooms();
    }
  });

  socket.on('submitScore', ({ roomId, score, answers }) => {
    if (rooms[roomId]) {
      const player = rooms[roomId].players.find(p => p.id === socket.id);
      if (player) {
        player.score = score;
        player.answers = answers;
      }
      io.to(roomId).emit('leaderboardUpdated', rooms[roomId].players);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    globalOnlineUsers.delete(socket.id);
    // Broadcast updated total online users count
    io.emit('onlineUsersCount', io.engine.clientsCount);
    io.emit('onlineUsersList', Array.from(globalOnlineUsers.values()));

    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter(p => p.id !== socket.id);
      if (room.players.length === 0) {
        delete rooms[roomId];
        broadcastActiveRooms();
      } else {
        io.to(roomId).emit('roomUpdated', room);
        broadcastActiveRooms();
      }
    }
  });

  // Matchmaking Chat Logic
  socket.on('joinChat', (chatRoomId) => {
    socket.join(chatRoomId);
  });

  socket.on('leaveChat', (chatRoomId) => {
    socket.leave(chatRoomId);
  });

  socket.on('chatMessage', ({ chatRoomId, senderName, text }) => {
    io.to(chatRoomId).emit('chatMessage', { senderName, text, timestamp: new Date() });
  });

});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (replace with your frontend URL for production)
        methods: ['GET', 'POST'],
    },
});

let users = [];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Add user to the list
    users.push(socket.id);

    // Pair users
    if (users.length >= 2) {
        const user1 = users.shift();
        const user2 = users.shift();
        io.to(user1).emit('paired', user2);
        io.to(user2).emit('paired', user1);
    }

    // Relay signaling messages
    socket.on('signal', (data) => {
        socket.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

  // Handle custom disconnect event
  socket.on('user_disconnect', () => {
    console.log('User manually disconnected:', socket.id);
    users = users.filter((user) => user !== socket.id);
});

// Handle built-in disconnect event
socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    users = users.filter((user) => user !== socket.id);
});
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
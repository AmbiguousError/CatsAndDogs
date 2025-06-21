// server.js - The central brain for our click counter

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors'); // Import the cors middleware

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from any origin for simplicity
    methods: ["GET", "POST"]
  }
});

// Use the cors middleware for Express
app.use(cors());

// This is our simple "database". In a real-world app, you'd use a
// proper database like Redis, MongoDB, or PostgreSQL to ensure counts
// are not lost when the server restarts.
const clickCounts = {
    catz: 0,
    dogz: 0
};

// A simple API endpoint to get the current counts when a new user loads the page.
app.get('/api/counts', (req, res) => {
  res.json(clickCounts);
});

// This is the core of the live functionality.
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for a 'buttonClicked' event from any client
  socket.on('buttonClicked', (buttonId) => {
    if (clickCounts.hasOwnProperty(buttonId)) {
      clickCounts[buttonId]++;
      // Broadcast the updated counts to ALL connected users
      io.emit('countsUpdated', clickCounts);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

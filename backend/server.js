const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const db = require('./config/db');
const vehicleRoutes = require('./routes/vehicleRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const incomingVehicleRoutes = require('./routes/incomingVehicleRoutes');
const authRoutes = require('./routes/authRoutes'); // auth
const userRoutes = require('./routes/userRoutes');



const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Test MySQL Connection
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ MySQL Connected Successfully');
  } catch (err) {
    console.error('❌ MySQL Connection Error:', err);
    process.exit(1);
  }
})();

// Routes
app.use('/api/auth', authRoutes); //auth
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/incoming', incomingVehicleRoutes);
app.use('/api/users', userRoutes);



// WebSocket for real-time updates
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
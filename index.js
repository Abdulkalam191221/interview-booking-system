const express = require('express');
const http = require('http');
const cors = require('cors'); 
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs'); 
require('dotenv').config();

const InterviewSlot = require('./models/InterviewSlot');
const User = require('./models/User'); 

// ⚡ SENIOR DEV FIX: Explicitly return the database connection promise pipeline
const connectDB = async () => {
  const dbConnect = require('./config/db');
  
  // Wait for the primary connection to complete
  await dbConnect();
  
  try {
    console.log("🔍 Checking for existing HR Admin...");
    const adminExists = await User.findOne({ email: "hr@portal.com" });
    
    if (!adminExists) {
      console.log("👑 Seeding Dedicated HR Admin Account...");
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: "HR Manager (Admin)",
        email: "hr@portal.com",
        password: hashedPassword,
        role: "admin"
      });
      console.log("📌 HR Credentials Configured: hr@portal.com | admin123");
    } else {
      console.log("✅ HR Admin account already exists. Skipping seed.");
    }

    const slotsExist = await InterviewSlot.countDocuments();
    if (slotsExist === 0) {
      console.log("💎 Injecting fresh mock public interview slots...");
      await InterviewSlot.create([
        {
          date: "2026-06-22", 
          startTime: "10:00 AM",
          endTime: "11:00 AM",
          timeWindow: "10:00 AM - 11:00 AM", 
          interviewer: "Sarah Jenkins (Senior Engineering Lead)",
          interviewType: "Technical",
          mode: "Online",
          capacity: 3,
          availableSeats: 3,
          status: "available",
          allocatedToEmail: null
        }
      ]);
      console.log("✅ Mock slots generated successfully!");
    }

  } catch (err) {
    console.error("⚠️ Automated seed initialization error:", err.message);
  }
};

const app = express();

// Global HTTP CORS Middleware 
app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

const server = http.createServer(app);

// Initialize Socket.io and enable CORS cross-origin allowances
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set('socketio', io);
app.use(express.json());

// Track active WebSocket connections
io.on('connection', (socket) => {
  console.log(`🔌 A user connected to live feed: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected from feed: ${socket.id}`);
  });
});

// Route Mountpoints
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));

app.get('/', (req, res) => {
  res.send('⚡ Interview Booking API with Socket.io is running smoothly...');
});

const PORT = process.env.PORT || 5000;

// ⚡ BOOT SEQUENCE: Force Express to wait for the configuration promise to resolve completely
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`⚡ Server running cleanly on port ${PORT}`);
  });
}).catch(err => {
  console.error("❌ Critical server boot failure:", err.message);
});
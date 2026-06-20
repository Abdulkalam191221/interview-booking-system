// backend/seed.js
const mongoose = require('mongoose');
const InterviewSlot = require('./models/InterviewSlot');

const seedData = async () => {
  try {
    // Connect to your running application port
    await mongoose.connect('mongodb://127.0.0.1:27017/interview-booking' || process.env.MONGO_URI);
    
    console.log("🌱 Purging old records...");
    await InterviewSlot.deleteMany({});

    console.log("💎 Injecting clean test schedules...");
    await InterviewSlot.create([
      {
        date: new Date(Date.now() + 86400000 * 2), // 2 days from now
        startTime: "10:00 AM",
        endTime: "11:00 AM",
        interviewer: "Sarah Jenkins (Senior Engineering Lead)",
        interviewType: "Technical",
        mode: "Online",
        capacity: 3,
        availableSeats: 3,
        status: "available"
      },
      {
        date: new Date(Date.now() + 86400000 * 3), // 3 days from now
        startTime: "02:30 PM",
        endTime: "03:30 PM",
        interviewer: "Aravind Kumar (Principal Architect)",
        interviewType: "Managerial",
        mode: "Online",
        capacity: 1,
        availableSeats: 1,
        status: "available"
      }
    ]);

    console.log("✅ Seed database injection complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failure error stack:", error);
    process.exit(1);
  }
};

seedData();
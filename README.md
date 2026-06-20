# 🗓️ Real-Time Interview Slot Booking System

A full-stack, responsive MERN application featuring a premium liquid-glassmorphic user interface over a minimalist static workspace background. This portal enables HR Admins to seamlessly allocate interview options, allows Candidates to book slots based on their availability, and utilizes WebSockets for real-time schedule synchronization across all active dashboards.

---

## 🚀 Features

### 🧑‍💻 Candidate Portal
* **Invite-Only Selection Pool:** View custom interview slot choices dynamically generated specifically for your registered email address.
* **Instant Reservation:** Book available slots with single-click confirmation, which instantly locks down your selection and removes alternative choices.
* **Live Status View:** An interactive glassmorphic sidebar tracking live assignment info (Host name, interview type, mode, date, and time).

### 👑 Admin (HR) Dashboard
* **Flexible Direct Scheduling:** Create and designate custom interview choices for candidates using their email addresses (whether they have registered an account yet or not).
* **Live Operational Metrics:** Dynamic counter widgets tracking total interactions processed, confirmed reserved interviews, and cancelled applications.
* **Master Manifest Log:** A real-time grid tracking candidate data, assigned panelists, types, schedule timestamps, and booking statuses.

### ⚡ Real-Time Integration
* **Socket.io Synchronization:** Live data broadcasting ensures any schedule updates, completions, or slot fills populate instantly without manual page refreshes.

---

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, HTML5 Canvas Layering, CSS3 (Liquid Morphism and Keyframe Animations)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (with Mongoose Object Modeling)
* **Real-Time Communication:** Socket.io

---

## ⚙️ Local Installation & Setup

### 1. Prerequisites
Ensure you have Node.js and MongoDB installed on your machine.

### 2. Backend Environment Variables (`backend/.env`)
Create a `.env` file in your root backend folder and fill in your configurations:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secure_secret_string

Execution Commands
Start the Server Context:

cd backend
npm install
npm run dev

Start the Frontend UI :

cd frontend
npm install
npm run dev

📊 Database Schema Documentation

1. Users Collection :-

{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (Lowercase, Unique)",
  "password": "String (Bcrypt Hashed)",
  "role": "String ('candidate' or 'admin')"
}

2. Interview Slots Collection :-

{
  "_id": "ObjectId",
  "date": "String (Format: YYYY-MM-DD)",
  "startTime": "String",
  "endTime": "String",
  "timeWindow": "String (e.g., '10:00 AM - 11:00 AM')",
  "interviewer": "String",
  "interviewerName": "String",
  "interviewType": "String ('Technical', 'HR', 'Managerial')",
  "mode": "String ('Online', 'Offline')",
  "capacity": "Number (Default: 1)",
  "availableSeats": "Number",
  "status": "String ('available', 'Full', 'Cancelled')",
  "allocatedToEmail": "String (Target email lock reference; default: null)"
}

3. Bookings Collection :-

{
  "_id": "ObjectId",
  "candidateId": "ObjectId (Ref: User, nullable for unlinked registrations)",
  "candidateEmailFallback": "String",
  "slotId": "ObjectId (Ref: InterviewSlot)",
  "bookingDate": "Date (Default: Date.now)",
  "status": "String ('booked', 'cancelled')"
}
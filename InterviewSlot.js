const mongoose = require('mongoose');

const InterviewSlotSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  startTime: {
    type: String, // e.g., "10:00 AM"
    required: true,
  },
  endTime: {
    type: String, // e.g., "11:00 AM"
    required: true,
  },
  timeWindow: {
    type: String, // Combined window context
    required: true,
  },
  interviewer: {
    type: String,
    required: true,
  },
  interviewType: {
    type: String,
    enum: ['Technical', 'HR', 'Managerial'],
    required: true,
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline'],
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    default: 1, // HR sets the limited maximum number of persons for this slot
  },
  availableSeats: {
    type: Number,
    required: true, // Decrements from capacity as candidates book
  },
  status: {
    type: String,
    enum: ['available', 'Full', 'Cancelled'],
    default: 'available',
  },
  allocatedToEmail: {
    type: String,
    default: null, // Scopes options precisely to the candidate's email invite pool
  },
}, { timestamps: true });

module.exports = mongoose.model('InterviewSlot', InterviewSlotSchema);
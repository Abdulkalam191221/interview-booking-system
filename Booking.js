const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // CHANGED: Optional so HR can book slots before the candidate registers an account
    default: null
  },
  candidateEmailFallback: {
    type: String,   // ADDED: Preserves the target email identity reference string for verification lookup tracking
    default: null
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSlot',
    required: true, // References the specific interview slot
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled'],
    default: 'booked',
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
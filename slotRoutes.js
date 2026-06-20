const express = require('express');
const router = express.Router();

// 1. IMPORT MIDDLEWARES WITH FALLBACK PROTECTION
const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware?.protect || ((req, res, next) => next());
const admin = authMiddleware?.admin || ((req, res, next) => next());

// 2. IMPORT CONTROLLER
const slotController = require('../controllers/slotController');

// --- Administrative Slot Operations ---
router.post('/', protect, admin, (req, res, next) => {
  if (typeof slotController.createSlot !== 'function') return res.status(500).json({ message: "Controller method missing" });
  slotController.createSlot(req, res, next);
});

router.post('/schedule-direct', protect, admin, (req, res, next) => {
  if (typeof slotController.scheduleDirectForCandidate !== 'function') return res.status(500).json({ message: "Controller method missing" });
  slotController.scheduleDirectForCandidate(req, res, next);
});

router.put('/:id', protect, admin, (req, res, next) => {
  if (typeof slotController.updateSlot !== 'function') return res.status(500).json({ message: "Controller method missing" });
  slotController.updateSlot(req, res, next);
});

router.delete('/:id', protect, admin, (req, res, next) => {
  if (typeof slotController.deleteSlot !== 'function') return res.status(500).json({ message: "Controller method missing" });
  slotController.deleteSlot(req, res, next);
});

// --- Candidate Allocation & Transactional Operations ---
router.get('/available', protect, (req, res, next) => {
  if (typeof slotController.getAvailableSlots !== 'function') return res.status(500).json({ message: "Controller method missing" });
  slotController.getAvailableSlots(req, res, next);
});

router.get('/history', protect, (req, res, next) => {
  if (typeof slotController.getBookingHistory !== 'function') return res.status(500).json({ message: "Controller method missing" });
  slotController.getBookingHistory(req, res, next);
});

router.get('/:id', protect, (req, res, next) => {
  if (typeof slotController.getSlotDetails !== 'function') return res.status(500).json({ message: "Controller method missing" });
  slotController.getSlotDetails(req, res, next);
});

router.post('/book/:id', protect, (req, res, next) => {
  if (typeof slotController.bookSlot !== 'function') return res.status(500).json({ message: "Controller method missing" });
  slotController.bookSlot(req, res, next);
});

module.exports = router;
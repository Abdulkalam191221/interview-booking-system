const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken'); // ⚡ Added JWT to decode the user token

const filePath = path.join(__dirname, 'slots_storage.json');

const readSlotsFromFile = () => {
  try {
    if (!fs.existsSync(filePath)) {
      const initialData = [
        {
          _id: "slot_initial_mock",
          id: "slot_initial_mock",
          date: "2026-06-23",
          startTime: "02:30 PM",
          endTime: "03:30 PM",
          timeWindow: "02:30 PM - 03:30 PM",
          interviewer: "Aravind Kumar (Principal Architect)",
          interviewType: "Managerial",
          mode: "Online",
          capacity: 3,
          availableSeats: 3,
          status: "available",
          bookings: []
        }
      ];
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent || '[]');
  } catch (error) {
    return [];
  }
};

const writeSlotsToFile = (slotsData) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(slotsData, null, 2));
  } catch (error) {
    console.error("⚠️ File write error:", error.message);
  }
};

// @desc    HR creates a general open interview slot
const scheduleDirectForCandidate = async (req, res) => {
  try {
    const { date, startTime, endTime, interviewer, interviewType, mode, capacity } = req.body;
    const slotCapacity = parseInt(capacity, 10) || 1;
    const currentSlots = readSlotsFromFile();

    const id = "slot_" + Math.random().toString(36).substr(2, 9);
    const newSlot = {
      _id: id,
      id: id,
      date: date || "2026-06-24",
      startTime: startTime || "10:00 AM",
      endTime: endTime || "11:00 AM",
      timeWindow: `${startTime} - ${endTime}`,
      interviewer: interviewer || "Technical Interviewer Team",
      interviewType: interviewType || "Technical",
      mode: mode || "Online",
      capacity: slotCapacity,
      availableSeats: slotCapacity,
      status: "available",
      bookings: []
    };

    currentSlots.push(newSlot);
    writeSlotsToFile(currentSlots);

    const io = req.app.get('socketio');
    if (io) io.emit('slot-updated', newSlot);

    res.status(201).json({ message: 'Slot created successfully', slot: newSlot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get available slots for candidates
const getAvailableSlots = async (req, res) => {
  try {
    const currentSlots = readSlotsFromFile();
    res.json(currentSlots); 
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Book a slot (Now uses real candidate data & enforces capacity)
const bookSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    const currentSlots = readSlotsFromFile();
    const slot = currentSlots.find(s => s._id === slotId || s.id === slotId);

    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    // STRICT CAPACITY CHECK: Block booking if it is already full
    if (slot.availableSeats <= 0) {
      return res.status(400).json({ message: 'This slot option has reached its capacity limit.' });
    }

    // ⚡ Extract REAL candidate details directly from their login token
    let candidateName = "Unknown Candidate";
    let candidateEmail = "unknown@portal.com";
    let candidateId = "mock_id";

    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.decode(token); // Safely decode the JWT token
      if (decoded) {
        candidateName = decoded.name || candidateName;
        candidateEmail = decoded.email || candidateEmail;
        candidateId = decoded.id || candidateId;
      }
    }

    // STRICT DEDUPLICATION: Prevent the same person from taking two seats
    const alreadyBooked = slot.bookings.some(b => b.email === candidateEmail);
    if (alreadyBooked) {
      return res.status(400).json({ message: 'You have already reserved a seat in this specific slot.' });
    }

    // Process valid booking mapping
    slot.availableSeats = Math.max(0, slot.availableSeats - 1);
    slot.bookings.push({
      bookingId: "book_" + Math.random().toString(36).substr(2, 9),
      candidateId: candidateId,
      name: candidateName,
      email: candidateEmail,
      bookedAt: new Date()
    });

    if (slot.availableSeats === 0) slot.status = 'Full';

    writeSlotsToFile(currentSlots);

    const io = req.app.get('socketio');
    if (io) io.emit('slot-booked', { slotId: slot._id, availableSeats: slot.availableSeats });

    res.status(201).json({ message: 'Slot booked successfully!', slot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get master booking logs for HR Admin (Defensive Structural Mapping)
const getBookingHistory = async (req, res) => {
  try {
    const currentSlots = readSlotsFromFile();
    const dynamicHistory = [];
    
    currentSlots.forEach(slot => {
      if (slot.bookings) {
        slot.bookings.forEach(b => {
          // 💡 Defensive Mapping: provide BOTH singular and ID suffixes to prevent frontend crashes
          dynamicHistory.push({
            _id: b.bookingId,
            id: b.bookingId,
            slotId: slot,
            slot: slot, 
            candidateId: { _id: b.candidateId, id: b.candidateId, name: b.name, email: b.email },
            candidate: { _id: b.candidateId, id: b.candidateId, name: b.name, email: b.email },
            user: { _id: b.candidateId, id: b.candidateId, name: b.name, email: b.email },
            createdAt: b.bookedAt,
            date: b.bookedAt
          });
        });
      }
    });
    res.json(dynamicHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fallback arrays to handle generic get routes (e.g., router.get('/', getAllSlots))
const getAllSlots = async (req, res) => {
  try {
    res.json(readSlotsFromFile());
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Edit/Update a slot (HR Admin)
const updateSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    const currentSlots = readSlotsFromFile();
    const slotIndex = currentSlots.findIndex(s => s._id === slotId || s.id === slotId);

    if (slotIndex === -1) return res.status(404).json({ message: 'Slot not found' });

    // Update fields but protect existing bookings
    currentSlots[slotIndex] = {
      ...currentSlots[slotIndex],
      ...req.body,
      // Recalculate available seats just in case HR changes the total capacity
      availableSeats: (req.body.capacity || currentSlots[slotIndex].capacity) - (currentSlots[slotIndex].bookings?.length || 0)
    };

    writeSlotsToFile(currentSlots);
    res.json({ message: 'Slot updated successfully', slot: currentSlots[slotIndex] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a slot (HR Admin)
const deleteSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    let currentSlots = readSlotsFromFile();
    
    const initialLength = currentSlots.length;
    // Keep everything EXCEPT the slot with the matching ID
    currentSlots = currentSlots.filter(s => s._id !== slotId && s.id !== slotId);

    if (currentSlots.length === initialLength) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    writeSlotsToFile(currentSlots);
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createSlot: scheduleDirectForCandidate,
  scheduleDirectForCandidate,
  getAvailableSlots,
  getAllSlots,
  getSlots: getAllSlots, // support variant router names
  getSlotDetails: async (req, res) => { res.json(readSlotsFromFile()[0] || {}); },
  updateSlot,
  deleteSlot,
  bookSlot,
  getBookingHistory
};
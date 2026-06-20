const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const usersFilePath = path.join(__dirname, 'users_storage.json');

// Safely read registered users from local file
const readUsersFromFile = () => {
  try {
    if (!fs.existsSync(usersFilePath)) {
      const initialAdmin = [{
        _id: 'admin123', id: 'admin123',
        name: 'HR Manager (Admin)', email: 'hr@portal.com',
        password: 'admin123', role: 'admin'
      }];
      fs.writeFileSync(usersFilePath, JSON.stringify(initialAdmin, null, 2));
      return initialAdmin;
    }
    const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(fileContent || '[]');
  } catch (error) { return []; }
};

const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// @desc    Register a real candidate (Saves to file)
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const cleanEmail = email?.toLowerCase().trim();
    const users = readUsersFromFile();

    if (users.find(u => u.email === cleanEmail)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
      _id: "user_" + Math.random().toString(36).substr(2, 9),
      name: name || 'Registered Candidate',
      email: cleanEmail,
      password: password, 
      role: role || 'candidate'
    };
    newUser.id = newUser._id;

    users.push(newUser);
    writeUsersToFile(users);

    // ⚡ Embed real name & email directly into the token for the slot controller to read
    const token = jwt.sign({ id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login checking real credentials
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email?.toLowerCase().trim();
    const users = readUsersFromFile();

    const user = users.find(u => u.email === cleanEmail && u.password === password);

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get accurate profile info bypassing the broken Mongoose DB
exports.getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.decode(token);
      return res.json({ _id: decoded.id, id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role });
    }
    res.status(404).json({ message: "User not found" });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
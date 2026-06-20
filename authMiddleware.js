const jwt = require('jsonwebtoken');

// Verifies if the incoming request has a valid login token
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Format: Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verify token authenticity
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user information to the request payload
      req.user = decoded;
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
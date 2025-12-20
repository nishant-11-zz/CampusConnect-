const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Protect route - requires login
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      answer: "Access denied. Please log in to continue."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        answer: "Invalid token. User not found."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      answer: "Your session has expired. Please log in again."
    });
  }
};

// Admin-only middleware
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      answer: "Access denied. Authentication required."
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      answer: "Access denied. Admin privileges required."
    });
  }

  next();
};

module.exports = { protect, admin };
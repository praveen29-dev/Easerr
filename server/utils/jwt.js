import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ _id: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: '7d' // 7 days
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  if (!token) {
    throw new Error('Authentication token is required');
  }
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Get token from request
export const getTokenFromRequest = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    // Get token from Authorization header
    return req.headers.authorization.replace('Bearer ', '');
  } else if (req.cookies && req.cookies.auth_token) {
    // Get token from cookies
    return req.cookies.auth_token;
  }
  
  return null;
}; 
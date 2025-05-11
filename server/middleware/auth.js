import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getTokenFromRequest } from '../utils/jwt.js';

// Middleware to authenticate users with JWT
export const auth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with matching id and token
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token
    });
    
    if (!user) {
      throw new Error();
    }
    
    // Add user and token to request for use in route handlers
    req.token = token;
    req.user = user;
    req.user.userId = user._id.toString();
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Middleware to restrict access by role
export const restrict = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions' });
    }
    
    next();
  };
};

// Middleware for checking specific roles
export const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. ${role} role required.` 
      });
    }
    
    next();
  };
}; 
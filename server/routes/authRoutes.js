import express from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword
} from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/password-reset-request', requestPasswordReset);
router.post('/password-reset', resetPassword);

// Protected routes
router.post('/logout', auth, logout);
router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);

export default router; 
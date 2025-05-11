import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/jwt.js';
import { uploadToStorage } from '../utils/firebase.js';

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'user'
    });

    // Handle profile image upload if provided
    if (req.files && req.files.profileImage) {
      const profileImageUrl = await uploadToStorage(
        req.files.profileImage,
        `profile-images/${user._id}`
      );
      user.profileImage = profileImageUrl;
    }

    // Handle resume upload if provided
    if (req.files && req.files.resume) {
      const resumeUrl = await uploadToStorage(
        req.files.resume,
        `resumes/${user._id}`
      );
      user.resume = resumeUrl;
    }

    // Save user and generate token
    await user.save();
    const token = await user.generateAuthToken();

    // Set token in HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(201).json({ 
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by credentials
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();

    // Set token in HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: 'Invalid login credentials' });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    // Remove the current token
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    
    await req.user.save();
    
    // Clear cookie
    res.clearCookie('auth_token');
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current logged-in user's profile
export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    
    // Check if updates are valid
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    // Apply updates to user
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    // Handle profile image upload if provided
    if (req.files && req.files.profileImage) {
      const profileImageUrl = await uploadToStorage(
        req.files.profileImage,
        `profile-images/${req.user._id}`
      );
      req.user.profileImage = profileImageUrl;
    }

    // Handle resume upload if provided
    if (req.files && req.files.resume) {
      const resumeUrl = await uploadToStorage(
        req.files.resume,
        `resumes/${req.user._id}`
      );
      req.user.resume = resumeUrl;
    }

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password request
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET + user.password,
      { expiresIn: '1h' }
    );

    // Here you would typically send an email with the reset link
    // For this implementation, we just return the token
    // In a real app, send an email with a link containing this token
    
    res.json({ 
      message: 'Password reset email sent',
      token: resetToken // In a real app, don't return this directly
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password confirm
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    
    // Verify token and get user ID
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    const user = await User.findById(payload._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update password
    user.password = password;
    await user.save();
    
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 
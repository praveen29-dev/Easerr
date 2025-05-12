import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    console.log('Checking for existing admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists, skipping creation.');
      mongoose.disconnect();
      return;
    }
    
    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123', // This will be hashed by the pre-save hook
      role: 'admin'
    });
    
    // Save the admin user
    await adminUser.save();
    
    console.log('Admin user created successfully!');
    console.log('Admin email: admin@example.com');
    console.log('Admin password: Admin@123');
    
    // Disconnect from the database
    mongoose.disconnect();
    
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seeder
createAdminUser(); 
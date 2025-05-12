import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FaExclamation, FaTimes } from 'react-icons/fa';
import logo from '../assets/Logo-white.png';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(formData.email, formData.password);
      setError('');
      onClose();
    } catch (err) {
      if (err && err.message === 'Invalid login credentials') {
        setError('Invalid email or password');
      } else {
        setError(err?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openForgotPassword = () => {
    setIsForgotPasswordOpen(true);
  };

  const closeForgotPassword = () => {
    setIsForgotPasswordOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-lg w-full max-w-4xl h-[600px] flex overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <FaTimes size={24} />
        </button>
        
        {/* Left Section */}
        <div className="w-1/2 bg-gradient-to-br from-purple-600 to-blue-500 p-12 flex flex-col justify-between text-white">
          <div>
            <img src={logo} alt="Easerr Logo" className="w-16 h-16 rounded-lg p-2" />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Welcome back!<br />
              Let's get<br />
              you closer to your<br />
              goals.
            </h1>
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2">
                <FaExclamation className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="font-medium">Connecting Talent,</p>
                <p className="font-medium">Creating Opportunities.</p>
              </div>
            </div>
          </div>
          <div></div>
        </div>

        {/* Right Section */}
        <div className="w-1/2 p-12 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-8">Let's Get Started</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  name="email"
                  placeholder="Email address or mobile number"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border-transparent focus:border-purple-500 focus:bg-white focus:ring-0"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border-transparent focus:border-purple-500 focus:bg-white focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              <div className="text-right">
                <a href="#" className="text-sm text-gray-500 hover:text-purple-600" onClick={openForgotPassword}>
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                {isSubmitting ? 'Logging in...' : 'Sign In'}
              </button>
            </form>
          </div>
          <div className="text-center">
            <p className="text-gray-500">
              Don't have an account?{' '}
              <a href="#" className="text-purple-600 font-medium hover:text-purple-700" onClick={onSwitchToSignup}>
                Sign up
              </a>
            </p>
            <p className="text-sm text-gray-400 mt-8">
              All rights reserved © Easerr
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={isForgotPasswordOpen} 
        onClose={closeForgotPassword} 
      />
    </div>
  );
};

export default LoginModal; 
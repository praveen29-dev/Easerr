import { useState, useRef } from 'react';
import { FaTimes, FaExclamation } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import logo from '../assets/Logo-white.png';
import { useAuth } from '../context/AuthContext';

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [profileImage, setProfileImage] = useState(null);
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const profileInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  
  const { signup } = useAuth();

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
    if (!formData.email || !formData.name || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profileImage,
        resume,
        role: formData.role
      };
      
      await signup(userData);
      setError('');
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        setError('Profile image must be less than 3MB');
        return;
      }
      setProfileImage(file);
      setError('');
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Resume must be less than 5MB');
        return;
      }
      setResume(file);
      setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-lg w-full max-w-5xl h-[700px] flex overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute z-10 text-gray-500 top-4 right-4 hover:text-gray-700"
        >
          <FaTimes size={24} />
        </button>

        {/* Left Section */}
        <div className="flex flex-col justify-between w-5/12 p-12 text-white bg-gradient-to-br from-purple-600 to-blue-500">
          <div>
            <img src={logo} alt="Easerr Logo" className="w-16 h-16 p-2 rounded-lg" />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Join our<br />
              community and<br />
              unlock new<br />
              opportunities.
            </h1>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-full">
                <FaExclamation className="text-xl text-purple-600" />
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
        <div className="flex flex-col justify-between w-7/12 p-12 overflow-y-auto">
          <div>
            <h2 className="mb-8 text-2xl font-bold">Create your account</h2>
            
            {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:border-purple-500 focus:bg-white focus:ring-0"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:border-purple-500 focus:bg-white focus:ring-0"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:border-purple-500 focus:bg-white focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:border-purple-500 focus:bg-white focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2"
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
                  className={`flex-1 py-3 px-4 rounded-lg border ${
                    formData.role === 'user'
                      ? 'bg-purple-600 text-white border-transparent'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'recruiter' }))}
                  className={`flex-1 py-3 px-4 rounded-lg border ${
                    formData.role === 'recruiter'
                      ? 'bg-purple-600 text-white border-transparent'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Recruiter
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => profileInputRef.current.click()}
                  className="flex-1 px-4 py-3 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none"
                >
                  {profileImage ? 'Change Profile Picture' : 'Upload Profile Picture'}
                </button>
                <input
                  type="file"
                  ref={profileInputRef}
                  onChange={handleProfileImageChange}
                  accept="image/*"
                  className="hidden"
                />
                {formData.role === 'user' && (
                  <>
                    <button
                      type="button"
                      onClick={() => resumeInputRef.current.click()}
                      className="flex-1 px-4 py-3 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none"
                    >
                      {resume ? 'Change Resume' : 'Upload Resume'}
                    </button>
                    <input
                      type="file"
                      ref={resumeInputRef}
                      onChange={handleResumeChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Already have an account?{' '}
              <button onClick={onSwitchToLogin} className="font-medium text-purple-600 hover:text-purple-700">
                Sign in
              </button>
            </p>
            <p className="mt-8 text-sm text-gray-400">
              All rights reserved © Easerr
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal; 
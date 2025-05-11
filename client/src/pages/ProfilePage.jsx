import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfileUpdate } from '../hooks/useProfileUpdate';
import ChangePasswordForm from '../components/ChangePasswordForm';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(null);
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const profileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Use the custom hook for updating user profile
  const { mutate: updateUser, isPending } = useProfileUpdate();

  // If not authenticated, redirect to home
  if (!isLoading && !user) {
    navigate('/');
    return null;
  }

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    try {
      await updateUser({
        name,
        profileImage: profileImage || undefined,
        resume: resume || undefined
      });
      
      setSuccess('Profile updated successfully');
      setProfileImage(null);
      setResume(null);
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    }
  };

  const handleProfileImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };
  
  const handleResumeChange = (e) => {
    if (e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
          
          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={user.email}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Account Type</label>
              <input
                type="text"
                id="role"
                value={user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
              {user.profileImageUrl && (
                <div className="mt-2 mb-3">
                  <img 
                    src={user.profileImageUrl} 
                    alt={user.name} 
                    className="h-24 w-24 rounded-full object-cover border border-gray-200"
                  />
                </div>
              )}
              <div className="mt-1 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => profileInputRef.current.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {user.profileImageUrl ? 'Change Image' : 'Upload Image'}
                </button>
                {profileImage && (
                  <span className="text-sm text-gray-500 truncate">
                    {profileImage.name}
                  </span>
                )}
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </div>
            </div>
            
            {user.role === 'user' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Resume/CV</label>
                {user.resumeUrl && (
                  <div className="mt-1 mb-2">
                    <a 
                      href={user.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-500"
                    >
                      View Current Resume
                    </a>
                  </div>
                )}
                <div className="mt-1 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {user.resumeUrl ? 'Change Resume' : 'Upload Resume'}
                  </button>
                  {resume && (
                    <span className="text-sm text-gray-500 truncate">
                      {resume.name}
                    </span>
                  )}
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
        
        <ChangePasswordForm />
      </div>
    </div>
  );
};

export default ProfilePage; 
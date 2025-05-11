import { useState, useRef, useEffect } from 'react';
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
  const [profilePreview, setProfilePreview] = useState(null);
  const [resume, setResume] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const profileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Use the custom hook for updating user profile
  const { mutate: updateUser, isPending } = useProfileUpdate();

  // Set initial values when user data is loaded
  useEffect(() => {
    if (user) {
      console.log('User data loaded:', user);
      console.log('Profile image URL:', user.profileImageUrl || user.profileImage);
      console.log('Resume URL:', user.resumeUrl || user.resume);
      setName(user.name || '');
    }
  }, [user]);

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
      // Clear file inputs after successful update
      setProfileImage(null);
      setProfilePreview(null);
      setResume(null);
      setResumePreview(null);
      setResumeName('');
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setProfileImage(file);
    }
  };
  
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
      setResumeName(file.name);
      
      // Only create a preview URL for PDF files
      if (file.type === 'application/pdf') {
        // Create a blob URL for the PDF
        const blobUrl = URL.createObjectURL(file);
        console.log('Created PDF preview URL:', blobUrl);
        setResumePreview(blobUrl);
      } else {
        // For non-PDF files, just show the filename without preview
        setResumePreview(null);
        console.log('Non-PDF file selected, no preview available');
      }
    }
  };

  // Clean up object URLs when component unmounts or when new files are selected
  useEffect(() => {
    return () => {
      if (profilePreview && profilePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePreview);
      }
      if (resumePreview && resumePreview.startsWith('blob:')) {
        URL.revokeObjectURL(resumePreview);
      }
    };
  }, [profilePreview, resumePreview]);

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              <div className="mt-2 mb-4">
                {/* Show image preview or current profile image */}
                {profilePreview ? (
                  <div className="relative">
                    <img 
                      src={profilePreview} 
                      alt="Profile preview" 
                      className="h-24 w-24 rounded-full object-cover border border-gray-200"
                    />
                    <span className="text-xs text-green-600 block mt-1">New image selected</span>
                  </div>
                ) : (user.profileImageUrl || user.profileImage) ? (
                  <img 
                    src={user.profileImageUrl || user.profileImage} 
                    alt={user.name} 
                    className="h-24 w-24 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                    <span className="text-gray-500 text-lg font-medium">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => profileInputRef.current.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {(user.profileImageUrl || user.profileImage) ? 'Change Image' : 'Upload Image'}
                </button>
                {profileImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileImage(null);
                      setProfilePreview(null);
                      profileInputRef.current.value = '';
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
                )}
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">JPG, PNG or GIF files. Max 3MB.</p>
            </div>
            
            {user.role === 'user' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resume/CV</label>
                
                {/* Resume Preview Section */}
                {resumePreview ? (
                  <div className="mt-2 mb-4">
                    <div className="border border-gray-200 rounded p-2 bg-gray-50 max-w-md">
                      <div className="flex items-center mb-2">
                        <svg className="h-8 w-8 text-red-500" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                          <path d="M181.9 256.1c-5-16-4.9-46.9-2-46.9 8.4 0 7.6 36.9 2 46.9zm-1.7 47.2c-7.7 20.2-17.3 43.3-28.4 62.7 18.3-7 39-17.2 62.9-21.9-12.7-9.6-24.9-23.4-34.5-40.8zM86.1 428.1c0 .8 13.2-5.4 34.9-40.2-6.7 6.3-16.8 15.8-34.9 40.2zM248 160h136v328c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V24C0 10.7 10.7 0 24 0h200v136c0 13.2 10.8 24 24 24zm-8 171.8c-20-12.2-33.3-29-42.7-53.8 4.5-18.5 11.6-46.6 6.2-64.2-4.7-29.4-42.4-26.5-47.8-6.8-5 18.3-.4 44.1 8.1 77-11.6 27.6-28.7 64.6-40.8 85.8-.1 0-.1.1-.2.1-27.1 13.9-73.6 44.5-54.5 68 5.6 6.9 16 10 21.5 10 17.9 0 35.7-18 61.1-61.8 25.8-8.5 54.1-19.1 79-23.2 21.7 11.8 47.1 19.5 64 19.5 29.2 0 31.2-32 19.7-43.4-13.9-13.6-54.3-9.7-73.6-7.2zM377 105L279 7c-4.5-4.5-10.6-7-17-7h-6v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-74.1 255.3c4.1-2.7-2.5-11.9-42.8-9 37.1 15.8 42.8 9 42.8 9z" />
                        </svg>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">New resume selected</p>
                          <p className="text-xs text-gray-500">{resumeName}</p>
                        </div>
                      </div>
                      {resumePreview && (
                        <iframe 
                          src={resumePreview} 
                          className="w-full h-40 border border-gray-300" 
                          title="Resume preview"
                        ></iframe>
                      )}
                    </div>
                  </div>
                ) : (user.resumeUrl || user.resume) ? (
                  <div className="mt-1 mb-3">
                    <a 
                      href={user.resumeUrl || user.resume} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-500 flex items-center"
                    >
                      <svg className="h-5 w-5 mr-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path d="M181.9 256.1c-5-16-4.9-46.9-2-46.9 8.4 0 7.6 36.9 2 46.9zm-1.7 47.2c-7.7 20.2-17.3 43.3-28.4 62.7 18.3-7 39-17.2 62.9-21.9-12.7-9.6-24.9-23.4-34.5-40.8zM86.1 428.1c0 .8 13.2-5.4 34.9-40.2-6.7 6.3-16.8 15.8-34.9 40.2zM248 160h136v328c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V24C0 10.7 10.7 0 24 0h200v136c0 13.2 10.8 24 24 24zm-8 171.8c-20-12.2-33.3-29-42.7-53.8 4.5-18.5 11.6-46.6 6.2-64.2-4.7-29.4-42.4-26.5-47.8-6.8-5 18.3-.4 44.1 8.1 77-11.6 27.6-28.7 64.6-40.8 85.8-.1 0-.1.1-.2.1-27.1 13.9-73.6 44.5-54.5 68 5.6 6.9 16 10 21.5 10 17.9 0 35.7-18 61.1-61.8 25.8-8.5 54.1-19.1 79-23.2 21.7 11.8 47.1 19.5 64 19.5 29.2 0 31.2-32 19.7-43.4-13.9-13.6-54.3-9.7-73.6-7.2zM377 105L279 7c-4.5-4.5-10.6-7-17-7h-6v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-74.1 255.3c4.1-2.7-2.5-11.9-42.8-9 37.1 15.8 42.8 9 42.8 9z" />
                      </svg>
                      View Current Resume
                    </a>
                  </div>
                ) : null}
                
                <div className="mt-1 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {(user.resumeUrl || user.resume) ? 'Change Resume' : 'Upload Resume'}
                  </button>
                  {resume && (
                    <button
                      type="button"
                      onClick={() => {
                        setResume(null);
                        setResumePreview(null);
                        setResumeName('');
                        resumeInputRef.current.value = '';
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </button>
                  )}
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">PDF or Word files. Max 5MB.</p>
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
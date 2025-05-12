import { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'
import SignupModal from './SignupModal'

const Navbar = () => {
  const [profileImageError, setProfileImageError] = useState(false);
  
  const { 
    user, 
    logout, 
    isLoginModalOpen, 
    isSignupModalOpen, 
    openLoginModal, 
    openSignupModal, 
    closeAuthModals 
  } = useAuth();
  
  const navigate = useNavigate();
  
  // Reset image error state when user changes
  useEffect(() => {
    setProfileImageError(false);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  const handleImageError = () => {
    setProfileImageError(true);
  };

  // Check if user is a job seeker (role is 'user')
  const isJobSeeker = user?.role === 'user';
  
  // Check if user is a recruiter
  const isRecruiter = user?.role === 'recruiter';

  return (
    <div className='px-6 py-4 flex flex-row justify-between items-center shadow-sm'>
      {/* Left - Logo */}
      <a href='/'>
        <img className='h-12' src={assets.logo} alt='Easerr' />
      </a>

      {/* Right - Login/Signup or User Menu */}
      <div className=''>
        {user ? (
          <div className='flex items-center gap-4'>
            {/* Only show Applications link in top nav for job seekers */}
            {!isRecruiter && (
              <Link to='/applications' className='hidden text-gray-600 sm:block hover:text-gray-800'>
                Applications
              </Link>
            )}
            <div className='relative group'>
              <div className='flex items-center cursor-pointer gap-2'>
                <div className='w-10 h-10 overflow-hidden rounded-full'>
                  {!profileImageError && user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name || 'User'}
                      className='object-cover w-full h-full'
                      onError={handleImageError}
                    />
                  ) : (
                    <div className='flex items-center justify-center w-full h-full text-white bg-purple-600'>
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
              </div>
              <div className='absolute right-0 z-10 invisible p-2 mt-2 bg-white border rounded shadow-lg opacity-0 w-36 group-hover:opacity-100 group-hover:visible transition-all'>
                <Link to='/profile' className='block p-2 text-gray-700 rounded hover:bg-gray-100'>
                  Profile
                </Link>
                {/* Only show Applications in dropdown for job seekers */}
                {!isRecruiter && (
                  <Link to='/applications' className='block p-2 text-gray-700 rounded hover:bg-gray-100'>
                    Applications
                  </Link>
                )}
                <div className='border-t my-1'></div>
                {/* Only show Dashboard for recruiters */}
                {!isJobSeeker && (
                  <Link to='/dashboard' className='block p-2 text-gray-700 rounded hover:bg-gray-100'>
                    Dashboard
                  </Link>
                )}
                <div className='border-t my-1'></div>
                <button
                  onClick={handleLogout}
                  className='block w-full p-2 text-left text-gray-700 rounded hover:bg-gray-100'
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex gap-4 max-sm:text-xs'>
            <button 
              onClick={openSignupModal}
              className='text-gray-600 hover:text-gray-800'
            >
              Register
            </button>
            <button 
              onClick={openLoginModal} 
              className='px-6 py-2 text-white rounded-full bg-gradient-to-r from-purple-500 to-blue-500 sm:px-9 hover:bg-purple-700'
            >
              Login
            </button>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeAuthModals}
        onSwitchToSignup={openSignupModal}
      />
      
      {/* Signup Modal */}
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={closeAuthModals}
        onSwitchToLogin={openLoginModal}
      />
    </div>
  )
}

export default Navbar
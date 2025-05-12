import { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'
import SignupModal from './SignupModal'

const Navbar = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Reset image error state when user changes
  useEffect(() => {
    setProfileImageError(false);
  }, [user]);
  
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSignupModalOpen(false);
  };
  
  const openSignupModal = () => {
    setIsSignupModalOpen(true);
    setIsLoginModalOpen(false);
  };
  
  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  const handleImageError = () => {
    setProfileImageError(true);
  };

  return (
    <div className='py-4 shadow 2xl:px-20"'>
      <div className='container flex items-center justify-between px-4 mx-auto '>
        <img onClick={() => navigate('/')} className='cursor-pointer' src={assets.logo} alt='Easerr Logo' />
        
        {user ? (
          <div className='flex items-center gap-3'>
            {user.role === 'recruiter' ? (
              <>
                <Link to='/dashboard' className='text-gray-700 hover:text-purple-600'>Dashboard</Link>
                <p>|</p>
              </>
            ) : (
              <>
                <Link to='/applications' className='text-gray-700 hover:text-purple-600'>Applied Jobs</Link>
                <p>|</p>
              </>
            )}
            <p className='max-sm:hidden'>Hi, {user.name}</p>
            <Link to="/profile">
              {user.profileImageUrl && !profileImageError ? (
                <div className='flex-shrink-0 w-8 h-8 overflow-hidden border border-gray-200 rounded-full'>
                  <img 
                    src={user.profileImageUrl} 
                    alt={user.name} 
                    className='object-cover w-full h-full'
                    onError={handleImageError}
                  />
                </div>
              ) : (
                <div 
                  className='flex items-center justify-center w-8 h-8 text-white bg-purple-600 rounded-full hover:bg-purple-700'
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </Link>
            <button 
              onClick={handleLogout}
              className='text-sm text-gray-600 hover:text-gray-800'
            >
              Logout
            </button>
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
        onClose={closeModals}
        onSwitchToSignup={openSignupModal}
      />
      
      {/* Signup Modal */}
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={closeModals}
        onSwitchToLogin={openLoginModal}
      />
    </div>
  )
}

export default Navbar
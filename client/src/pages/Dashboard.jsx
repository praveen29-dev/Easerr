import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// DashboardNavbar Component
const DashboardNavbar = ({ 
    getUserDisplayName, 
    getUserImage, 
    hasProfileImage, 
    getInitialsAvatar, 
    handleLogout, 
    navigate,
    currentUser
}) => {
    return (
        <div className='py-4 shadow-sm bg-white border-b border-gray-200 sticky top-0 z-10'>
            <div className='flex items-center justify-between px-6 max-w-7xl mx-auto'>
                <img 
                    onClick={() => navigate('/')} 
                    className='cursor-pointer h-10 object-contain' 
                    src={assets.logo} 
                    alt="Easerr Logo" 
                />
                <div className='flex items-center gap-4'>
                    <p className='max-sm:hidden text-gray-700'>Welcome, <span className="font-semibold">{getUserDisplayName()}</span></p>
                    <div className='relative group'>
                        <div className="flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded-full hover:bg-gray-100 border border-gray-200">
                            {hasProfileImage() ? (
                                <img 
                                    className='w-8 h-8 rounded-full object-cover' 
                                    src={getUserImage()} 
                                    alt="Profile" 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                            ) : (
                                <div className='w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium'>
                                    {getInitialsAvatar()}
                                </div>
                            )}
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                        <div className='absolute top-0 right-0 z-20 hidden pt-12 text-black rounded group-hover:block shadow-xl'>
                            <ul className='p-2 w-48 m-0 text-sm bg-white border rounded-md'>
                                <li className="px-4 py-2 text-gray-600 border-b border-gray-100">
                                    <div className="font-medium">{getUserDisplayName()}</div>
                                    <div className="text-xs text-gray-500 truncate">{currentUser?.email || ''}</div>
                                </li>
                                <li onClick={() => navigate('/profile')} className='px-4 py-2.5 cursor-pointer hover:bg-gray-50 rounded flex items-center gap-2'>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                    Profile
                                </li>
                                <div className="my-1.5 border-t border-gray-100"></div>
                                <li onClick={handleLogout} className='px-4 py-2.5 cursor-pointer hover:bg-red-50 rounded flex items-center gap-2 text-red-600'>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                    </svg>
                                    Logout
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// DashboardSidebar Component
const DashboardSidebar = ({ isPathActive }) => {
    return (
        <div className='md:w-64 md:min-h-screen bg-white shadow-sm border-r border-gray-200 sticky md:top-[73px] top-0 h-full'>
            <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
            </div>
            <ul className='flex flex-col'>
            <NavLink 
                    className={({ isActive }) =>
                        `flex items-center p-4 gap-3 hover:bg-gray-50 transition-colors ${
                            isActive ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700 font-medium' : 'text-gray-700 border-l-4 border-transparent'
                        }`
                    } 
                    to="/dashboard/manage-jobs"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    <span>Manage Jobs</span>
                </NavLink>
                <NavLink
                    className={({ isActive }) =>
                        `flex items-center p-4 gap-3 hover:bg-gray-50 transition-colors ${
                            isActive ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700 font-medium' : 'text-gray-700 border-l-4 border-transparent'
                        }`
                    }
                    to="/dashboard/add-job"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span>Add Job</span>
                </NavLink>
            </ul>
        </div>
    );
}

const Dashboard = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { logout, currentUser, loading: authLoading } = useAuth()
    
    // Redirect all users to manage-jobs when on the main dashboard
    useEffect(() => {
        if (location.pathname === '/dashboard') {
            navigate('/dashboard/manage-jobs');
        }
    }, [location.pathname, navigate]);
    
    // Check if a path is active or if any of its children are active
    const isPathActive = (path) => location.pathname.startsWith(path);

    // Function to handle logout
    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }
    
    // Get user display name
    const getUserDisplayName = () => {
        try {
            if (!currentUser) return 'User';
            return currentUser.name || currentUser.displayName || 
                   (currentUser.email ? currentUser.email.split('@')[0] : 'User');
        } catch (error) {
            console.error('Error getting user display name:', error);
            return 'User';
        }
    }
    
    // Get appropriate user image
    const getUserImage = () => {
        try {
            if (!currentUser) return assets.company_icon;
            return currentUser.profileImage || currentUser.photoURL || 
                   currentUser.image || assets.company_icon;
        } catch (error) {
            console.error('Error getting user image:', error);
            return assets.company_icon;
        }
    }
    
    // Generate initials avatar when no image is available
    const getInitialsAvatar = () => getUserDisplayName().charAt(0).toUpperCase();

    // Check if the user has a profile image
    const hasProfileImage = () => !!(currentUser?.profileImage || currentUser?.photoURL || currentUser?.image);

    // Show loading state if auth is loading
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header/Navbar */}
            <DashboardNavbar 
                getUserDisplayName={getUserDisplayName}
                getUserImage={getUserImage}
                hasProfileImage={hasProfileImage}
                getInitialsAvatar={getInitialsAvatar}
                handleLogout={handleLogout}
                navigate={navigate}
                currentUser={currentUser}
            />

            <div className='flex flex-col md:flex-row max-w-7xl mx-auto'>
                {/* Sidebar */}
                <DashboardSidebar isPathActive={isPathActive} />

                {/* Main Content */}
                <div className="flex-1 p-6 bg-gray-50">
                    {/* Always use Outlet to display sub-routes */}
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
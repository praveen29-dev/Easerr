import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getJobStats } from '../api/jobApi'
import { getAllRecruiterApplications } from '../api/applicationApi'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../context/AuthContext'

// Status colors for application badges
const statusColors = {
  active: 'bg-green-100 text-green-800 border border-green-200',
  closed: 'bg-red-100 text-red-800 border border-red-200',
  draft: 'bg-gray-100 text-gray-800 border border-gray-200',
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  reviewed: 'bg-blue-100 text-blue-800 border border-blue-200',
  shortlisted: 'bg-green-100 text-green-800 border border-green-200',
  rejected: 'bg-red-100 text-red-800 border border-red-200',
  hired: 'bg-purple-100 text-purple-800 border border-purple-200'
}

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
                                <li onClick={() => navigate('/dashboard/settings')} className='px-4 py-2.5 cursor-pointer hover:bg-gray-50 rounded flex items-center gap-2'>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    Settings
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
const DashboardSidebar = ({ expandedSections, toggleSection, isPathActive }) => {
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
                    to="/dashboard"
                    end
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    <span>Overview</span>
                </NavLink>
                
                {/* Jobs Section */}
                <div 
                    className={`cursor-pointer hover:bg-gray-50 ${isPathActive('/dashboard/add-job') || 
                    isPathActive('/dashboard/manage-jobs') || 
                    isPathActive('/dashboard/job-statistics') ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`} 
                    onClick={() => toggleSection('jobs')}
                >
                    <div className="px-4 pt-5 pb-2 flex justify-between items-center">
                        <span className={`text-xs uppercase font-bold ${isPathActive('/dashboard/add-job') || 
                        isPathActive('/dashboard/manage-jobs') || 
                        isPathActive('/dashboard/job-statistics') ? 'text-blue-700' : 'text-gray-500'}`}>
                            Jobs Management
                        </span>
                        <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${expandedSections.jobs ? 'rotate-180' : ''} ${
                                isPathActive('/dashboard/add-job') || 
                                isPathActive('/dashboard/manage-jobs') || 
                                isPathActive('/dashboard/job-statistics') ? 'text-blue-500' : 'text-gray-500'
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>

                {expandedSections.jobs && (
                    <>
                        <NavLink
                            className={({ isActive }) =>
                                `flex items-center p-3 ml-3 gap-3 rounded-md hover:bg-gray-50 transition-colors ${
                                    isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                }`
                            }
                            to="/dashboard/add-job"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            <span>Add Job</span>
                        </NavLink>

                        <NavLink className={({ isActive }) =>
                            `flex items-center p-3 ml-3 gap-3 rounded-md hover:bg-gray-50 transition-colors ${
                                isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`
                        } to={'/dashboard/manage-jobs'}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                            </svg>
                            <span>Manage Jobs</span>
                        </NavLink>
                        
                        <NavLink className={({ isActive }) =>
                            `flex items-center p-3 ml-3 gap-3 rounded-md hover:bg-gray-50 transition-colors ${
                                isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`
                        } to={'/dashboard/job-statistics'}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>Job Statistics</span>
                        </NavLink>
                    </>
                )}

                {/* Applications Section */}
                <div 
                    className={`cursor-pointer hover:bg-gray-50 ${isPathActive('/dashboard/view-applications') ? 
                    'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`} 
                    onClick={() => toggleSection('applications')}
                >
                    <div className="px-4 pt-5 pb-2 flex justify-between items-center">
                        <span className={`text-xs uppercase font-bold ${isPathActive('/dashboard/view-applications') ? 
                        'text-blue-700' : 'text-gray-500'}`}>
                            Applications
                        </span>
                        <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${expandedSections.applications ? 'rotate-180' : ''} ${
                                isPathActive('/dashboard/view-applications') ? 'text-blue-500' : 'text-gray-500'
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>

                {expandedSections.applications && (
                    <NavLink className={({ isActive }) =>
                        `flex items-center p-3 ml-3 gap-3 rounded-md hover:bg-gray-50 transition-colors ${
                            isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`
                    } to={'/dashboard/view-applications'}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <span>Applications</span>
                    </NavLink>
                )}

                {/* Recruiters Section */}
                <div 
                    className={`cursor-pointer hover:bg-gray-50 ${isPathActive('/dashboard/recruiters') || 
                    isPathActive('/dashboard/recruiter-stats') ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`} 
                    onClick={() => toggleSection('recruiters')}
                >
                    <div className="px-4 pt-5 pb-2 flex justify-between items-center">
                        <span className={`text-xs uppercase font-bold ${isPathActive('/dashboard/recruiters') || 
                        isPathActive('/dashboard/recruiter-stats') ? 'text-blue-700' : 'text-gray-500'}`}>
                            Recruiters
                        </span>
                        <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${expandedSections.recruiters ? 'rotate-180' : ''} ${
                                isPathActive('/dashboard/recruiters') || 
                                isPathActive('/dashboard/recruiter-stats') ? 'text-blue-500' : 'text-gray-500'
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>

                {expandedSections.recruiters && (
                    <>
                        <NavLink className={({ isActive }) =>
                            `flex items-center p-3 ml-3 gap-3 rounded-md hover:bg-gray-50 transition-colors ${
                                isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`
                        } to={'/dashboard/recruiters'}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <span>Manage Recruiters</span>
                        </NavLink>
                        
                        <NavLink className={({ isActive }) =>
                            `flex items-center p-3 ml-3 gap-3 rounded-md hover:bg-gray-50 transition-colors ${
                                isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`
                        } to={'/dashboard/recruiter-stats'}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                            <span>Recruiter Analytics</span>
                        </NavLink>
                    </>
                )}

                {/* Settings Section */}
                <div 
                    className={`cursor-pointer hover:bg-gray-50 ${isPathActive('/dashboard/settings') ? 
                    'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`} 
                    onClick={() => toggleSection('settings')}
                >
                    <div className="px-4 pt-5 pb-2 flex justify-between items-center">
                        <span className={`text-xs uppercase font-bold ${isPathActive('/dashboard/settings') ? 
                        'text-blue-700' : 'text-gray-500'}`}>
                            Settings
                        </span>
                        <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${expandedSections.settings ? 'rotate-180' : ''} ${
                                isPathActive('/dashboard/settings') ? 'text-blue-500' : 'text-gray-500'
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>

                {expandedSections.settings && (
                    <NavLink className={({ isActive }) =>
                        `flex items-center p-3 ml-3 gap-3 rounded-md hover:bg-gray-50 transition-colors ${
                            isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`
                    } to={'/dashboard/settings'}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span>Settings</span>
                    </NavLink>
                )}
            </ul>
        </div>
    );
}

const Dashboard = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { logout, currentUser, loading: authLoading } = useAuth()
    
    // State to track which sections are expanded
    const [expandedSections, setExpandedSections] = useState({
        jobs: true,
        applications: true,
        recruiters: true,
        settings: true
    })

    // Automatically expand sections based on the current route
    useEffect(() => {
        const currentPath = location.pathname;
        
        const sections = {
            jobs: ['/dashboard/add-job', '/dashboard/manage-jobs', '/dashboard/job-statistics'],
            applications: ['/dashboard/view-applications'],
            recruiters: ['/dashboard/recruiters', '/dashboard/recruiter-stats'],
            settings: ['/dashboard/settings']
        };
        
        // Check each section
        Object.entries(sections).forEach(([section, paths]) => {
            if (paths.some(path => currentPath.includes(path))) {
                setExpandedSections(prev => ({ ...prev, [section]: true }));
            }
        });
    }, [location.pathname]);

    // Toggle section expansion
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }
    
    // Check if we are on the main dashboard route or a nested route
    const isMainDashboard = location.pathname === '/dashboard'

    // Check if a path is active or if any of its children are active
    const isPathActive = (path) => location.pathname.startsWith(path);

    // Fetch job statistics
    const { 
        data: statsData, 
        isLoading: isStatsLoading,
        error: statsError
    } = useQuery({
        queryKey: ['jobStats'],
        queryFn: getJobStats,
        // Only fetch data if we're on the main dashboard
        enabled: isMainDashboard,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        onError: (error) => {
            console.error('Error fetching job stats:', error);
        }
    })

    // Fetch recent applications (limit to 5 most recent)
    const { 
        data: applicationsData, 
        isLoading: isApplicationsLoading,
        error: applicationsError
    } = useQuery({
        queryKey: ['recentApplications'],
        queryFn: () => getAllRecruiterApplications({ limit: 5 }),
        // Only fetch data if we're on the main dashboard
        enabled: isMainDashboard,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
        onError: (error) => {
            console.error('Error fetching recent applications:', error);
        }
    })

    // Loading state
    const isLoading = (isStatsLoading || isApplicationsLoading) && isMainDashboard;
    
    // Check for data errors
    const hasErrors = statsError || applicationsError;
    
    // Default values in case data is not loaded
    const { jobStats, applicationStats, monthlyJobStats } = statsData?.data || { 
        jobStats: { total: 0, active: 0, closed: 0, draft: 0 },
        applicationStats: { total: 0, pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, hired: 0 },
        monthlyJobStats: []
    }

    const recentApplications = applicationsData?.applications || []

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

    // Show loading state if data is loading on main dashboard
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <DashboardNavbar 
                    getUserDisplayName={getUserDisplayName}
                    getUserImage={getUserImage}
                    hasProfileImage={hasProfileImage}
                    getInitialsAvatar={getInitialsAvatar}
                    handleLogout={handleLogout}
                    navigate={navigate}
                    currentUser={currentUser}
                />
                <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
                    <DashboardSidebar 
                        expandedSections={expandedSections}
                        toggleSection={toggleSection}
                        isPathActive={isPathActive}
                    />
                    <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center min-h-[400px]">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        )
    }

    // Show error state if there were errors fetching data
    if (hasErrors && isMainDashboard) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <DashboardNavbar 
                    getUserDisplayName={getUserDisplayName}
                    getUserImage={getUserImage}
                    hasProfileImage={hasProfileImage}
                    getInitialsAvatar={getInitialsAvatar}
                    handleLogout={handleLogout}
                    navigate={navigate}
                    currentUser={currentUser}
                />
                <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
                    <DashboardSidebar 
                        expandedSections={expandedSections}
                        toggleSection={toggleSection}
                        isPathActive={isPathActive}
                    />
                    <div className="flex-1 p-6 bg-gray-50">
                        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
                            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard Data</h2>
                            <p className="text-gray-600 mb-4">There was a problem loading the dashboard data. This might be due to connection issues or server problems.</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                <DashboardSidebar expandedSections={expandedSections} toggleSection={toggleSection} isPathActive={isPathActive} />

                {/* Main Content */}
                <div className="flex-1 p-6 bg-gray-50">
                    {isMainDashboard ? (
                        /* Dashboard Overview Section */
                        <DashboardOverview 
                            jobStats={jobStats}
                            applicationStats={applicationStats}
                            recentApplications={recentApplications}
                            statusColors={statusColors}
                        />
                    ) : (
                        /* Sub-route content */
                        <Outlet />
                    )}
                </div>
            </div>
        </div>
    )
}

// DashboardOverview Component
const DashboardOverview = ({ jobStats, applicationStats, recentApplications, statusColors }) => {
    // Ensure we have valid data
    const safeJobStats = jobStats || { total: 0, active: 0, closed: 0, draft: 0 };
    const safeAppStats = applicationStats || { total: 0, pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, hired: 0 };
    
    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Total Jobs */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Jobs</p>
                            <p className="text-3xl font-bold text-gray-800">
                                {safeJobStats.total !== undefined ? safeJobStats.total : 0}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full">
                            <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Last 30 days</span>
                    </div>
                </div>
                
                {/* Active Jobs */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Active Jobs</p>
                            <p className="text-3xl font-bold text-green-600">
                                {safeJobStats.active !== undefined ? safeJobStats.active : 0}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Currently accepting applications</span>
                    </div>
                </div>
                
                {/* Total Applications */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Applications</p>
                            <p className="text-3xl font-bold text-purple-600">
                                {safeAppStats.total !== undefined ? safeAppStats.total : 0}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-full">
                            <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">All time applications</span>
                    </div>
                </div>
                
                {/* Hired Candidates */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Hired Candidates</p>
                            <p className="text-3xl font-bold text-indigo-600">
                                {safeAppStats.hired !== undefined ? safeAppStats.hired : 0}
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-full">
                            <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Successfully hired candidates</span>
                    </div>
                </div>
            </div>
            
            {/* Applications by Status */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Applications by Status
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatusCard status="pending" count={safeAppStats.pending} />
                    <StatusCard status="reviewed" count={safeAppStats.reviewed} />
                    <StatusCard status="shortlisted" count={safeAppStats.shortlisted} />
                    <StatusCard status="rejected" count={safeAppStats.rejected} />
                    <StatusCard status="hired" count={safeAppStats.hired} />
                </div>
            </div>
            
            {/* Recent Applications */}
            <RecentApplicationsTable 
                applications={recentApplications || []}
                statusColors={statusColors}
            />
        </div>
    );
}

// StatusCard Component - For application status cards
const StatusCard = ({ status, count }) => {
    // Mapping for status colors and text
    const statusConfig = {
        pending: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-800',
            border: 'border-yellow-100',
            icon: (
                <svg className="w-5 h-5 text-yellow-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            )
        },
        reviewed: {
            bg: 'bg-blue-50',
            text: 'text-blue-800',
            border: 'border-blue-100',
            icon: (
                <svg className="w-5 h-5 text-blue-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 6h6"></path>
                </svg>
            )
        },
        shortlisted: {
            bg: 'bg-green-50',
            text: 'text-green-800',
            border: 'border-green-100',
            icon: (
                <svg className="w-5 h-5 text-green-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            )
        },
        rejected: {
            bg: 'bg-red-50',
            text: 'text-red-800',
            border: 'border-red-100',
            icon: (
                <svg className="w-5 h-5 text-red-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            )
        },
        hired: {
            bg: 'bg-purple-50',
            text: 'text-purple-800',
            border: 'border-purple-100',
            icon: (
                <svg className="w-5 h-5 text-purple-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
            )
        }
    };
    
    const config = statusConfig[status];
    
    return (
        <div className={`p-4 ${config.bg} rounded-lg border ${config.border} hover:shadow-sm transition-shadow duration-300`}>
            <div className="flex flex-col">
                <div className="flex items-center mb-2">
                    {config.icon}
                    <span className={`text-xs font-medium uppercase ${config.text}`}>{status}</span>
                </div>
                <span className={`text-2xl font-bold ${config.text}`}>
                    {count !== undefined && count !== null ? count : 0}
                </span>
            </div>
        </div>
    );
}

// RecentApplicationsTable Component
const RecentApplicationsTable = ({ applications, statusColors }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Recent Applications
                </h2>
                <Link to="/dashboard/view-applications" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline">
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </Link>
            </div>
            
            {applications.length === 0 ? (
                <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    No recent applications found.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Applicant
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Job Position
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Applied
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.map((application) => (
                                <tr key={application._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {application.applicant.image ? (
                                                <img 
                                                    src={application.applicant.image} 
                                                    alt={application.applicant.name}
                                                    className="w-9 h-9 rounded-full mr-3 object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-blue-100 mr-3 flex items-center justify-center text-blue-600 font-medium border border-blue-200">
                                                    {application.applicant.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {application.applicant.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {application.applicant.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-medium">{application.job.title}</div>
                                        <div className="text-xs text-gray-500">{application.job.company}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[application.status]}`}>
                                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link 
                                            to={`/dashboard/view-applications/${application.job._id}`}
                                            className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                                        >
                                            View
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                            </svg>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Dashboard
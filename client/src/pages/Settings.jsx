import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile, updatePassword } from '../api/userApi';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    image: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    applicationNotifications: true,
    jobUpdates: true,
    marketingEmails: false
  });
  
  // Get user profile data
  const { data: userData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    onSuccess: (data) => {
      if (data?.user) {
        setProfileForm({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          company: data.user.company || '',
          position: data.user.position || '',
          image: data.user.image || ''
        });
        
        // If the API returns notification settings
        if (data.user.notificationSettings) {
          setNotifications(data.user.notificationSettings);
        }
      }
    }
  });
  
  // Update profile mutation
  const profileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });
  
  // Update password mutation
  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update password');
    }
  });
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (setting) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Handle profile form submit
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileMutation.mutate(profileForm);
  };
  
  // Handle password form submit
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };
  
  // Handle notification settings submit
  const handleNotificationsSubmit = (e) => {
    e.preventDefault();
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Notification settings updated');
    }, 500);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h1>
      
      {/* Settings Tabs */}
      <div className="flex border-b mb-6">
        <button 
          className={`px-4 py-2 font-medium ${
            activeTab === 'profile' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`px-4 py-2 font-medium ${
            activeTab === 'password' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('password')}
        >
          Password
        </button>
        <button 
          className={`px-4 py-2 font-medium ${
            activeTab === 'notifications' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </div>
      
      {/* Profile Settings Form */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
          
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={profileForm.company}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex-1">
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={profileForm.position}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image URL
              </label>
              <input
                type="text"
                id="image"
                name="image"
                value={profileForm.image}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={profileMutation.isLoading}
              >
                {profileMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Password Settings Form */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={passwordMutation.isLoading}
              >
                {passwordMutation.isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Notification Settings Form */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Preferences</h2>
          
          <form onSubmit={handleNotificationsSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-800">Email Alerts</h3>
                  <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input 
                    type="checkbox" 
                    id="emailAlerts" 
                    className="sr-only"
                    checked={notifications.emailAlerts}
                    onChange={() => handleNotificationToggle('emailAlerts')}
                  />
                  <label 
                    htmlFor="emailAlerts"
                    className={`block w-12 h-6 rounded-full transition-colors cursor-pointer ${
                      notifications.emailAlerts ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span 
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${
                        notifications.emailAlerts ? 'translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-800">Application Notifications</h3>
                  <p className="text-sm text-gray-500">Notify when candidates apply to your job postings</p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input 
                    type="checkbox" 
                    id="applicationNotifications" 
                    className="sr-only"
                    checked={notifications.applicationNotifications}
                    onChange={() => handleNotificationToggle('applicationNotifications')}
                  />
                  <label 
                    htmlFor="applicationNotifications"
                    className={`block w-12 h-6 rounded-full transition-colors cursor-pointer ${
                      notifications.applicationNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span 
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${
                        notifications.applicationNotifications ? 'translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-800">Job Updates</h3>
                  <p className="text-sm text-gray-500">Notifications about your job postings (expiration, views, etc.)</p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input 
                    type="checkbox" 
                    id="jobUpdates" 
                    className="sr-only"
                    checked={notifications.jobUpdates}
                    onChange={() => handleNotificationToggle('jobUpdates')}
                  />
                  <label 
                    htmlFor="jobUpdates"
                    className={`block w-12 h-6 rounded-full transition-colors cursor-pointer ${
                      notifications.jobUpdates ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span 
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${
                        notifications.jobUpdates ? 'translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-800">Marketing Emails</h3>
                  <p className="text-sm text-gray-500">Receive promotional emails and newsletters</p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input 
                    type="checkbox" 
                    id="marketingEmails" 
                    className="sr-only"
                    checked={notifications.marketingEmails}
                    onChange={() => handleNotificationToggle('marketingEmails')}
                  />
                  <label 
                    htmlFor="marketingEmails"
                    className={`block w-12 h-6 rounded-full transition-colors cursor-pointer ${
                      notifications.marketingEmails ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span 
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${
                        notifications.marketingEmails ? 'translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings; 
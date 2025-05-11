import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Get current user profile
export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

// Update user profile information
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axios.patch(`${API_URL}/users/profile`, profileData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// Update user password
export const updatePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/update-password`,
      { currentPassword, newPassword },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update password');
  }
};

// Update notification preferences
export const updateNotificationSettings = async (notificationSettings) => {
  try {
    const response = await axios.patch(
      `${API_URL}/users/notification-settings`,
      { notificationSettings },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update notification settings');
  }
};

// Upload profile image
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await axios.post(`${API_URL}/users/upload-image`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload profile image');
  }
}; 
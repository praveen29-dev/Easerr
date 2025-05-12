import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Check if the user is authenticated and has admin role
 * @returns {Promise<boolean>} True if the user is authenticated as admin
 */
export const checkAdminAuth = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      withCredentials: true
    });
    
    return response.data?.user?.role === 'admin';
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return false;
  }
};

/**
 * Logout the current user
 * @returns {Promise<boolean>} True if logout was successful
 */
export const logoutUser = async () => {
  try {
    await axios.post(`${API_URL}/auth/logout`, {}, {
      withCredentials: true
    });
    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
}; 
import axios from 'axios';

// Create base axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Response containing user data and token
 */
export const register = async (userData) => {
  try {
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('role', userData.role || 'jobseeker');
    
    if (userData.company) {
      formData.append('company', userData.company);
    }
    
    if (userData.title) {
      formData.append('title', userData.title);
    }
    
    // Add files if provided
    if (userData.profileImage) {
      formData.append('profileImage', userData.profileImage);
    }
    
    if (userData.resume) {
      formData.append('resume', userData.resume);
    }
    
    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Response containing user data and token
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Logout error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update user profile
 * @param {Object} userData - User profile data to update
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (userData) => {
  try {
    const formData = new FormData();
    
    // Add text fields
    if (userData.name) formData.append('name', userData.name);
    if (userData.email) formData.append('email', userData.email);
    if (userData.title) formData.append('title', userData.title);
    if (userData.company) formData.append('company', userData.company);
    
    // Add skills if provided as array
    if (userData.skills && Array.isArray(userData.skills)) {
      userData.skills.forEach(skill => {
        formData.append('skills[]', skill);
      });
    }
    
    // Add files if provided
    if (userData.profileImage && userData.profileImage instanceof File) {
      formData.append('profileImage', userData.profileImage);
    }
    
    if (userData.resume && userData.resume instanceof File) {
      formData.append('resume', userData.resume);
    }
    
    const response = await api.patch('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Response message
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/auth/password-reset-request', { email });
    return response.data;
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} password - New password
 * @returns {Promise<Object>} Response message
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await api.post('/auth/password-reset', { token, password });
    return response.data;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error.response?.data || error.message;
  }
}; 
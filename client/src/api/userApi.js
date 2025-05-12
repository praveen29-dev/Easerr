import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create base axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
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
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

/**
 * Update user profile information
 * @param {Object} profileData - User profile data to update
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserProfile = async (profileData) => {
  try {
    // Determine if we need to use multipart/form-data
    const hasFiles = profileData.profileImage instanceof File || 
                     profileData.resume instanceof File;
    
    if (hasFiles) {
      const formData = new FormData();
      
      // Add text fields
      if (profileData.name) formData.append('name', profileData.name);
      if (profileData.email) formData.append('email', profileData.email);
      if (profileData.title) formData.append('title', profileData.title);
      if (profileData.company) formData.append('company', profileData.company);
      
      // Add skills if provided as array
      if (profileData.skills && Array.isArray(profileData.skills)) {
        profileData.skills.forEach(skill => {
          formData.append('skills[]', skill);
        });
      }
      
      // Add files
      if (profileData.profileImage instanceof File) {
        formData.append('profileImage', profileData.profileImage);
      }
      
      if (profileData.resume instanceof File) {
        formData.append('resume', profileData.resume);
      }
      
      const response = await api.patch('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
      
    } else {
      // Use regular JSON if no files
      const response = await api.patch('/auth/profile', profileData);
      return response.data;
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

/**
 * Update user password
 * @param {Object} passwordData - Current and new password
 * @returns {Promise<Object>} Success message
 */
export const updatePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await api.post(
      '/auth/update-password',
      { currentPassword, newPassword }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update password');
  }
};

/**
 * Upload profile image
 * @param {File} imageFile - Image file to upload
 * @returns {Promise<Object>} Updated user with profile image URL
 */
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    const response = await api.post('/auth/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload profile image');
  }
};

/**
 * Upload resume file
 * @param {File} resumeFile - Resume file to upload
 * @returns {Promise<Object>} Updated user with resume URL
 */
export const uploadResume = async (resumeFile) => {
  try {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    
    const response = await api.post('/auth/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload resume');
  }
};

/**
 * Get user job applications
 * @param {Object} options - Filter, sort and pagination options
 * @returns {Promise<Object>} Applications array with pagination
 */
export const getUserApplications = async ({
  status = 'all',
  sort = 'newest',
  page = 1,
  limit = 10
}) => {
  try {
    const response = await api.get('/applications/user', {
      params: {
        status,
        sort,
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch applications');
  }
};

/**
 * Save a job to favorites
 * @param {string} jobId - Job ID to save
 * @returns {Promise<Object>} Success status and message
 */
export const saveJob = async (jobId) => {
  try {
    const response = await api.post('/users/saved-jobs', { jobId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to save job');
  }
};

/**
 * Remove a job from favorites
 * @param {string} jobId - Job ID to remove
 * @returns {Promise<Object>} Success status and message
 */
export const unsaveJob = async (jobId) => {
  try {
    const response = await api.delete(`/users/saved-jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove saved job');
  }
};

/**
 * Get saved jobs
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Saved jobs array with pagination
 */
export const getSavedJobs = async ({ page = 1, limit = 10 }) => {
  try {
    const response = await api.get('/users/saved-jobs', {
      params: {
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch saved jobs');
  }
}; 
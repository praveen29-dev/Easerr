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

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  if (typeof id !== 'string') return false;
  if (id === 'undefined' || id === 'null') return false;
  
  // MongoDB ObjectId is typically a 24-character hex string
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Submit a job application
 * @param {Object} applicationData - Application data with job ID and cover letter
 * @param {File} [resumeFile] - Resume file to upload 
 * @returns {Promise<Object>} Created application with success status
 */
export const submitApplication = async (applicationData, resumeFile) => {
  try {
    // Validate job ID before submission
    if (!applicationData || !isValidObjectId(applicationData.job)) {
      throw new Error('Invalid job ID');
    }
    
    // Use FormData for file upload
    const formData = new FormData();
    formData.append('job', applicationData.job);
    formData.append('coverLetter', applicationData.coverLetter);
    
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    
    const response = await api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit application');
  }
};

/**
 * Get all applications submitted by current user (jobseeker)
 * @param {Object} options - Filter, sort and pagination options
 * @returns {Promise<Object>} Applications array with pagination and success status
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
    throw new Error(error.response?.data?.message || 'Failed to fetch your applications');
  }
};

/**
 * Get application details by ID
 * @param {string} id - Application ID
 * @returns {Promise<Object>} Application details with job and applicant info
 */
export const getApplicationById = async (id) => {
  try {
    // Validate application ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid application ID');
    }
    
    const response = await api.get(`/applications/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch application');
  }
};

/**
 * Get all applications for a specific job (for recruiters)
 * @param {Object} options - Job ID, filter, sort and pagination options
 * @returns {Promise<Object>} Applications array with pagination and success status
 */
export const getJobApplications = async ({ 
  jobId, 
  status = 'all', 
  sort = 'newest', 
  page = 1, 
  limit = 10 
}) => {
  try {
    // Validate job ID
    if (!isValidObjectId(jobId)) {
      throw new Error('Invalid job ID');
    }
    
    const response = await api.get(`/applications/job/${jobId}`, {
      params: {
        status,
        sort,
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch job applications');
  }
};

/**
 * Update application status (for recruiters)
 * @param {Object} options - Application ID and new status
 * @returns {Promise<Object>} Updated application with success status
 */
export const updateApplicationStatus = async ({ id, status, notes }) => {
  try {
    // Validate application ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid application ID');
    }
    
    // Validate status
    const validStatuses = ['pending', 'reviewing', 'rejected', 'shortlisted', 'accepted'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status value');
    }
    
    const response = await api.patch(`/applications/${id}/status`, { 
      status, 
      ...(notes && { notes }) 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update application status');
  }
};

/**
 * Delete/withdraw an application (only for job seekers, before it's reviewed)
 * @param {string} id - Application ID to delete
 * @returns {Promise<Object>} Success status and message
 */
export const deleteApplication = async (id) => {
  try {
    // Validate application ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid application ID');
    }
    
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to withdraw application');
  }
};

/**
 * Get all applications for the recruiter (across all jobs)
 * @param {Object} options - Filter, sort and pagination options
 * @returns {Promise<Object>} Applications array with pagination and success status
 */
export const getAllRecruiterApplications = async ({ 
  status = 'all', 
  sort = 'newest', 
  page = 1, 
  limit = 10 
}) => {
  try {
    const response = await api.get('/applications/recruiter', {
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
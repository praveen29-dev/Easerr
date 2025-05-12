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
 * Create a new job posting
 * @param {Object} jobData - Job data object
 * @returns {Promise<Object>} Created job object with success status
 */
export const createJob = async (jobData) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create job');
  }
};

/**
 * Get all active jobs with filtering options
 * @param {Object} options - Filter, sort and pagination options
 * @returns {Promise<Object>} Jobs array with pagination and success status
 */
export const getAllJobs = async ({
  search = '',
  location = '',
  jobType = '',
  skills = [],
  minSalary = '',
  maxSalary = '',
  status = 'active',
  sort = 'latest',
  page = 1,
  limit = 10
}) => {
  try {
    const response = await api.get('/jobs', {
      params: {
        search,
        location,
        jobType,
        ...(skills.length > 0 && { skills: skills.join(',') }),
        ...(minSalary && { minSalary }),
        ...(maxSalary && { maxSalary }),
        status,
        sort,
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch jobs');
  }
};

/**
 * Get job details by ID
 * @param {string} id - Job ID
 * @returns {Promise<Object>} Job details with success status
 */
export const getJobById = async (id) => {
  try {
    // Validate job ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid job ID');
    }
    
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch job');
  }
};

/**
 * Update job details
 * @param {Object} options - Options containing job ID and job data
 * @returns {Promise<Object>} Updated job with success status
 */
export const updateJob = async ({ id, jobData }) => {
  try {
    // Validate job ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid job ID');
    }
    
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update job');
  }
};

/**
 * Delete a job by ID
 * @param {string} id - Job ID to delete
 * @returns {Promise<Object>} Success status and message
 */
export const deleteJob = async (id) => {
  try {
    // Validate job ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid job ID');
    }
    
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete job');
  }
};

/**
 * Get all jobs posted by the current recruiter
 * @param {Object} options - Filter, sort and pagination options
 * @returns {Promise<Object>} Jobs array with pagination and success status
 */
export const getRecruiterJobs = async ({
  status = 'all',
  search = '',
  sort = 'latest',
  page = 1,
  limit = 10
}) => {
  try {
    const response = await api.get('/jobs/recruiter/jobs', {
      params: {
        status,
        search,
        sort,
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recruiter jobs');
  }
};

/**
 * Get recruiter's job statistics
 * @returns {Promise<Object>} Job statistics data
 */
export const getJobStats = async () => {
  try {
    const response = await api.get('/jobs/recruiter/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch job statistics');
  }
};

/**
 * Change job status (active/closed/draft)
 * @param {Object} options - Job ID and new status
 * @returns {Promise<Object>} Updated job with success status
 */
export const changeJobStatus = async ({ id, status }) => {
  try {
    // Validate job ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid job ID');
    }
    
    // Validate status
    const validStatuses = ['active', 'closed', 'draft'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status value');
    }
    
    const response = await api.patch(`/jobs/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to change job status');
  }
}; 
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
 * Get recruiter profile data
 * @returns {Promise<Object>} Recruiter profile data
 */
export const getRecruiterProfile = async () => {
  try {
    const response = await api.get('/recruiters/profile');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recruiter profile');
  }
};

/**
 * Get jobs posted by the recruiter
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
 * Get applications for all jobs posted by a recruiter
 * @param {Object} options - Filter, sort and pagination options 
 * @returns {Promise<Object>} Applications array with pagination and success status
 */
export const getRecruiterApplications = async ({
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

/**
 * Get job statistics for recruiter dashboard
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
 * Get applications for a specific job
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
 * Create a new job posting
 * @param {Object} jobData - Job data object
 * @returns {Promise<Object>} Created job with success status
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
 * Update job details
 * @param {Object} options - Job ID and updated job data
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

/**
 * Get recruiter performance statistics
 * @param {string} timeRange - Time range for statistics
 * @returns {Promise<Object>} Performance statistics
 */
export const getRecruiterPerformance = async (timeRange = '6months') => {
  try {
    const response = await api.get('/recruiters/performance', {
      params: { timeRange }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recruiter performance data');
  }
};

/**
 * Get list of recruiters (admin/team lead only)
 * @param {Object} options - Search, sort and pagination options
 * @returns {Promise<Object>} Recruiters array with pagination
 */
export const getRecruiters = async ({ 
  search = '', 
  sort = 'newest', 
  page = 1, 
  limit = 10 
}) => {
  try {
    const response = await api.get('/recruiters', {
      params: {
        search,
        sort,
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recruiters');
  }
};

/**
 * Invite a new recruiter
 * @param {Object} recruiterData - New recruiter data
 * @returns {Promise<Object>} Invitation details with success status
 */
export const inviteRecruiter = async (recruiterData) => {
  try {
    const response = await api.post('/recruiters/invite', recruiterData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send invitation');
  }
};

// Delete/remove a recruiter
export const deleteRecruiter = async (recruiterId) => {
  try {
    const response = await axios.delete(`${API_URL}/recruiters/${recruiterId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove recruiter');
  }
};

// Get recruiter job statistics
export const getRecruiterJobStats = async (recruiterId, timeRange = '6months') => {
  try {
    const response = await axios.get(`${API_URL}/recruiters/${recruiterId}/job-stats`, {
      params: { timeRange },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recruiter job statistics');
  }
};

// Get recruiter application statistics
export const getRecruiterApplicationStats = async (recruiterId, timeRange = '6months') => {
  try {
    const response = await axios.get(`${API_URL}/recruiters/${recruiterId}/application-stats`, {
      params: { timeRange },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recruiter application statistics');
  }
}; 
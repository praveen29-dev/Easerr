import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  if (typeof id !== 'string') return false;
  if (id === 'undefined' || id === 'null') return false;
  
  // MongoDB ObjectId is typically a 24-character hex string
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Create a new job
export const createJob = async (jobData) => {
  try {
    const response = await axios.post(`${API_URL}/jobs`, jobData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create job');
  }
};

// Get all jobs with filtering, sorting, and pagination
export const getAllJobs = async ({
  search = '',
  location = '',
  category = '',
  level = '',
  minSalary = '',
  maxSalary = '',
  status = 'active',
  sort = 'latest',
  page = 1,
  limit = 10
}) => {
  try {
    const response = await axios.get(`${API_URL}/jobs`, {
      params: {
        search,
        location,
        category,
        level,
        minSalary,
        maxSalary,
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

// Get job by ID
export const getJobById = async (id) => {
  try {
    // Validate job ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid job ID');
    }
    
    const response = await axios.get(`${API_URL}/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch job');
  }
};

// Update job
export const updateJob = async ({ id, jobData }) => {
  try {
    // Validate job ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid job ID');
    }
    
    const response = await axios.put(`${API_URL}/jobs/${id}`, jobData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update job');
  }
};

// Delete job
export const deleteJob = async (id) => {
  try {
    // Validate job ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid job ID');
    }
    
    const response = await axios.delete(`${API_URL}/jobs/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete job');
  }
};

// Get recruiter's jobs
export const getRecruiterJobs = async ({
  status = 'all',
  search = '',
  sort = 'latest',
  page = 1,
  limit = 10
}) => {
  try {
    const response = await axios.get(`${API_URL}/jobs/recruiter/jobs`, {
      params: {
        status,
        search,
        sort,
        page,
        limit
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recruiter jobs');
  }
};

// Get job statistics for recruiter dashboard
export const getJobStats = async () => {
  try {
    console.log('Fetching job stats...');
    const response = await axios.get(`${API_URL}/jobs/recruiter/stats`, {
      withCredentials: true
    });
    console.log('Job stats API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching job statistics:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch job statistics');
  }
};

// Change job status (active, closed, draft)
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
    
    const response = await axios.patch(`${API_URL}/jobs/${id}/status`, { status }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to change job status');
  }
}; 
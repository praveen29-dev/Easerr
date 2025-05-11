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

// Submit a job application
export const submitApplication = async (applicationData) => {
  try {
    // Validate job ID before submission
    if (!applicationData || !isValidObjectId(applicationData.jobId)) {
      throw new Error('Invalid job ID');
    }
    
    const response = await axios.post(`${API_URL}/applications`, applicationData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit application');
  }
};

// Get all applications for a specific job (for recruiters)
export const getJobApplications = async ({ jobId, status = 'all', sort = 'newest', page = 1, limit = 10 }) => {
  try {
    // Validate job ID
    if (!isValidObjectId(jobId)) {
      throw new Error('Invalid job ID');
    }
    
    const response = await axios.get(`${API_URL}/applications/job/${jobId}`, {
      params: {
        status,
        sort,
        page,
        limit
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch job applications');
  }
};

// Get all applications by the current user (job seeker)
export const getUserApplications = async ({ status = 'all', sort = 'newest', page = 1, limit = 10 }) => {
  try {
    const response = await axios.get(`${API_URL}/applications/user`, {
      params: {
        status,
        sort,
        page,
        limit
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch your applications');
  }
};

// Get a single application by ID
export const getApplicationById = async (id) => {
  try {
    // Validate application ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid application ID');
    }
    
    const response = await axios.get(`${API_URL}/applications/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch application');
  }
};

// Update application status (for recruiters)
export const updateApplicationStatus = async ({ id, status, notes }) => {
  try {
    // Validate application ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid application ID');
    }
    
    // Validate status
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status value');
    }
    
    const response = await axios.patch(`${API_URL}/applications/${id}/status`, 
      { status, notes }, 
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update application status');
  }
};

// Delete/withdraw an application (only for job seekers, before it's reviewed)
export const deleteApplication = async (id) => {
  try {
    // Validate application ID
    if (!isValidObjectId(id)) {
      throw new Error('Invalid application ID');
    }
    
    const response = await axios.delete(`${API_URL}/applications/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to withdraw application');
  }
};

// Get all applications for the recruiter (across all jobs)
export const getAllRecruiterApplications = async ({ status = 'all', sort = 'newest', page = 1, limit = 10 }) => {
  try {
    const response = await axios.get(`${API_URL}/applications/recruiter`, {
      params: {
        status,
        sort,
        page,
        limit
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch applications');
  }
}; 
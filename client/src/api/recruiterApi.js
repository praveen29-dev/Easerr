import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Get recruiter performance statistics
export const getRecruiterPerformance = async (timeRange = '6months') => {
  try {
    const response = await axios.get(`${API_URL}/recruiters/performance`, {
      params: { timeRange },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recruiter performance data');
  }
};

// Get list of recruiters (for team leads)
export const getRecruiters = async ({ search = '', sort = 'newest', page = 1, limit = 10 }) => {
  try {
    const response = await axios.get(`${API_URL}/recruiters`, {
      params: {
        search,
        sort,
        page,
        limit
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recruiters');
  }
};

// Invite a new recruiter
export const inviteRecruiter = async (recruiterData) => {
  try {
    const response = await axios.post(`${API_URL}/recruiters/invite`, recruiterData, {
      withCredentials: true
    });
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
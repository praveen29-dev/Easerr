import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all users (excluding admins)
export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/admin/users`, {
        withCredentials: true
      });
      return response.data.data;
    }
  });
};

// Get all recruiters
export const useGetAllRecruiters = () => {
  return useQuery({
    queryKey: ['admin', 'recruiters'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/admin/recruiters`, {
        withCredentials: true
      });
      return response.data.data;
    }
  });
};

// Delete a user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId) => {
      const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
        withCredentials: true
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'recruiters'] });
    }
  });
}; 
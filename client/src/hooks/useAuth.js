import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  login as loginApi, 
  register as registerApi,
  logout as logoutApi,
  getCurrentUser,
  updateProfile as updateProfileApi,
  requestPasswordReset,
  resetPassword
} from '../api/authApi';

// Hook for current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    onError: (error) => {
      if (error.status === 401) {
        // If unauthorized, remove token
        localStorage.removeItem('auth_token');
      }
    }
  });
};

// Hook for login
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }) => loginApi(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      queryClient.invalidateQueries(['currentUser']);
    }
  });
};

// Hook for registration
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => registerApi(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      queryClient.invalidateQueries(['currentUser']);
    }
  });
};

// Hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.invalidateQueries(['currentUser']);
    }
  });
};

// Hook for updating user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => updateProfileApi(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
      queryClient.invalidateQueries(['currentUser']);
    }
  });
};

// Hook for password reset request
export const usePasswordResetRequest = () => {
  return useMutation({
    mutationFn: (email) => requestPasswordReset(email)
  });
};

// Hook for password reset
export const usePasswordReset = () => {
  return useMutation({
    mutationFn: ({ token, password }) => resetPassword(token, password)
  });
}; 
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../api/authApi';

// Hook for updating user profile
export const useProfileUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => updateProfile(userData),
    onSuccess: (data) => {
      console.log('Profile update success data:', data);
      queryClient.setQueryData(['currentUser'], data);
      queryClient.invalidateQueries(['currentUser']);
    },
    onError: (error) => {
      console.error('Profile update error:', error);
    }
  });
};

export default useProfileUpdate; 
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../api/authApi';

// Hook for updating user profile
export const useProfileUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => updateProfile(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
      queryClient.invalidateQueries(['currentUser']);
    }
  });
};

export default useProfileUpdate; 
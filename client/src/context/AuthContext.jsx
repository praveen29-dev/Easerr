import { createContext, useContext, useState, useEffect } from 'react';
import { useCurrentUser, useLogin, useRegister, useLogout, useUpdateProfile } from '../hooks/useAuth';
import { requestPasswordReset } from '../api/authApi';

// Create the auth context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { data: user, isLoading: isUserLoading, error: userError } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();
  
  // Add state for controlling login modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  
  // Function to open login modal
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSignupModalOpen(false);
  };
  
  // Function to open signup modal
  const openSignupModal = () => {
    setIsSignupModalOpen(true);
    setIsLoginModalOpen(false);
  };
  
  // Function to close all auth modals
  const closeAuthModals = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
  };

  // Login function
  const login = async (email, password) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      closeAuthModals(); // Close modals on successful login
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      await registerMutation.mutateAsync(userData);
      closeAuthModals(); // Close modals on successful signup
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await requestPasswordReset(email);
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  // Update profile
  const updateProfile = async (userData) => {
    try {
      await updateProfileMutation.mutateAsync(userData);
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  // Provide the auth context value to children
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading: isUserLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending || updateProfileMutation.isPending,
        login,
        signup,
        updateProfile,
        logout,
        resetPassword,
        isAuthenticated: !!user,
        // Add login modal controls to context
        isLoginModalOpen,
        isSignupModalOpen,
        openLoginModal,
        openSignupModal,
        closeAuthModals
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 
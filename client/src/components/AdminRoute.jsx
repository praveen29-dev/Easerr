import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from './ui/Spinner';
import { checkAdminAuth } from '../utils/authUtils';

const AdminRoute = ({ children }) => {
  const { data: isAdmin, isLoading, isError } = useQuery({
    queryKey: ['adminAuth'],
    queryFn: checkAdminAuth,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminRoute; 
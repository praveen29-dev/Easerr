import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { submitApplication, getUserApplications } from '../api/applicationApi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { assets } from '../assets/assets';

/**
 * Modal component for confirming and submitting job applications
 */
const ApplicationModal = ({ isOpen, onClose, jobId, jobTitle }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const { user, isAuthenticated, openLoginModal } = useAuth();
  
  // If not authenticated and modal is open, open login modal
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      // Close this modal first
      onClose();
      // Open login modal instead of redirecting
      openLoginModal();
      toast.error('Please log in to apply for jobs');
    }
  }, [isOpen, isAuthenticated, navigate, onClose, openLoginModal]);

  // Fetch user's applications to check if already applied to this job
  const { data: applicationsData } = useQuery({
    queryKey: ['userApplications', { limit: 100 }],
    queryFn: () => getUserApplications({ limit: 100 }),
    enabled: isOpen && !!jobId && isAuthenticated,
  });

  // Check if user has already applied for this job
  useEffect(() => {
    if (applicationsData?.applications && jobId) {
      const alreadyApplied = applicationsData.applications.some(
        app => app.job?._id === jobId
      );
      setHasApplied(alreadyApplied);
    }
  }, [applicationsData, jobId, isOpen]);

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setCoverLetter('');
      setResumeFile(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Handle clicking outside modal to close
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
    }
  };

  // Application submission mutation
  const applicationMutation = useMutation({
    mutationFn: ({ applicationData, resumeFile }) => {
      console.log('Submitting application with:', applicationData, resumeFile);
      return submitApplication(applicationData, resumeFile);
    },
    onSuccess: (response) => {
      console.log('Application submitted successfully:', response);
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['userApplications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Application submitted successfully!');
      setIsSubmitting(false);
      onClose();
      // Navigate to applications page
      navigate('/applications');
    },
    onError: (error) => {
      console.error('Application submission error:', error);
      if (error.message === 'You have already applied for this job') {
        toast.error('You have already applied for this job');
        setHasApplied(true);
      } else {
        toast.error(error.message || 'Failed to submit application');
      }
      setIsSubmitting(false);
    }
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If user has already applied, show message and don't submit
    if (hasApplied) {
      toast.error('You have already applied for this job');
      return;
    }
    
    setIsSubmitting(true);

    // Validate inputs
    if (!jobId) {
      toast.error('Invalid job ID');
      setIsSubmitting(false);
      return;
    }

    // Prepare application data
    const applicationData = {
      jobId: jobId,
      coverLetter: coverLetter || ''
    };

    // Submit the application with resume from form or user profile
    applicationMutation.mutate({ 
      applicationData, 
      resumeFile: resumeFile || null  // Let the backend use profile resume if no file is uploaded
    });
  };

  // If not authenticated or modal not open, don't render
  if (!isOpen || !isAuthenticated) return null;

  // Get user profile image
  const getUserImage = () => {
    if (user?.profileImage) return user.profileImage;
    if (user?.image) return user.image;
    if (user?.photoURL) return user.photoURL;
    return assets.person_icon;
  };

  // Get user's resume info
  const getUserResumeInfo = () => {
    if (user?.resume) {
      // Extract filename from path - simplify to just show "resume.pdf" regardless of actual name
      const resumePath = user.resume;
      // Get file extension
      const fileExtension = resumePath.toLowerCase().endsWith('.pdf') ? 'pdf' : 
                            resumePath.toLowerCase().endsWith('.doc') ? 'doc' : 
                            resumePath.toLowerCase().endsWith('.docx') ? 'docx' : 'pdf';
      
      return {
        exists: true,
        url: resumePath,
        fileName: `resume.${fileExtension}`
      };
    }
    return { exists: false };
  };

  const userResumeInfo = getUserResumeInfo();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOutsideClick}
    >
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Apply for Job</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* User info section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gray-300">
              <img 
                src={getUserImage()} 
                alt={user?.name || 'User'} 
                className="w-full h-full object-cover"
                onError={(e) => {e.target.src = assets.person_icon}}
              />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-800">{user?.name || 'User'}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700">You are applying for:</p>
          <p className="font-medium text-gray-900">{jobTitle}</p>
        </div>

        {/* Already applied message */}
        {hasApplied ? (
          <div className="p-4 mb-4 text-amber-800 bg-amber-100 border border-amber-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">You have already applied for this job.</span>
            </div>
            <p className="mt-2 text-sm">You can view your application status in the Applications section.</p>
            <div className="flex justify-end mt-3">
              <button
                onClick={() => navigate('/applications')}
                className="px-4 py-2 text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                View My Applications
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="resume" className="block mb-2 text-sm font-medium text-gray-700">
                Resume/CV (PDF, DOC, DOCX)
              </label>
              
              {userResumeInfo.exists && (
                <div className="mb-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <div className="flex items-center">
                    <a 
                      href={userResumeInfo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-700 hover:text-blue-900 transition-colors group"
                    >
                      {/* PDF document icon */}
                      <div className="flex-shrink-0 w-9 h-12 mr-3 relative bg-red-600 rounded-sm overflow-hidden shadow-md border border-gray-200 group-hover:shadow-lg transition-shadow">
                        {/* Dog-ear corner */}
                        <div className="absolute right-0 top-0 w-0 h-0 border-t-8 border-r-8 border-t-white border-r-white"></div>
                        
                        {/* PDF lines */}
                        <div className="absolute top-5 left-0 right-0 flex flex-col items-center">
                          <div className="w-5 h-0.5 bg-white mb-1 rounded-full opacity-80"></div>
                          <div className="w-5 h-0.5 bg-white mb-1 rounded-full opacity-80"></div>
                          <div className="w-4 h-0.5 bg-white rounded-full opacity-80"></div>
                        </div>
                        
                        {/* File type label */}
                        <div className="absolute bottom-0 left-0 right-0 text-[8px] font-bold text-white text-center pb-1 bg-red-700 bg-opacity-50">
                          {userResumeInfo.fileName.split('.').pop().toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-medium text-sm flex items-center">
                          Resume 
                          <svg className="w-3.5 h-3.5 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </span>
                        <span className="text-xs text-gray-600">Click to preview</span>
                      </div>
                    </a>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 pl-12">
                    We'll use this resume from your profile unless you upload a new one below.
                  </div>
                </div>
              )}
              
              <input
                type="file"
                id="resume"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
              {resumeFile && (
                <p className="mt-1 text-sm text-gray-500">
                  Selected file: {resumeFile.name}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="coverLetter" className="block mb-2 text-sm font-medium text-gray-700">
                Cover Letter
              </label>
              <textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell the employer why you're a good fit for this position..."
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplicationModal; 
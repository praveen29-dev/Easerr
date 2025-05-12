import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { submitApplication, getUserApplications } from '../api/applicationApi';
import { toast } from 'react-hot-toast';

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

  // Fetch user's applications to check if already applied to this job
  const { data: applicationsData } = useQuery({
    queryKey: ['userApplications', { limit: 100 }],
    queryFn: () => getUserApplications({ limit: 100 }),
    enabled: isOpen && !!jobId,
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

    // Submit the application
    applicationMutation.mutate({ 
      applicationData, 
      resumeFile 
    });
  };

  if (!isOpen) return null;

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
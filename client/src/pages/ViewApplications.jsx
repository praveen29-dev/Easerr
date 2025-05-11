import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobById } from '../api/jobApi';
import { getJobApplications, updateApplicationStatus } from '../api/applicationApi';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  hired: 'bg-purple-100 text-purple-800'
};

const ViewApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    status: 'all',
    sort: 'newest',
    page: 1,
    limit: 10
  });

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [notes, setNotes] = useState('');

  // Validate jobId to ensure it's not undefined
  const validJobId = jobId && jobId !== 'undefined' && jobId !== 'null' ? jobId : null;

  // Redirect if no valid jobId
  if (!validJobId) {
    // Use useEffect to handle navigation to avoid React state updates during render
    React.useEffect(() => {
      toast.error('Invalid job ID');
      navigate('/dashboard/manage-jobs');
    }, []);
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Fetch job details
  const { 
    data: jobData, 
    isLoading: isJobLoading,
    isError: isJobError,
    error: jobError
  } = useQuery({
    queryKey: ['job', validJobId],
    queryFn: () => getJobById(validJobId),
    enabled: !!validJobId, // Only run query if we have a valid jobId
    retry: 1, // Don't retry too many times if the job doesn't exist
    onError: (error) => {
      toast.error(error.message || 'Failed to load job details');
      navigate('/dashboard/manage-jobs');
    }
  });

  // Fetch applications for this job
  const { 
    data: applicationsData, 
    isLoading: isApplicationsLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['jobApplications', validJobId, filters],
    queryFn: () => getJobApplications({ jobId: validJobId, ...filters }),
    enabled: !!validJobId && !isJobError, // Only run if jobId is valid and job query was successful
    retry: 1,
    onError: (error) => {
      toast.error(error.message || 'Failed to load applications');
    }
  });

  // Mutation for updating application status
  const statusMutation = useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications', validJobId] });
      toast.success('Application status updated');
      setSelectedApplication(null);
      setNotes('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update application status');
    }
  });

  const handleStatusChange = (id, status) => {
    if (!id) {
      toast.error('Invalid application ID');
      return;
    }
    
    statusMutation.mutate({ 
      id, 
      status,
      notes: notes.trim() !== '' ? notes : undefined
    });
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({
      ...prev,
      status,
      page: 1
    }));
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({
      ...prev,
      sort: e.target.value
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleViewApplication = (application) => {
    if (!application || !application._id) {
      toast.error('Invalid application data');
      return;
    }
    setSelectedApplication(application);
    setNotes(application.notes || '');
  };

  const handleCloseModal = () => {
    setSelectedApplication(null);
    setNotes('');
  };

  if (isJobLoading || isApplicationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isJobError) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        Error: {jobError?.message || 'Failed to load job details'}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        Error: {error?.message || 'Failed to load applications'}
      </div>
    );
  }

  // Check if we have valid data before proceeding
  if (!jobData?.job || !applicationsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
          No data available. Please try again later.
        </div>
      </div>
    );
  }

  const { applications = [], totalApplications = 0, numOfPages = 1, currentPage = 1, statusCounts = {} } = applicationsData;
  const { job } = jobData;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/dashboard/manage-jobs')} 
          className="mr-3 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Applications for {job.title}</h1>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
            <p className="text-gray-600">{job.location} • {job.level}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[job.status] || 'bg-gray-100 text-gray-800'}`}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-wrap justify-between items-center">
            <h3 className="text-lg font-medium mb-2 md:mb-0">
              {totalApplications} Application{totalApplications !== 1 && 's'}
            </h3>
            <div className="flex gap-4">
              <select
                value={filters.sort}
                onChange={handleSortChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="status-desc">Status (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex border-b overflow-x-auto">
          <button
            className={`px-4 py-3 font-medium ${filters.status === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleStatusFilter('all')}
          >
            All ({statusCounts?.total || 0})
          </button>
          <button
            className={`px-4 py-3 font-medium ${filters.status === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleStatusFilter('pending')}
          >
            Pending ({statusCounts?.pending || 0})
          </button>
          <button
            className={`px-4 py-3 font-medium ${filters.status === 'reviewed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleStatusFilter('reviewed')}
          >
            Reviewed ({statusCounts?.reviewed || 0})
          </button>
          <button
            className={`px-4 py-3 font-medium ${filters.status === 'shortlisted' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleStatusFilter('shortlisted')}
          >
            Shortlisted ({statusCounts?.shortlisted || 0})
          </button>
          <button
            className={`px-4 py-3 font-medium ${filters.status === 'rejected' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleStatusFilter('rejected')}
          >
            Rejected ({statusCounts?.rejected || 0})
          </button>
          <button
            className={`px-4 py-3 font-medium ${filters.status === 'hired' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleStatusFilter('hired')}
          >
            Hired ({statusCounts?.hired || 0})
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No applications found for this job.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {application.applicant?.image ? (
                          <img 
                            src={application.applicant.image} 
                            alt={application.applicant.name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-gray-500">
                            {application.applicant?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{application.applicant?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{application.applicant?.email || 'No email provided'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.createdAt ? formatDistanceToNow(new Date(application.createdAt), { addSuffix: true }) : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[application.status] || 'bg-gray-100 text-gray-800'}`}>
                        {application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewApplication(application)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {numOfPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md mr-2 ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            {[...Array(numOfPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 rounded-md mx-1 ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === numOfPages}
              className={`px-3 py-1 rounded-md ml-2 ${
                currentPage === numOfPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Application Details
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex items-center mb-2">
                        {selectedApplication.applicant?.image ? (
                          <img 
                            src={selectedApplication.applicant.image} 
                            alt={selectedApplication.applicant.name}
                            className="w-12 h-12 rounded-full mr-4"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 flex items-center justify-center text-gray-500">
                            {selectedApplication.applicant?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <h4 className="text-md font-medium text-gray-900">{selectedApplication.applicant?.name || 'Unknown'}</h4>
                          <p className="text-sm text-gray-500">{selectedApplication.applicant?.email || 'No email provided'}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Application Status</h5>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedApplication.status]}`}>
                            {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                          </span>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Applied On</h5>
                          <p className="text-sm text-gray-600">
                            {selectedApplication.createdAt ? new Date(selectedApplication.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h5 className="font-medium text-gray-700 mb-2">Resume</h5>
                      <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                        {selectedApplication.resume ? (
                          <a 
                            href={selectedApplication.resume} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                            </svg>
                            View Resume
                          </a>
                        ) : (
                          <p className="text-gray-500">No resume available</p>
                        )}
                      </div>
                    </div>

                    {selectedApplication.coverLetter && (
                      <div className="mb-6">
                        <h5 className="font-medium text-gray-700 mb-2">Cover Letter</h5>
                        <div className="p-4 border border-gray-200 rounded-md bg-gray-50 max-h-40 overflow-y-auto">
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {selectedApplication.coverLetter}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Recruiter Notes</h5>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                        placeholder="Add private notes about this candidate..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <div className="sm:flex sm:gap-2">
                  <div className="mb-2 sm:mb-0">
                    <select
                      value={selectedApplication.status}
                      onChange={(e) => handleStatusChange(selectedApplication._id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewApplications;
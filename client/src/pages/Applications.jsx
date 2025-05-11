import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { assets } from '../assets/assets';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserApplications, deleteApplication } from '../api/applicationApi';
import { toast } from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  hired: 'bg-purple-100 text-purple-800'
};

const Applications = () => {
  const queryClient = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    sort: 'newest',
    page: 1,
    limit: 10
  });

  // Fetch user applications
  const { 
    data, 
    isLoading, 
    isError,
    error
  } = useQuery({
    queryKey: ['userApplications', filters],
    queryFn: () => getUserApplications(filters),
    retry: 1,
    onError: (error) => {
      toast.error(error.message || 'Failed to load applications');
    }
  });

  // Mutation for withdrawing application
  const withdrawMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userApplications'] });
      toast.success('Application withdrawn successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to withdraw application');
    }
  });

  const handleWithdraw = (id) => {
    if (!id) {
      toast.error('Invalid application ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      withdrawMutation.mutate(id);
    }
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

  const handleResumeSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would upload the resume to a server here
    toast.success('Resume updated successfully');
    setIsEdit(false);
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container px-4 mx-auto my-10 2xl:px-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Navbar />
        <div className="container px-4 mx-auto my-10 2xl:px-20">
          <div className="p-4 bg-red-100 rounded-md text-red-700">
            Error: {error?.message || 'Failed to load applications'}
          </div>
        </div>
      </>
    );
  }

  const { applications = [], totalApplications = 0, numOfPages = 0, currentPage = 1, statusCounts = { 
    total: 0, pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, hired: 0 
  } } = data || {};

  return (
    <>
      <Navbar />
      <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>
        <h2 className='text-xl font-semibold'>Your Resume</h2>
        <div className='flex gap-2 mt-3 mb-6'>
          {
            isEdit
            ? (
              <form onSubmit={handleResumeSubmit} className="flex gap-2">
                <label className='flex items-center' htmlFor='resumeUpload'>
                  <p className='px-4 py-2 mr-2 text-blue-500 bg-blue-100 rounded-lg'>Select Resume</p>
                  <input 
                    id='resumeUpload' 
                    onChange={e => setResume(e.target.files[0])} 
                    accept='application/pdf' 
                    type='file' 
                    hidden
                    required
                  />
                  {resume && <span className="mr-2">{resume.name}</span>}
                  <img src={assets.profile_upload_icon} alt="" />
                </label>  
                <button 
                  type="submit" 
                  className='px-4 py-2 bg-green-100 border border-green-400 rounded-lg'
                >
                  Save
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEdit(false)} 
                  className='px-4 py-2 bg-gray-100 border border-gray-400 rounded-lg'
                >
                  Cancel
                </button>
              </form>
            )
            : (
              <div className='flex gap-2'>
                <a className='px-4 py-2 text-blue-600 bg-blue-100 rounded-lg' href='#'>Resume</a>
                <button className='px-4 text-gray-500 border border-gray-300 rounded-lg' onClick={() => setIsEdit(true)}>Edit</button>
              </div>
            )
          }
        </div>

        <div className="mb-6">
          <h2 className='mb-4 text-xl font-semibold'>Jobs Applied ({totalApplications})</h2>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
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
            
            <div className="flex overflow-x-auto">
              <button
                className={`px-3 py-2 mr-2 rounded-md ${filters.status === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => handleStatusFilter('all')}
              >
                All ({statusCounts?.total || 0})
              </button>
              <button
                className={`px-3 py-2 mr-2 rounded-md ${filters.status === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => handleStatusFilter('pending')}
              >
                Pending ({statusCounts?.pending || 0})
              </button>
              <button
                className={`px-3 py-2 mr-2 rounded-md ${filters.status === 'reviewed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => handleStatusFilter('reviewed')}
              >
                Reviewed ({statusCounts?.reviewed || 0})
              </button>
              <button
                className={`px-3 py-2 mr-2 rounded-md ${filters.status === 'shortlisted' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => handleStatusFilter('shortlisted')}
              >
                Shortlisted ({statusCounts?.shortlisted || 0})
              </button>
              <button
                className={`px-3 py-2 mr-2 rounded-md ${filters.status === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => handleStatusFilter('rejected')}
              >
                Rejected ({statusCounts?.rejected || 0})
              </button>
              <button
                className={`px-3 py-2 mr-2 rounded-md ${filters.status === 'hired' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => handleStatusFilter('hired')}
              >
                Hired ({statusCounts?.hired || 0})
              </button>
            </div>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="p-8 text-center bg-white border rounded-lg">
            <p className="text-gray-500">No applications found with the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead>
                <tr>
                  <th className='px-4 py-3 text-left border-b'>Company</th>
                  <th className='px-4 py-3 text-left border-b'>Job Title</th>
                  <th className='px-4 py-3 text-left border-b max-sm:hidden'>Location</th>
                  <th className='px-4 py-3 text-left border-b max-sm:hidden'>Applied</th>
                  <th className='px-4 py-3 text-left border-b'>Status</th>
                  <th className='px-4 py-3 text-left border-b'>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => {
                  // Check if job data exists
                  const hasJobData = application.job && typeof application.job === 'object';
                  const companyName = hasJobData && application.job.company ? 
                    application.job.company.name || 'Unknown Company' : 'Unknown Company';
                  const companyLogo = hasJobData && application.job.company && application.job.company.logo ?
                    application.job.company.logo : null;
                  const jobTitle = hasJobData ? application.job.title || 'Untitled Position' : 'Untitled Position';
                  const jobLocation = hasJobData ? application.job.location || 'Remote' : 'Remote';
                  const jobId = hasJobData && application.job._id ? application.job._id : '#';

                  return (
                    <tr key={application._id || Math.random()} className="hover:bg-gray-50">
                      <td className="flex items-center gap-2 px-4 py-3 border-b">
                        {companyLogo ? (
                          <img className="w-8 h-8 rounded-full" src={companyLogo} alt={companyName} />
                        ) : (
                          <div className="flex items-center justify-center w-8 h-8 text-gray-500 bg-gray-200 rounded-full">
                            {companyName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {companyName}
                      </td>
                      <td className='px-4 py-2 border-b'>
                        {jobId !== '#' ? (
                          <a href={`/jobs/${jobId}`} className="text-blue-600 hover:underline">
                            {jobTitle}
                          </a>
                        ) : (
                          <span>{jobTitle}</span>
                        )}
                      </td>
                      <td className='px-4 py-3 text-left border-b max-sm:hidden'>{jobLocation}</td>
                      <td className='px-4 py-3 text-left border-b max-sm:hidden'>
                        {application.createdAt ? 
                          formatDistanceToNow(new Date(application.createdAt), { addSuffix: true }) : 
                          'Unknown'
                        }
                      </td>
                      <td className='px-4 py-3 text-left border-b'>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[application.status] || 'bg-gray-100 text-gray-800'}`}>
                          {application.status ? 
                            application.status.charAt(0).toUpperCase() + application.status.slice(1) : 
                            'Unknown'
                          }
                        </span>
                      </td>
                      <td className='px-4 py-3 text-left border-b'>
                        {application.status === 'pending' && (
                          <button
                            onClick={() => handleWithdraw(application._id)}
                            className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                            disabled={withdrawMutation.isPending}
                          >
                            {withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw'}
                          </button>
                        )}
                        {application._id && (
                          <a
                            href={`/applications/${application._id}`}
                            className="px-3 py-1 ml-2 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                          >
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

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
      </div>
    </>
  );
}

export default Applications;

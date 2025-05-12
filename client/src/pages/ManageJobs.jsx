import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecruiterJobs, deleteJob, changeJobStatus } from '../api/jobApi';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const statusColors = {
  active: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800'
};

const ManageJobs = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sort: 'latest',
    page: 1
  });

  // Query for recruiter jobs
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['recruiterJobs', filters],
    queryFn: () => getRecruiterJobs(filters)
  });

  // Delete job mutation
  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete job');
    }
  });

  // Update job status mutation
  const statusMutation = useMutation({
    mutationFn: changeJobStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      toast.success('Job status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update job status');
    }
  });

  const handleStatusChange = (id, status) => {
    statusMutation.mutate({ id, status });
  };

  const handleDeleteJob = (id) => {
    if (window.confirm('Are you sure you want to delete this job? This will also delete all associated applications.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value,
      page: 1 // Reset to first page on new search
    }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({
      ...prev,
      status,
      page: 1 // Reset to first page on filter change
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        Error: {error.message || 'Failed to load jobs'}
      </div>
    );
  }

  const { jobs, totalJobs, numOfPages, currentPage } = data;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Manage Job Listings</h1>
        <Link
          to="/dashboard/add-job"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Post New Job
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="mb-0 md:mb-0 flex-1">
              <input
                type="text"
                placeholder="Search by job title"
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={filters.sort}
                onChange={handleSortChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="latest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
                <option value="applications-highest">Most Applications</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex border-b overflow-x-auto">
          <button
            className={`px-4 py-3 font-medium ${filters.status === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleStatusFilter('all')}
          >
            All ({data.jobStats?.total || 0})
          </button>
          <button
            className={`px-4 py-3 font-medium ${filters.status === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleStatusFilter('active')}
          >
            Active ({data.jobStats?.active || 0})
          </button>
          <button
            className={`px-4 py-3 font-medium ${filters.status === 'closed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleStatusFilter('closed')}
          >
            Closed ({data.jobStats?.closed || 0})
          </button>
          <button
            className={`px-4 py-3 font-medium ${filters.status === 'draft' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleStatusFilter('draft')}
          >
            Draft ({data.jobStats?.draft || 0})
          </button>
        </div>

        {jobs?.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No jobs found. Create your first job listing!</p>
            <Link
              to="/dashboard/add-job"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">{job.location} • {job.level}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/dashboard/applications/${job._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {job.applicationCount || 0} applications
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[job.status]}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            const statusOptions = {
                              active: 'closed',
                              closed: 'active',
                              draft: 'active'
                            };
                            handleStatusChange(job._id, statusOptions[job.status]);
                          }}
                        >
                          {job.status === 'active' ? 'Close' : 'Activate'}
                        </button>
                        <Link 
                          to={`/dashboard/edit-job/${job._id}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </Link>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteJob(job._id)}
                        >
                          Delete
                        </button>
                      </div>
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
    </div>
  );
};

export default ManageJobs;

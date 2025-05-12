import React, {useContext} from 'react'
import { AppContext } from '../context/AppContext'
import JobCard from './JobCard'

const JobListing = () => {
    const {
        jobs, 
        isLoading, 
        error,
        totalJobs,
        jobsParams,
        setJobsParams
    } = useContext(AppContext)

    const handlePageChange = (newPage) => {
        setJobsParams(prev => ({
            ...prev,
            page: newPage
        }));
        window.scrollTo({top: document.getElementById('job-list')?.offsetTop || 0, behavior: 'smooth'});
    };

    // Calculate total pages
    const totalPages = Math.ceil(totalJobs / jobsParams.limit) || 1;

    // Safely render job data
    const renderJobs = () => {
        if (!Array.isArray(jobs)) return null;
        
        return jobs.map((job, index) => (
            <JobCard key={job._id || `job-${index}`} job={job} />
        ));
    };

    return (
        <div className='container mx-auto py-8 2xl:px-20'>
            {/* Job Listing Section */}
            <div>
                <h3 className='py-2 text-3xl font-medium' id='job-list'>Latest Jobs</h3>
                <p className='mb-8'>Get your desired job from top companies</p>
                
                {isLoading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-red-500 bg-red-50 rounded">
                        Error loading jobs: {error.message || 'Failed to load jobs'}
                    </div>
                ) : !jobs || jobs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded">
                        No jobs found matching your criteria
                    </div>
                ) : (
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                        {renderJobs()}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <nav className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(jobsParams.page - 1)}
                                disabled={jobsParams.page === 1}
                                className="px-3 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-3 py-2 rounded-md ${
                                        jobsParams.page === index + 1
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => handlePageChange(jobsParams.page + 1)}
                                disabled={jobsParams.page === totalPages}
                                className="px-3 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    )
}

export default JobListing
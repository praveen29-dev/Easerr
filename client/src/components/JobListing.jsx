import React, {useContext, useEffect, useState} from 'react'
import { AppContext } from '../context/AppContext'
import { assets, JobCategories, JobLocations } from '../assets/assets'
import JobCard from './JobCard'

const JobListing = () => {

    const {
        isSearched, 
        searchFilter, 
        setSearchFilter, 
        jobs, 
        isLoading, 
        error,
        totalJobs,
        jobsParams,
        setJobsParams
    } = useContext(AppContext)

    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedLocations, setSelectedLocations] = useState([])

    // Helper function to safely extract location value
    const getLocationValue = (location) => {
        if (typeof location === 'object' && location !== null) {
            return location.name || '';
        }
        return location || '';
    };

    const handleCategoryChange = (category) => {
        setSelectedCategories(
            prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
        // Update job params when categories change
        setJobsParams(prev => ({
            ...prev,
            jobType: selectedCategories.includes(category) 
                ? prev.jobType.replace(category, '').trim() 
                : `${prev.jobType} ${category}`.trim(),
            page: 1 // Reset to first page
        }));
    };
    
    const handleLocationChange = (location) => {
        setSelectedLocations(
            prev => prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
        );
        // Update job params when locations change
        const locationValue = getLocationValue(location);
        setJobsParams(prev => ({
            ...prev,
            location: selectedLocations.includes(location) 
                ? prev.location.replace(locationValue, '').trim() 
                : `${prev.location} ${locationValue}`.trim(),
            page: 1 // Reset to first page
        }));
    };

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
        <div className='container flex flex-col py-8 mx-auto 2xl:px-20 lg:flex-row max-lg:space-y-8'>

            {/* Side Bar */}
            <div className='w-full px-4 bg-white lg:w-1/4'>
                {/* Search Filter From Hero */}
                {
                    isSearched && (searchFilter.title !== "" || searchFilter.location !=="") && (
                        <>
                            <h3 className='mb-4 text-lg font-medium'>Current Search</h3>
                            <div className='mb-4 text-gray-600'>
                                {searchFilter.title && (
                                    <span className='inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded'>
                                        {searchFilter.title}
                                        <img onClick={ e => setSearchFilter(prev => ({...prev,title:""}))} className='cursor-pointer' src={assets.cross_icon} alt='' />
                                    </span>
                                )}
                                {searchFilter.location && (
                                    <span className='ml-2 inline-flex items-center gap-2.5 bg-red-50 border border-blue-200 px-4 py-1.5 rounded'>
                                        {searchFilter.location}
                                        <img onClick={ e => setSearchFilter(prev => ({...prev,location:""}))} className='cursor-pointer' src={assets.cross_icon} alt='' />
                                    </span>
                                )}
                            </div>
                        </>
                    )
                }

                {/* category filter */}
                <div className='max-lg:hidden'>
                    <h4 className='py-4 text-lg font-medium'>
                        Search by Category
                    </h4>
                    <ul className='space-y-4 text-gray-600'>
                        {
                            JobCategories.map((category,index)=>(
                                <li className='flex items-center gap-3' key={index}>
                                    <input 
                                    className='scale-125' 
                                    type='checkbox' 
                                    name='' 
                                    onChange={()=> handleCategoryChange(category)}
                                    checked = {selectedCategories.includes(category)} 
                                    />
                                    {category}
                                </li>
                            ))
                        }
                    </ul>
                </div>

                {/* Location filter */}
                <div className='pt-6 max-lg:hidden'>
                    <h4 className='py-4 text-lg font-medium'>
                        Search by Locations
                    </h4>
                    <ul className='space-y-4 text-gray-600'>
                        {
                            JobLocations.map((location, index)=>(
                                <li className='flex items-center gap-3' key={index}>
                                    <input 
                                    className='scale-125' 
                                    type='checkbox' 
                                    name='' 
                                    onChange={()=> handleLocationChange(location)}
                                    checked = {selectedLocations.includes(location)} 
                                    />
                                    {typeof location === 'object' ? (location.name || 'Unknown') : location}
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>

            {/* Job Listing */}
            <section className='w-full text-gray-800 lg:w-3/4 max-lg:px-4'>
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
                {totalPages > 0 && (
                    <div className='flex items-center justify-center mt-10 space-x-2'>
                        <button 
                            onClick={() => handlePageChange(Math.max(jobsParams.page - 1, 1))}
                            disabled={jobsParams.page === 1}
                            className={`p-2 ${jobsParams.page === 1 ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}>
                            <img src={assets.left_arrow_icon} alt='Previous page' />
                        </button>
                        
                        {Array.from({length: totalPages}).map((_, index) => {
                            const pageNumber = index + 1;
                            // Show limited page numbers to avoid overcrowding
                            if (
                                pageNumber === 1 || 
                                pageNumber === totalPages || 
                                (pageNumber >= jobsParams.page - 1 && pageNumber <= jobsParams.page + 1)
                            ) {
                                return (
                                    <button 
                                        key={pageNumber} 
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`w-10 h-10 border rounded flex items-center justify-center
                                            ${pageNumber === jobsParams.page 
                                                ? 'bg-blue-600 text-white border-blue-600' 
                                                : 'border-gray-300 text-gray-600'}`}>
                                        {pageNumber}
                                    </button>
                                );
                            }
                            // Add ellipsis for skipped pages
                            if (pageNumber === jobsParams.page - 2 || pageNumber === jobsParams.page + 2) {
                                return <span key={pageNumber} className="px-1">...</span>;
                            }
                            return null;
                        })}
                        
                        <button 
                            onClick={() => handlePageChange(Math.min(jobsParams.page + 1, totalPages))}
                            disabled={jobsParams.page === totalPages}
                            className={`p-2 ${jobsParams.page === totalPages ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}>
                            <img src={assets.right_arrow_icon} alt='Next page' />
                        </button>
                    </div>
                )}
            </section>
        </div>
    )
}

export default JobListing
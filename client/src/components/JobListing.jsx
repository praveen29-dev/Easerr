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
        setJobsParams,
        clearFilters
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
        // Update selected categories UI state
        const newSelectedCategories = selectedCategories.includes(category)
            ? selectedCategories.filter(c => c !== category)
            : [...selectedCategories, category];
        
        setSelectedCategories(newSelectedCategories);
        
        // Update job params with the new job types (categories)
        setJobsParams(prev => ({
            ...prev,
            jobType: newSelectedCategories.join(','),
            page: 1 // Reset to first page
        }));
    };
    
    const handleLocationChange = (location) => {
        // Update selected locations UI state
        const newSelectedLocations = selectedLocations.includes(location)
            ? selectedLocations.filter(l => l !== location)
            : [...selectedLocations, location];
            
        setSelectedLocations(newSelectedLocations);
        
        // Get location values for API
        const locationValues = newSelectedLocations.map(loc => getLocationValue(loc));
        
        // Update job params with locations
        setJobsParams(prev => ({
            ...prev,
            location: locationValues.join(','),
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

                {/* Job Type filter (Categories) */}
                <div className='max-lg:hidden'>
                    <h4 className='py-4 text-lg font-medium'>
                        Job Type
                    </h4>
                    <ul className='space-y-4 text-gray-600'>
                        {
                            JobCategories.map((category, index) => (
                                <li className='flex items-center gap-3' key={index}>
                                    <input 
                                        className='scale-125' 
                                        type='checkbox' 
                                        id={`category-${index}`}
                                        onChange={() => handleCategoryChange(category)}
                                        checked={selectedCategories.includes(category)} 
                                    />
                                    <label htmlFor={`category-${index}`} className="cursor-pointer select-none">
                                        {category}
                                    </label>
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
                            JobLocations.map((location, index) => (
                                <li className='flex items-center gap-3' key={index}>
                                    <input 
                                        className='scale-125' 
                                        type='checkbox' 
                                        id={`location-${index}`}
                                        onChange={() => handleLocationChange(location)}
                                        checked={selectedLocations.includes(location)} 
                                    />
                                    <label htmlFor={`location-${index}`} className="cursor-pointer select-none">
                                        {typeof location === 'object' ? (location.name || 'Unknown') : location}
                                    </label>
                                </li>
                            ))
                        }
                    </ul>
                </div>
                
                {/* Selected Filters */}
                {(selectedCategories.length > 0 || selectedLocations.length > 0 || searchFilter.title || searchFilter.location) && (
                    <div className='pt-6'>
                        <div className='flex items-center justify-between'>
                            <h4 className='py-2 text-lg font-medium'>
                                Active Filters
                            </h4>
                            <button 
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className='flex flex-wrap gap-2 mt-2'>
                            {searchFilter.title && (
                                <span className='inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded text-sm'>
                                    Search: {searchFilter.title}
                                    <img 
                                        onClick={() => setSearchFilter(prev => ({...prev, title: ""}))} 
                                        className='w-3 h-3 cursor-pointer' 
                                        src={assets.cross_icon} 
                                        alt='Remove filter' 
                                    />
                                </span>
                            )}
                            {searchFilter.location && (
                                <span className='inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded text-sm'>
                                    Location: {searchFilter.location}
                                    <img 
                                        onClick={() => setSearchFilter(prev => ({...prev, location: ""}))} 
                                        className='w-3 h-3 cursor-pointer' 
                                        src={assets.cross_icon} 
                                        alt='Remove filter' 
                                    />
                                </span>
                            )}
                            {selectedCategories.map((category, index) => (
                                <span key={`cat-${index}`} className='inline-flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1 rounded text-sm'>
                                    {category}
                                    <img 
                                        onClick={() => handleCategoryChange(category)} 
                                        className='w-3 h-3 cursor-pointer' 
                                        src={assets.cross_icon} 
                                        alt='Remove filter' 
                                    />
                                </span>
                            ))}
                            {selectedLocations.map((location, index) => (
                                <span key={`loc-${index}`} className='inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1 rounded text-sm'>
                                    {typeof location === 'object' ? (location.name || 'Unknown') : location}
                                    <img 
                                        onClick={() => handleLocationChange(location)} 
                                        className='w-3 h-3 cursor-pointer' 
                                        src={assets.cross_icon} 
                                        alt='Remove filter' 
                                    />
                                </span>
                            ))}
                        </div>
                    </div>
                )}
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
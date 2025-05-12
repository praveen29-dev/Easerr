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
        clearFilters,
        setIsSearched
    } = useContext(AppContext)

    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedLocations, setSelectedLocations] = useState([])
    const [showFilters, setShowFilters] = useState(false)

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
        // Use empty string instead of empty array for API consistency
        const categoryParam = newSelectedCategories.length > 0 ? newSelectedCategories.join(',') : '';
        
        setJobsParams(prev => ({
            ...prev,
            jobType: categoryParam,
            page: 1 // Reset to first page
        }));
        
        // Trigger search immediately when filter changes
        setIsSearched(true);
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

    // Handle category dropdown selection
    const handleCategorySelect = (e) => {
        const category = e.target.value;
        if (category === "") {
            // If empty option selected, clear categories
            setSelectedCategories([]);
            setJobsParams(prev => ({
                ...prev,
                jobType: "",
                page: 1
            }));
        } else if (!selectedCategories.includes(category)) {
            // Add new category
            handleCategoryChange(category);
        }
    };

    // Handle location dropdown selection
    const handleLocationSelect = (e) => {
        const location = e.target.value;
        if (location === "") {
            setSelectedLocations([]);
            setJobsParams(prev => ({
                ...prev,
                location: "",
                page: 1
            }));
        } else if (!selectedLocations.includes(location)) {
            handleLocationChange(location);
            setIsSearched(true);
        }
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
        <div className='container mx-auto py-8 2xl:px-20'>
            {/* Filter Bar - Top Section */}
            <div className='mb-8 bg-white p-6 rounded-lg border shadow-sm'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6'>
                    <h3 className='text-2xl font-medium mb-2 sm:mb-0'>Find Your Ideal Job</h3>
                    
                    <div className='flex space-x-3'>
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className='px-4 py-2 text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors'
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                        
                        {(selectedCategories.length > 0 || selectedLocations.length > 0 || searchFilter.title || searchFilter.location) && (
                            <button 
                                onClick={clearFilters}
                                className='px-4 py-2 text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors'
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Filter Dropdowns */}
                <div className={`filter-controls ${showFilters ? 'block' : 'hidden sm:block'}`}>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                        {/* Job Type Dropdown */}
                        <div className='relative'>
                            <label htmlFor='job-type' className='block mb-2 text-sm font-medium text-gray-700'>
                                Job Type
                            </label>
                            <div className='relative'>
                                <select
                                    id='job-type'
                                    className='block w-full px-4 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none'
                                    onChange={handleCategorySelect}
                                    value=""
                                >
                                    <option value="">Select Job Type</option>
                                    {JobCategories.map((category, index) => (
                                        <option key={index} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        {/* Location Dropdown */}
                        <div className='relative'>
                            <label htmlFor='location' className='block mb-2 text-sm font-medium text-gray-700'>
                                Location
                            </label>
                            <div className='relative'>
                                <select
                                    id='location'
                                    className='block w-full px-4 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none'
                                    onChange={handleLocationSelect}
                                    value=""
                                >
                                    <option value="">Select Location</option>
                                    {JobLocations.map((location, index) => (
                                        <option key={index} value={location}>
                                            {typeof location === 'object' ? (location.name || 'Unknown') : location}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        {/* Search Title Input */}
                        <div className='relative'>
                            <label htmlFor='search-title' className='block mb-2 text-sm font-medium text-gray-700'>
                                Job Title
                            </label>
                            <input
                                id='search-title'
                                type='text'
                                className='block w-full px-4 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                                placeholder='Search by title...'
                                value={searchFilter.title}
                                onChange={(e) => {
                                    setSearchFilter(prev => ({...prev, title: e.target.value}));
                                    setIsSearched(true);
                                }}
                            />
                        </div>
                        
                        {/* Search Button */}
                        <div className='flex items-end'>
                            <button
                                className='w-full px-4 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium'
                                onClick={() => {
                                    setJobsParams(prev => ({...prev, page: 1}));
                                    setIsSearched(true);
                                }}
                            >
                                Search Jobs
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Active Filters */}
                {(selectedCategories.length > 0 || selectedLocations.length > 0 || searchFilter.title || searchFilter.location) && (
                    <div className='mt-6 pt-4 border-t border-gray-200'>
                        <div className='flex items-center mb-3'>
                            <h4 className='text-sm font-medium text-gray-700'>
                                Active Filters:
                            </h4>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                            {searchFilter.title && (
                                <span className='inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-md text-sm'>
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
                                <span className='inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-md text-sm'>
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
                                <span key={`cat-${index}`} className='inline-flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-md text-sm'>
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
                                <span key={`loc-${index}`} className='inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-md text-sm'>
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
            </div>
        </div>
    )
}

export default JobListing
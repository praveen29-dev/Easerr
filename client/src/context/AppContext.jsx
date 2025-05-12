import { createContext, useEffect, useState } from "react";
import { getAllJobs } from "../api/jobApi";
import { useQuery } from "@tanstack/react-query";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const [searchFilter,setSearchFilter] = useState({
        title:'',
        location:''
    })

    const [isSearched,setIsSearched] = useState(false)
    const [jobsParams, setJobsParams] = useState({
        search: '',
        location: '',
        jobType: '',
        skills: [],
        status: 'active',
        sort: 'latest',
        page: 1,
        limit: 20
    })

    // Add safeguards to handle API response
    const { data: jobsData, isLoading, error, refetch } = useQuery({
        queryKey: ['jobs', jobsParams],
        queryFn: async () => {
            try {
                // Create a params object specifically for the API
                // Mapping frontend job types to backend categories
                const apiParams = {
                    ...jobsParams,
                    // Backend uses 'category' instead of 'jobType'
                    category: jobsParams.jobType || undefined,
                };
                
                const response = await getAllJobs(apiParams);
                
                // Ensure the response is well-formed
                if (!response || typeof response !== 'object') {
                    throw new Error('Invalid API response format');
                }
                
                // Add safety checks for response structure
                const jobs = Array.isArray(response.jobs) ? response.jobs : [];
                const totalJobs = typeof response.totalJobs === 'number' ? response.totalJobs : 0;
                
                // Process job data to ensure consistent structure
                const processedJobs = jobs.map(job => {
                    // Make sure job type/category is consistently available
                    if (job.category && !job.jobType) {
                        job.jobType = job.category;
                    } else if (job.jobType && !job.category) {
                        job.category = job.jobType;
                    }
                    return job;
                });
                
                return {
                    ...response,
                    jobs: processedJobs,
                    totalJobs,
                };
            } catch (err) {
                console.error('Error fetching jobs:', err);
                throw err;
            }
        },
        keepPreviousData: true,
        retry: 1,
        staleTime: 30000, // 30 seconds
    })

    // Set search params whenever searchFilter changes
    useEffect(() => {
        if (searchFilter.title || searchFilter.location) {
            setJobsParams(prev => ({
                ...prev,
                search: searchFilter.title,
                location: searchFilter.location,
                page: 1 // Reset to first page on new search
            }))
        }
    }, [searchFilter])

    // Add a function to clear all filters
    const clearFilters = () => {
        setJobsParams({
            search: '',
            location: '',
            jobType: '',
            skills: [],
            status: 'active',
            sort: 'latest',
            page: 1,
            limit: 20
        });
        setSearchFilter({
            title: '',
            location: ''
        });
        setIsSearched(false);
    };

    const value = {
        setSearchFilter, 
        searchFilter,
        isSearched, 
        setIsSearched,
        jobs: jobsData?.jobs || [],
        totalJobs: jobsData?.totalJobs || 0,
        isLoading,
        error,
        jobsParams,
        setJobsParams,
        clearFilters,
        refetchJobs: refetch
    }

    return (<AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>)
}
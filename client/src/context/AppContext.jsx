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
    const { data: jobsData, isLoading, error } = useQuery({
        queryKey: ['jobs', jobsParams],
        queryFn: async () => {
            try {
                const response = await getAllJobs(jobsParams);
                
                // Ensure the response is well-formed
                if (!response || typeof response !== 'object') {
                    throw new Error('Invalid API response format');
                }
                
                // Add safety checks for response structure
                const jobs = Array.isArray(response.jobs) ? response.jobs : [];
                const totalJobs = typeof response.totalJobs === 'number' ? response.totalJobs : 0;
                
                return {
                    ...response,
                    jobs,
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

    const value = {
        setSearchFilter, searchFilter,
        isSearched, setIsSearched,
        jobs: jobsData?.jobs || [],
        totalJobs: jobsData?.totalJobs || 0,
        isLoading,
        error,
        jobsParams,
        setJobsParams
    }

    return (<AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>)
}
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

    const { data: jobsData, isLoading, error } = useQuery({
        queryKey: ['jobs', jobsParams],
        queryFn: () => getAllJobs(jobsParams),
        keepPreviousData: true
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
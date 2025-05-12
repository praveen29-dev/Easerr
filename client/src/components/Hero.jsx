import React, { useContext, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { FiChevronDown } from 'react-icons/fi'

const Hero = () => {
    const {setSearchFilter,setIsSearched} = useContext(AppContext)
    const [showJobTypes, setShowJobTypes] = useState(false)
    const [selectedJobType, setSelectedJobType] = useState('All Job Types')
    const [showLocations, setShowLocations] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState('')

    const titleRef = useRef(null)
    const jobTypeRef = useRef(null)
    const locationRef = useRef(null)

    const jobTypes = [
        'All Job Types',
        'Full-time',
        'Part-time',
        'Contract',
        'Freelance',
        'Internship',
        'Remote'
    ]

    const popularLocations = [
        'New York, USA',
        'London, UK',
        'Toronto, Canada',
        'Sydney, Australia',
        'Singapore',
        'Dubai, UAE',
        'Berlin, Germany'
    ]

    const onSearch = () => {
        setSearchFilter({
            title: titleRef.current.value,
            jobType: selectedJobType === 'All Job Types' ? '' : selectedJobType,
            location: selectedLocation || locationRef.current.value
        })
        setIsSearched(true)
    }

    // Close dropdowns when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (jobTypeRef.current && !jobTypeRef.current.contains(event.target)) {
                setShowJobTypes(false)
            }
            if (locationRef.current && !locationRef.current.contains(event.target)) {
                setShowLocations(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="container mx-auto my-10 2xl:px-20">
            <div className="py-32 mx-2 text-center text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <h2 className="mb-4 text-2xl font-ibrand md:text-3xl lg:text-6xl">
                    Find the job that fits your life
                </h2>
                <p className="max-w-xl px-0 mx-auto mb-8 text-lg font-light">
                    Find the Perfect Job or Hire the Right Talent with Easerr. – Connecting Ambitious Professionals and Top Employers in One Seamless Platform.
                </p>
                <div className="flex flex-col items-center justify-between max-w-4xl gap-4 p-2 mx-4 text-gray-600 bg-white rounded-lg sm:flex-row sm:mx-auto">
                    <div className='flex items-center flex-1 w-full p-2'>
                        <img className="h-4 mr-2 sm:h-5" src={assets.search_icon} alt='' />
                        <input
                            type="text"
                            placeholder="Search for Jobs"
                            className="w-full p-2 rounded outline-none max-sm:text-xs"
                            ref={titleRef}
                        />
                    </div>

                    {/* Job Type Dropdown */}
                    <div className='relative flex-1 w-full' ref={jobTypeRef}>
                        <button
                            onClick={() => setShowJobTypes(!showJobTypes)}
                            className="flex items-center justify-between w-full p-4 rounded-lg bg-gray-50 hover:bg-gray-100"
                        >
                            <span className="text-gray-700">{selectedJobType}</span>
                            <FiChevronDown className={`transition-transform ${showJobTypes ? 'rotate-180' : ''}`} />
                        </button>
                        {showJobTypes && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                                {jobTypes.map((type) => (
                                    <button
                                        key={type}
                                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                                        onClick={() => {
                                            setSelectedJobType(type)
                                            setShowJobTypes(false)
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Location Dropdown/Input */}
                    <div className='relative flex-1 w-full' ref={locationRef}>
                        <div className="flex items-center w-full p-4 rounded-lg bg-gray-50">
                            <img className="h-4 mr-2 sm:h-5" src={assets.location_icon} alt="" />
                            <input
                                type="text"
                                placeholder="Location"
                                className="w-full bg-transparent outline-none"
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                onFocus={() => setShowLocations(true)}
                            />
                            <FiChevronDown 
                                className={`transition-transform ${showLocations ? 'rotate-180' : ''}`}
                                onClick={() => setShowLocations(!showLocations)}
                            />
                        </div>
                        {showLocations && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                                {popularLocations.map((location) => (
                                    <button
                                        key={location}
                                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                                        onClick={() => {
                                            setSelectedLocation(location)
                                            setShowLocations(false)
                                        }}
                                    >
                                        {location}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={onSearch} 
                        className="w-full px-8 py-4 text-white transition-colors bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className='flex p-6 mx-2 mt-5 border border-gray-300 rounded-md shadow-md'>
                <div className='flex flex-wrap justify-center gap-10 lg:gap-16'>
                    <p className='font-medium'>Trusted By</p>
                    <img className='h-6' src={assets.microsoft_logo} alt="" />
                    <img className='h-6' src={assets.adobe_logo} alt="" />
                    <img className='h-6' src={assets.walmart_logo} alt="" />
                    <img className='h-6' src={assets.amazon_logo} alt="" />
                    <img className='h-6' src={assets.accenture_logo} alt="" />
                    <img className='h-6' src={assets.samsung_logo} alt="" />
                </div>
            </div>
        </div>
    )
}

export default Hero
import React, { useContext, useRef } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Hero = () => {

    const {setSearchFilter,setIsSearched} = useContext(AppContext)

    const titleRef = useRef(null)
    const locationRef = useRef(null)

    const onSearch = () => {
        setSearchFilter({
            title:titleRef.current.value,
            location:locationRef.current.value
        })
        setIsSearched(true)
        console.log({
            title:titleRef.current.value,
            location:locationRef.current.value
        });
    }


  return (
    <div className="container mx-auto my-10 2xl:px-20">
        <div className="py-32 mx-2 text-center text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
            <h2 className="mb-4 text-2xl font-medium main-font md:text-3xl lg:text-6xl">
                Find the job that fits your life
            </h2>
            <p className="max-w-xl px-0 mx-auto mb-8 text-lg font-light">
                Find the Perfect Job or Hire the Right Talent with Easerr. – Connecting Ambitious Professionals and Top Employers in One Seamless Platform.
            </p>
            <div className="flex items-center justify-between max-w-xl p-2 pl-6 mx-4 text-gray-600 bg-white rounded-full sm:mx-auto">
                <div className='flex items-center'>
                    <img className="h-4 sm:h-5" src={assets.search_icon} alt='' />
                    <input
              type="text"
              placeholder="Search for Jobs"
              className="w-full p-2 rounded outline-none max-sm:text-xs"
              ref={titleRef}
            />
                </div>
                <div className='flex items-center'>
                <img className="h-4 sm:h-5" src={assets.location_icon} alt="" />
                <input
              type="text"
              placeholder="Location"
              className="w-full p-2 rounded outline-none max-sm:text-xs"
              ref={locationRef}
            />
                </div>
                <button onClick={onSearch} className="px-6 py-2 m-1 text-white bg-blue-600 rounded-full">
            Search
          </button>
            </div>
        
        </div>
        <div className='flex p-6 mx-2 mt-5 border border-gray-300 rounded-md shadow-md'>
            <div className='flex flex-wrap justify-center gap-10 lg:gap-16'>
            <p className='font-medium'> Trusted By</p>
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
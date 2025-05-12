import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import { assets } from '../assets/assets'
import kconvert from 'k-convert';
import moment from 'moment';
import JobCard from '../components/JobCard'
import Footer from '../components/Footer'
import ApplicationModal from '../components/ApplicationModal'
import { useQuery } from '@tanstack/react-query'
import { getUserApplications } from '../api/applicationApi'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'

const ApplyJob = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [jobData, setJobData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { jobs } = useContext(AppContext)
  const [hasApplied, setHasApplied] = useState(false)
  const { isAuthenticated, openLoginModal } = useAuth()
  
  // Fetch user's applications to check if already applied
  const { data: applicationsData } = useQuery({
    queryKey: ['userApplications', { limit: 100 }],
    queryFn: () => getUserApplications({ limit: 100 }),
    enabled: isAuthenticated // Only run if authenticated
  })

  useEffect(() => {
    if (jobs && Array.isArray(jobs) && jobs.length > 0 && id) {
      const data = jobs.find(job => job._id === id)
      if (data) {
        setJobData(data)
        console.log("Fetched job:", data)
      } else {
        console.warn("Job not found for ID:", id)
      }
    }
  }, [id, jobs])
  
  // Check if user has already applied for this job
  useEffect(() => {
    if (applicationsData?.applications && id) {
      const alreadyApplied = applicationsData.applications.some(
        app => app.job?._id === id
      )
      setHasApplied(alreadyApplied)
    }
  }, [applicationsData, id])

  const handleOpenModal = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Open login modal instead of redirecting
      openLoginModal()
      toast.error('Please log in to apply for this job')
      return
    }
    
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }
  
  const handleViewApplications = () => {
    navigate('/applications')
  }

  return jobData ? (
    <>
      <Navbar />
      <div className='container flex flex-col min-h-screen px-4 py-10 mx-auto 2xl:px-20'>
        <div className='bg-white rounded-lg w-ful text-balance'>
          <div className='flex flex-wrap justify-center gap-8 py-20 mb-6 border md:justify-between px-14 bg-sky-50 border-sky-400 rounded-xl'>
            <div className='flex flex-col items-center md:flex-row'>
            <img className='h-24 p-4 mr-4 bg-white border rounded-lg max-md:mb-4 ' src={jobData.companyId?.image || assets.company_icon} alt="" />
            <div className='text-center md:text-left text-neutral-700'>
              <h1 className='text-2xl font-medium sm:text-4xl'>{jobData.title}</h1>
              <div className='flex flex-row flex-wrap items-center gap-6 mt-2 text-gray-600 max-md:justify-center gap-y-2'>
                <span className='flex items-center gap-1'>
                  <img src={assets.suitcase_icon} alt="" />
                  {jobData.companyId?.name || 'Company'}
                </span>
                <span className='flex items-center gap-1'>
                  <img src={assets.location_icon} alt="" />
                  {jobData.location || 'Remote'}
                </span>
                <span className='flex items-center gap-1'>
                  <img src={assets.person_icon} alt="" />
                  {jobData.level || 'Any Level'}
                </span>
                <span className='flex items-center gap-1'>
                  <img src={assets.money_icon} alt="" />
                  CTC: {kconvert.convertTo(jobData.salary || 0)}
                </span>
              </div>
            </div>
            </div>
            <div className='flex flex-col justify-center text-sm text-end max-md:mx-auto max-md:text-center'>
            {isAuthenticated && hasApplied ? (
              <button 
                className='p-2.5 px-10 text-white bg-green-600 rounded hover:bg-green-700 transition-colors'
                onClick={handleViewApplications}
              >
                Already Applied
              </button>
            ) : (
              <button 
                className='p-2.5 px-10 text-white rounded bg-blue-600 hover:bg-blue-700 transition-colors'
                onClick={handleOpenModal}
              >
                Apply Now
              </button>
            )}
            <p className='mt-1 text-gray-600'>Posted {moment(jobData.date).fromNow()}</p>
          </div>
          </div>

        <div className='flex flex-col items-start justify-between lg:flex-row'>
          <div className='w-full lg:w-2/3'>
            <h2 className='mb-4 text-2xl font-bold'>Job Description</h2>
            <div className='rich-text' dangerouslySetInnerHTML={{__html: jobData.description || 'No description available'}}></div>
            {isAuthenticated && hasApplied ? (
              <button 
                className='p-2.5 px-10 mt-10 text-white bg-green-600 rounded hover:bg-green-700 transition-colors'
                onClick={handleViewApplications}
              >
                View Your Application
              </button>
            ) : (
              <button 
                className='p-2.5 px-10 text-white rounded bg-blue-600 mt-10 hover:bg-blue-700 transition-colors'
                onClick={handleOpenModal}
              >
                Apply Now
              </button>
            )}
          </div>
          {/* RIght Section More Jobs */}
          <div className='w-full mt-8 space-y-5 lg:w-1/3 lg:mt-8'>
            <h2>More jobs from {jobData.companyId?.name || 'Company'}</h2>
            {jobs.filter( job => job._id !== jobData._id && job.companyId?._id === jobData.companyId?._id)
            .filter( job => true).slice(0,4)
            .map((job,index)=><JobCard key={index} job={job} />)}
          </div>
        </div>
          
        </div>
      </div>
      
      {/* Job Application Modal */}
      <ApplicationModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        jobId={jobData._id}
        jobTitle={jobData.title}
      />
      
      <Footer />
    </>
  ) : (
    <Loading />
  )
}

export default ApplyJob


import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import { assets } from '../assets/assets'
import kconvert from 'k-convert';
import moment from 'moment';
import JobCard from '../components/JobCard'
import Footer from '../components/Footer'

const ApplyJob = () => {
  const { id } = useParams()
  const [jobData, setJobData] = useState(null)
  const { jobs } = useContext(AppContext)

  useEffect(() => {
    if (jobs.length > 0) {
      const data = jobs.find(job => job._id === id)
      if (data) {
        setJobData(data)
        console.log("Fetched job:", data)
      } else {
        console.warn("Job not found for ID:", id)
      }
    }
  }, [id, jobs])

  return jobData ? (
    <>
      <Navbar />
      <div className='container flex flex-col min-h-screen px-4 py-10 mx-auto 2xl:px-20'>
        <div className='bg-white rounded-lg w-ful text-balance'>
          <div className='flex flex-wrap justify-center gap-8 py-20 mb-6 border md:justify-between px-14 bg-sky-50 border-sky-400 rounded-xl'>
            <div className='flex flex-col items-center md:flex-row'>
            <img className='h-24 p-4 mr-4 bg-white border rounded-lg max-md:mb-4 ' src={jobData.companyId.image} alt="" />
            <div className='text-center md:text-left text-neutral-700'>
              <h1 className='text-2xl font-medium sm:text-4xl'>{jobData.title}</h1>
              <div className='flex flex-row flex-wrap items-center gap-6 mt-2 text-gray-600 max-md:justify-center gap-y-2'>
                <span className='flex items-center gap-1'>
                  <img src={assets.suitcase_icon} alt="" />
                  {jobData.companyId.name}
                </span>
                <span className='flex items-center gap-1'>
                  <img src={assets.location_icon} alt="" />
                  {jobData.location}
                </span>
                <span className='flex items-center gap-1'>
                  <img src={assets.person_icon} alt="" />
                  {jobData.level}
                </span>
                <span className='flex items-center gap-1'>
                  <img src={assets.money_icon} alt="" />
                  CTC: {kconvert.convertTo(jobData.salary)}
                </span>
              </div>
            </div>
            </div>
            <div className='flex flex-col justify-center text-sm text-end max-md:mx-auto max-md:text-center'>
            <button className='p-2.5 px-10 text-white rounded bg-blue-600'>Apply Now</button>
            <p className='mt-1 text-gray-600'>Posted {moment(jobData.date).fromNow()}</p>
          </div>
          </div>

        <div className='flex flex-col items-start justify-between lg:flex-row'>
          <div className='w-full lg:w-2/3'>
            <h2 className='mb-4 text-2xl font-bold'>Job Description</h2>
            <div className='rich-text' dangerouslySetInnerHTML={{__html:jobData.description}}></div>
            <button className='p-2.5 px-10 text-white rounded bg-blue-600 mt-10'>Apply Now</button>
          </div>
          {/* RIght Section More Jobs */}
          <div className='w-full mt-8 space-y-5 lg:w-1/3 lg:mt-8'>
            <h2>More jobs from {jobData.companyId.name}</h2>
            {jobs.filter( job => job._id !== jobData._id && job.companyId._id === jobData.companyId._id)
            .filter( job => true).slice(0,4)
            .map((job,index)=><JobCard key={index} job={job} />)}
          </div>
        </div>
          
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  )
}

export default ApplyJob


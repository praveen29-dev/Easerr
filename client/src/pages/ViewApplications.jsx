import React from 'react'
import { assets, viewApplicationsPageData } from '../assets/assets'

const ViewApplications = () => {
  return (
    <div className='container p-4 mx-auto'>
        <div>
            <table className='w-full max-w-4xl bg-white border border-gray-200 max-sm:text-sm'>
                <thead>
                    <tr className='border-b'>
                        <th className='px-4 py-2 text-left'>#</th>
                        <th className='px-4 py-2 text-left'>User Name</th>
                        <th className='px-4 py-2 text-left max-sm:hidden'>Job Title</th>
                        <th className='px-4 py-2 text-left max-sm:hidden'>Location</th>
                        <th className='px-4 py-2 text-left'>Resume</th>
                        <th className='px-4 py-2 text-left'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {viewApplicationsPageData.map((applicant,index)=>(
                        <tr key={index} className='text-gray-700'>
                            <td  className='px-4 py-2 text-center border-b'>{index+1}</td>
                            <td className='flex px-4 py-2 text-center border-b'>
                                <img className='w-10 h-10 mr-3 rounded-full max-sm:hidden' src={applicant.imgSrc} alt="" />
                                <span>{applicant.name}</span>
                            </td>
                            <td className='px-4 py-2 border-b max-sm:hidden'>{applicant.jobTitle}</td>
                            <td className='px-4 py-2 border-b max-sm:hidden'>{applicant.location}</td>
                            <td className='px-4 py-2 border-b'>
                                <a className='inline-flex items-center gap-2 px-3 py-1 text-blue-400 rounded bg-blue-50 ' href="" target='_blank'>
                                    Resume <img src={assets.resume_download_icon} alt="" />
                                </a>
                            </td>
                            <td className='relative px-4 py-2 border-b'>
                                <div className='relative inline-block text-left group'>
                                    <button className='text-gray-500 action-button'>...</button>
                                    <div className='absolute top-0 right-0 z-10 hidden w-32 mt-2 bg-white border md:left-0 border-gray-50'>
                                        <button className='block w-full px-4 py-2 text-left text-blue-500 hover:bg-gray-100'>Accept</button>
                                        <button className='block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100'>Reject</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default ViewApplications
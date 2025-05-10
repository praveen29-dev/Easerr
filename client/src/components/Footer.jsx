import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='py-4 shadow'>
        <div className='container flex items-center justify-between gap-4 px-4 py-3 mx-auto 2xl:px20 mp-4'>
        <img src={assets.logo} alt='' />
        <p className='flex-1 pl-4 text-sm text-gray-500 border-gray-400 border-1 max-sm:hidden'>Copyright @Easerr | All Right reserved.  </p>
        <div className='flex gap-2.5'>
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.instagram_icon} alt="" />
        </div>
    </div>
    </div>
    
  )
}

export default Footer
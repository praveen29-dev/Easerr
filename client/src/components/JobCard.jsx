import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

const JobCard = ({ job }) => {
    const navigate = useNavigate()

    // Ensure job is an object
    if (!job || typeof job !== 'object') {
        return <div className="p-4 text-red-500 bg-red-50 rounded">Invalid job data</div>;
    }

    // Format posted date as "2 days ago" etc.
    const postedDate = job.createdAt 
        ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) 
        : 'Recently'

    // Format company name safely
    const getCompanyName = () => {
        if (!job.company) return 'Company';
        if (typeof job.company === 'object') {
            return job.company.name || 'Company';
        }
        return job.company;
    }

    // Format location safely
    const getLocation = () => {
        if (!job.location) return 'Remote';
        if (typeof job.location === 'object') {
            return job.location.name || job.location.city || 'Location';
        }
        return job.location;
    }

    // Format job type safely - could be jobType or category in the API response
    const getJobType = () => {
        // First check jobType property
        if (job.jobType) {
            if (typeof job.jobType === 'object') {
                return job.jobType.name || '';
            }
            return job.jobType;
        }
        // Otherwise check category property
        if (job.category) {
            if (typeof job.category === 'object') {
                return job.category.name || '';
            }
            return job.category;
        }
        return null;
    }

    // Format job level safely
    const getJobLevel = () => {
        if (!job.level) return null;
        if (typeof job.level === 'object') {
            return job.level.name || '';
        }
        return job.level;
    }

    // Get job type badge color based on category
    const getJobTypeBadgeColor = (jobType) => {
        if (!jobType) return { bg: 'bg-gray-50', border: 'border-gray-200' };
        
        const type = jobType.toLowerCase();
        if (type.includes('program') || type === 'programming') {
            return { bg: 'bg-blue-50', border: 'border-blue-200' };
        } else if (type.includes('data') || type === 'data science') {
            return { bg: 'bg-purple-50', border: 'border-purple-200' };
        } else if (type.includes('design') || type === 'designing') {
            return { bg: 'bg-pink-50', border: 'border-pink-200' };
        } else if (type.includes('market') || type === 'marketing') {
            return { bg: 'bg-orange-50', border: 'border-orange-200' };
        } else if (type.includes('manage') || type === 'management') {
            return { bg: 'bg-green-50', border: 'border-green-200' };
        } else if (type.includes('cyber') || type === 'cybersecurity') {
            return { bg: 'bg-red-50', border: 'border-red-200' };
        } else if (type.includes('network') || type === 'networking') {
            return { bg: 'bg-indigo-50', border: 'border-indigo-200' };
        }
        
        return { bg: 'bg-gray-50', border: 'border-gray-200' };
    };

    const jobType = getJobType();
    const jobTypeBadgeColor = getJobTypeBadgeColor(jobType);

    return (
        <div className='p-6 border rounded shadow transition-all hover:shadow-md'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    {job.companyLogo ? (
                        <img className='w-12 h-12 object-contain' src={job.companyLogo} alt={getCompanyName()} />
                    ) : (
                        <img className='w-12 h-12' src={assets.company_icon} alt='Company logo' />
                    )}
                    <div>
                        <p className='text-sm font-medium text-gray-500'>{getCompanyName()}</p>
                        <p className='text-xs text-gray-400'>Posted {postedDate}</p>
                    </div>
                </div>
                {job.isFeatured && (
                    <span className='px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 rounded-full'>
                        Featured
                    </span>
                )}
            </div>

            <h4 className='mt-3 text-xl font-medium'>{job.title || 'Job Position'}</h4>
            
            <div className='flex flex-wrap items-center gap-2 mt-3 text-xs'>
                <span className='bg-blue-50 border border-blue-200 px-3 py-1 rounded-full'>{getLocation()}</span>
                {jobType && (
                    <span className={`${jobTypeBadgeColor.bg} border ${jobTypeBadgeColor.border} px-3 py-1 rounded-full`}>
                        {jobType}
                    </span>
                )}
                {getJobLevel() && (
                    <span className='bg-red-50 border border-red-200 px-3 py-1 rounded-full'>{getJobLevel()}</span>
                )}
                {job.isRemote && (
                    <span className='bg-purple-50 border border-purple-200 px-3 py-1 rounded-full'>Remote</span>
                )}
            </div>

            {job.salary && (
                <div className='mt-3 text-sm font-medium text-green-600'>
                    {typeof job.salary === 'object' 
                        ? `$${job.salary.min || 0} - $${job.salary.max || 0} ${job.salary.period || 'yearly'}`
                        : job.salary}
                </div>
            )}
            
            <p className='mt-4 text-sm text-gray-500 line-clamp-3'>
                {job.description ? (
                    <span dangerouslySetInnerHTML={{
                        __html: typeof job.description === 'string' 
                            ? job.description.slice(0, 150) + (job.description.length > 150 ? '...' : '')
                            : 'No description available'
                    }} />
                ) : (
                    'No description available'
                )}
            </p>
            
            {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                <div className='mt-3 flex flex-wrap gap-2'>
                    {job.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className='px-2 py-1 text-xs bg-gray-100 rounded'>
                            {typeof skill === 'object' ? (skill.name || 'Skill') : skill}
                        </span>
                    ))}
                    {job.skills.length > 3 && (
                        <span className='px-2 py-1 text-xs bg-gray-100 rounded'>
                            +{job.skills.length - 3} more
                        </span>
                    )}
                </div>
            )}
            
            <div className='flex gap-4 mt-4 text-sm'>
                <button 
                    onClick={() => {
                        navigate(`/apply-job/${job._id}`); 
                        window.scrollTo(0,0);
                    }} 
                    className='px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors'>
                    Apply Now
                </button>
                <button 
                    onClick={() => {
                        navigate(`/job/${job._id}`); 
                        window.scrollTo(0,0);
                    }} 
                    className='px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors'>
                    View Details
                </button>
            </div>
        </div>
    )
}

export default JobCard
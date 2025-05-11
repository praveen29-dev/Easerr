import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

// Submit a job application
export const submitApplication = async (req, res) => {
  try {
    const { jobId, coverLetter, resume } = req.body;

    // Check if job exists and is active
    const job = await Job.findOne({ _id: jobId, status: 'active' });
    
    if (!job) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Job not found or not accepting applications'
      });
    }

    // Check if user has already applied for this job
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.userId
    });

    if (existingApplication) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create new application
    const application = await Application.create({
      job: jobId,
      applicant: req.user.userId,
      resume,
      coverLetter,
    });

    // Increment the application count in the job document
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Get all applications for a specific job (for recruiters)
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, sort = 'newest', page = 1, limit = 10 } = req.query;

    // Check if job exists and belongs to the recruiter
    const job = await Job.findOne({ 
      _id: jobId,
      company: req.user.userId
    });
    
    if (!job) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Job not found or you do not have permission'
      });
    }

    // Build query
    const queryObject = { job: jobId };
    
    // Filter by status
    if (status && status !== 'all') {
      queryObject.status = status;
    }

    // Define sort options
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'status-asc': { status: 1 },
      'status-desc': { status: -1 },
    };

    const sortKey = sortOptions[sort] || sortOptions.newest;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with pagination
    const applications = await Application.find(queryObject)
      .sort(sortKey)
      .skip(skip)
      .limit(Number(limit))
      .populate('applicant', 'name email image');

    // Get total applications count for pagination
    const totalApplications = await Application.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalApplications / Number(limit));

    res.status(StatusCodes.OK).json({
      success: true,
      applications,
      totalApplications,
      numOfPages,
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Get all applications by the current user (job seeker)
export const getUserApplications = async (req, res) => {
  try {
    const { status, sort = 'newest', page = 1, limit = 10 } = req.query;

    // Build query
    const queryObject = { applicant: req.user.userId };
    
    // Filter by status
    if (status && status !== 'all') {
      queryObject.status = status;
    }

    // Define sort options
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'status-asc': { status: 1 },
      'status-desc': { status: -1 },
    };

    const sortKey = sortOptions[sort] || sortOptions.newest;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with pagination
    const applications = await Application.find(queryObject)
      .sort(sortKey)
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: 'job',
        select: 'title company location salary',
        populate: {
          path: 'company',
          select: 'name image'
        }
      });

    // Get total applications count for pagination
    const totalApplications = await Application.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalApplications / Number(limit));

    res.status(StatusCodes.OK).json({
      success: true,
      applications,
      totalApplications,
      numOfPages,
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findById(id)
      .populate('applicant', 'name email image')
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name image'
        }
      });
    
    if (!application) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized (either the applicant or the job owner)
    const isApplicant = application.applicant._id.toString() === req.user.userId;
    const isJobOwner = application.job.company._id.toString() === req.user.userId;

    if (!isApplicant && !isJobOwner) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      application
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Update application status (for recruiters)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const application = await Application.findById(id).populate('job');
    
    if (!application) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the job owner/recruiter
    if (application.job.company.toString() !== req.user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update application
    application.status = status;
    if (notes) application.notes = notes;
    application.updatedAt = Date.now();
    
    await application.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Application status updated to ${status}`,
      application
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Delete application (only for job seekers, before it's reviewed)
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the applicant
    if (application.applicant.toString() !== req.user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Not authorized to delete this application'
      });
    }

    // Check if application is still pending
    if (application.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'You can only withdraw applications that are still pending'
      });
    }

    // Get the job ID to update counter
    const jobId = application.job;

    await Application.findByIdAndDelete(id);
    
    // Decrement the application count in the job document
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: -1 } });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Get all applications for the recruiter (across all jobs)
export const getAllRecruiterApplications = async (req, res) => {
  try {
    console.log('Starting getAllRecruiterApplications for user:', req.user.userId);
    const { status, sort = 'newest', page = 1, limit = 10 } = req.query;

    // Find all jobs belonging to this recruiter
    const recruiterJobs = await Job.find({ company: req.user.userId }).select('_id');
    const jobIds = recruiterJobs.map(job => job._id);
    
    console.log('Found recruiter jobs:', jobIds.length);
    
    // Build query
    const queryObject = { job: { $in: jobIds } };
    
    // Filter by status
    if (status && status !== 'all') {
      queryObject.status = status;
    }

    // Define sort options
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'status-asc': { status: 1 },
      'status-desc': { status: -1 },
    };

    const sortKey = sortOptions[sort] || sortOptions.newest;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with pagination
    const applications = await Application.find(queryObject)
      .sort(sortKey)
      .skip(skip)
      .limit(Number(limit))
      .populate('applicant', 'name email image')
      .populate('job', 'title location');
    
    console.log('Found applications:', applications.length);

    // Get total applications count for pagination
    const totalApplications = await Application.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalApplications / Number(limit));
    
    console.log('Total applications:', totalApplications);

    // Get application status counts
    const statusCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('Status counts:', statusCounts);

    // Format status counts
    const formattedStatusCounts = {
      total: totalApplications,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0
    };

    statusCounts.forEach(status => {
      formattedStatusCounts[status._id] = status.count;
    });
    
    console.log('Formatted status counts:', formattedStatusCounts);

    res.status(StatusCodes.OK).json({
      success: true,
      applications,
      totalApplications,
      numOfPages,
      currentPage: Number(page),
      statusCounts: formattedStatusCounts
    });
  } catch (error) {
    console.error('Error in getAllRecruiterApplications:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
}; 
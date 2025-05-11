import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { StatusCodes } from 'http-status-codes';

// Create a new job
export const createJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      location, 
      category, 
      level, 
      salary, 
      requirements, 
      responsibilities, 
      applicationDeadline 
    } = req.body;

    // Add the company field from the authenticated user
    const newJob = await Job.create({
      title,
      description,
      location,
      category,
      level,
      salary,
      requirements,
      responsibilities,
      applicationDeadline,
      company: req.user.userId,
    });

    res.status(StatusCodes.CREATED).json({ 
      success: true, 
      message: 'Job created successfully', 
      job: newJob 
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all jobs (with filtering, pagination and sorting)
export const getAllJobs = async (req, res) => {
  try {
    const { 
      search, 
      location, 
      category, 
      level, 
      minSalary, 
      maxSalary,
      status,
      sort = 'latest',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const queryObject = { status: status || 'active' };

    // Search by title or description
    if (search) {
      queryObject.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by location
    if (location) {
      queryObject.location = { $regex: location, $options: 'i' };
    }

    // Filter by category
    if (category) {
      queryObject.category = category;
    }

    // Filter by level
    if (level) {
      queryObject.level = level;
    }

    // Filter by salary range
    if (minSalary || maxSalary) {
      queryObject.salary = {};
      if (minSalary) queryObject.salary.$gte = Number(minSalary);
      if (maxSalary) queryObject.salary.$lte = Number(maxSalary);
    }

    // Define sort options
    const sortOptions = {
      latest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'a-z': { title: 1 },
      'z-a': { title: -1 },
      'salary-highest': { salary: -1 },
      'salary-lowest': { salary: 1 },
    };

    const sortKey = sortOptions[sort] || sortOptions.latest;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with pagination
    const jobs = await Job.find(queryObject)
      .sort(sortKey)
      .skip(skip)
      .limit(Number(limit))
      .populate('company', 'name email image'); // Populate company details

    // Get total jobs count for pagination
    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / Number(limit));

    res.status(StatusCodes.OK).json({
      success: true,
      jobs,
      totalJobs,
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

// Get job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name email image');
    
    if (!job) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      job
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Update job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the owner of the job
    if (job.company.toString() !== req.user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the owner of the job
    if (job.company.toString() !== req.user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    // Delete job and associated applications
    await Promise.all([
      Job.findByIdAndDelete(req.params.id),
      Application.deleteMany({ job: req.params.id })
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Job and associated applications deleted successfully'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Get jobs posted by the current recruiter
export const getRecruiterJobs = async (req, res) => {
  try {
    const { status, search, sort = 'latest', page = 1, limit = 10 } = req.query;

    // Build query
    const queryObject = { company: req.user.userId };

    // Filter by status
    if (status && status !== 'all') {
      queryObject.status = status;
    }

    // Search by title or description
    if (search) {
      queryObject.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Define sort options
    const sortOptions = {
      latest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'a-z': { title: 1 },
      'z-a': { title: -1 },
      'applications-highest': { applicationCount: -1 },
    };

    const sortKey = sortOptions[sort] || sortOptions.latest;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with pagination
    const jobs = await Job.find(queryObject)
      .sort(sortKey)
      .skip(skip)
      .limit(Number(limit));

    // Get application count for each job
    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicationCount
        };
      })
    );

    // Get total jobs count for pagination
    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / Number(limit));

    res.status(StatusCodes.OK).json({
      success: true,
      jobs: jobsWithApplications,
      totalJobs,
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

// Get job statistics for the recruiter's dashboard
export const getJobStats = async (req, res) => {
  try {
    // Get total number of jobs by status
    const jobStats = await Job.aggregate([
      { $match: { company: mongoose.Types.ObjectId(req.user.userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get application statistics
    const applicationStats = await Application.aggregate([
      { 
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobInfo'
        } 
      },
      { $unwind: '$jobInfo' },
      { $match: { 'jobInfo.company': mongoose.Types.ObjectId(req.user.userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get monthly job posting stats for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyJobStats = await Job.aggregate([
      { 
        $match: { 
          company: mongoose.Types.ObjectId(req.user.userId),
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format the response
    const formattedJobStats = {
      total: 0,
      active: 0,
      closed: 0,
      draft: 0
    };

    jobStats.forEach(stat => {
      formattedJobStats[stat._id] = stat.count;
      formattedJobStats.total += stat.count;
    });

    const formattedApplicationStats = {
      total: 0,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0
    };

    applicationStats.forEach(stat => {
      formattedApplicationStats[stat._id] = stat.count;
      formattedApplicationStats.total += stat.count;
    });

    res.status(StatusCodes.OK).json({
      success: true,
      jobStats: formattedJobStats,
      applicationStats: formattedApplicationStats,
      monthlyJobStats
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Change job status (active, closed, draft)
export const changeJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the owner of the job
    if (job.company.toString() !== req.user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    // Update status
    job.status = status;
    job.updatedAt = Date.now();
    await job.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Job status changed to ${status}`,
      job
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
}; 
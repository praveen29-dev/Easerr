import Job from '../models/Job.js';
import Application from '../models/Application.js';
import mongoose from 'mongoose';

/**
 * Syncs the application count for all jobs in the database.
 * This function should be run once to update existing jobs with the correct application count.
 * It can also be scheduled to run periodically to ensure counts stay in sync.
 */
export const syncJobApplicationCounts = async () => {
  try {
    console.log('Starting application count sync...');
    
    // Get all jobs
    const jobs = await Job.find({});
    
    // Update each job with the correct application count
    for (const job of jobs) {
      const count = await Application.countDocuments({ job: job._id });
      
      // Only update if the count is different
      if (job.applicationCount !== count) {
        await Job.updateOne(
          { _id: job._id },
          { $set: { applicationCount: count } }
        );
        console.log(`Updated job ${job._id}: set application count to ${count}`);
      }
    }
    
    console.log('Application count sync completed successfully');
    return { success: true, message: 'Application counts synced successfully' };
  } catch (error) {
    console.error('Error syncing application counts:', error);
    return { success: false, message: error.message };
  }
};

export default { syncJobApplicationCounts }; 
import express from 'express';
import { 
  createJob, 
  getAllJobs, 
  getJobById, 
  updateJob, 
  deleteJob, 
  getRecruiterJobs, 
  getJobStats,
  changeJobStatus
} from '../controllers/jobController.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes - for authenticated users (mostly for recruiters)
router.post('/', auth, checkRole('recruiter'), createJob);
router.put('/:id', auth, checkRole('recruiter'), updateJob);
router.delete('/:id', auth, checkRole('recruiter'), deleteJob);
router.patch('/:id/status', auth, checkRole('recruiter'), changeJobStatus);

// Recruiter stats and job management
router.get('/recruiter/jobs', auth, checkRole('recruiter'), getRecruiterJobs);
router.get('/recruiter/stats', auth, checkRole('recruiter'), getJobStats);

export default router; 
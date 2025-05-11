import express from 'express';
import { 
  submitApplication,
  getJobApplications,
  getUserApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getAllRecruiterApplications
} from '../controllers/applicationController.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Job seeker routes
router.post('/', auth, submitApplication);
router.get('/user', auth, getUserApplications);
router.delete('/:id', auth, deleteApplication);

// Recruiter routes
router.get('/job/:jobId', auth, checkRole('recruiter'), getJobApplications);
router.get('/recruiter', auth, checkRole('recruiter'), getAllRecruiterApplications);
router.patch('/:id/status', auth, checkRole('recruiter'), updateApplicationStatus);

// Shared routes
router.get('/:id', auth, getApplicationById);

export default router; 
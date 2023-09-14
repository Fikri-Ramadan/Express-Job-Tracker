import { Router } from 'express';

import {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
} from '../controllers/job.controller.js';
import {
  validateJobInput,
  validateIdParam,
} from '../middlewares/validationMiddleware.js';

const router = Router();

router.get('/', getAllJobs);
router.get('/stats', showStats);
router.get('/:id', validateIdParam, getJob);
router.post('/', validateJobInput, createJob);
router.put('/:id', validateIdParam, validateJobInput, updateJob);
router.delete('/:id', validateIdParam, deleteJob);

export default router;

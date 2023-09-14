import { Router } from 'express';

import {
  getApplicationStats,
  getCurrentUser,
  updateUser,
} from '../controllers/user.controller.js';
import { authorizePermissions } from '../middlewares/authMiddleware.js';
import { validateUpdateUserInput } from '../middlewares/validationMiddleware.js';
import upload from '../middlewares/multerMiddleware.js';

const router = Router();

router.get('/current-user', getCurrentUser);
router.get(
  '/admin/app-stats',
  authorizePermissions('admin'),
  getApplicationStats
);
router.put('/update-user', upload.single('avatar'), validateUpdateUserInput, updateUser);

export default router;

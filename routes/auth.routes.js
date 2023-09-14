import { Router } from 'express';

import { register, login, logout } from '../controllers/auth.controller.js';
import {
  validateRegisterInput,
  validateLoginInput,
} from '../middlewares/validationMiddleware.js';

const router = Router();

router.post('/register', validateRegisterInput, register);
router.post('/login', validateLoginInput, login);
router.get('/logout', logout);

export default router;

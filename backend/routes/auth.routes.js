import express from 'express';
import {
  signup,
  login,
  refresh,
  logout,
  getMe,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  signupValidator,
  loginValidator,
} from '../validators/auth.validator.js';

const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;

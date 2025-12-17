import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, UserController.getAllUsers);
router.patch('/profile', authenticateToken, UserController.updateProfile);
// router.get('/', UserController.getAllUsers);

export default router;

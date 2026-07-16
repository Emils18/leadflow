import { Router } from 'express';
import {
  createUser,
  getRoles,
  getUsers,
  updateUser,
} from '../controllers/userController.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

const router = Router();

// Users & Roles module.
// Only admin users with can_manage_users permission can access these routes.
router.get('/', requireAuth, requirePermission('can_manage_users'), getUsers);
router.get('/roles', requireAuth, requirePermission('can_manage_users'), getRoles);
router.post('/', requireAuth, requirePermission('can_manage_users'), createUser);
router.patch('/:id', requireAuth, requirePermission('can_manage_users'), updateUser);

export default router;
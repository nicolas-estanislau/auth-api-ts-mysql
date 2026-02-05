import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updatePatchUser,
  softDeleteUser,
  restoreUser,
  updateUserStatus,
  updateUserRole,
  deleteUser
} from '../controllers/user.controller';
import { validate } from "../middlewares/user.validate";
import { createUserSchema, updateUserSchema, updatePatchUserSchema, updateStatusUserSchema, updateRoleUserSchema } from "../schemas/user.schema";
import { authMiddleware, adminMiddleware, canAccessUser } from '../middlewares/auth';

const router = Router();

router.post('/users', validate(createUserSchema), createUser);
router.get('/users/:id', authMiddleware, canAccessUser, getUserById);
router.put('/users/:id', validate(updateUserSchema), authMiddleware, updateUser);
router.patch('/users/:id', validate(updatePatchUserSchema), authMiddleware, updatePatchUser);

// ROTAS ADMIN
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.patch('/users/:id/soft-delete', authMiddleware, adminMiddleware, softDeleteUser);
router.patch('/users/:id/restore', authMiddleware, adminMiddleware, restoreUser);
router.patch('/users/:id/status', validate(updateStatusUserSchema), authMiddleware, adminMiddleware, updateUserStatus);
router.patch('/users/:id/role', validate(updateRoleUserSchema), authMiddleware, adminMiddleware, updateUserRole);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
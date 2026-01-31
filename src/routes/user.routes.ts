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
  deleteUser
} from '../controllers/user.controller';
import { validate } from "../middlewares/user.validate";
import { createUserSchema, updateUserSchema, updatePatchUserSchema, updateStatusUserSchema } from "../schemas/user.schema";
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/users', validate(createUserSchema), createUser);
router.get('/users/:id', authMiddleware, getUserById);
router.put('/users/:id', validate(updateUserSchema), authMiddleware, updateUser);
router.patch('/users/:id', validate(updatePatchUserSchema), authMiddleware, updatePatchUser);
router.get('/users', authMiddleware, getUsers);
router.patch('/users/:id/soft-delete', authMiddleware, softDeleteUser);
router.patch('/users/:id/restore', authMiddleware, restoreUser);
router.delete('/users/:id', authMiddleware, deleteUser);

// ROTAS ADMIN
router.patch('/users/:id/status', validate(updateStatusUserSchema), adminMiddleware, authMiddleware, updateUserStatus);
router.patch('/users/:id/role', validate(updateStatusUserSchema), adminMiddleware, authMiddleware, updateUserStatus);

export default router;
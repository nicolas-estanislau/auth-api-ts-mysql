import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updatePatchUser,
  softDeleteUser,
  deleteUser
} from '../controllers/user.controller';
import { validate } from "../middlewares/user.validate";
import { createUserSchema, updateUserSchema, updatePatchUserSchema } from "../schemas/user.schema";
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/users', validate(createUserSchema), authMiddleware, createUser);
router.get('/users', authMiddleware, getUsers);
router.get('/users/:id', authMiddleware, getUserById);
router.put('/users/:id', validate(updateUserSchema), authMiddleware, updateUser);
router.patch('/users/:id', validate(updatePatchUserSchema), authMiddleware, updatePatchUser);
router.patch('/users/:id/soft-delete', authMiddleware, softDeleteUser);

router.delete('/users/:id', authMiddleware, deleteUser);

export default router;
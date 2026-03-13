import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres'),

  email: z
    .email('Email inválido'),

  password: z
    .string()
    .min(6, 'Senha mínima de 6 caracteres')
    .regex(/[A-Z]/, "Deve conter letra maiúscula")
    .regex(/[0-9]/, "Deve conter número")
    .regex(/[^A-Za-z0-9]/, "Deve conter caractere especial")
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres'),

  email: z
    .email('Email inválido'),


  password: z
    .string()
    .min(6, 'Senha mínima de 6 caracteres')
    .regex(/[A-Z]/, "Deve conter letra maiúscula")
    .regex(/[0-9]/, "Deve conter número")
    .regex(/[^A-Za-z0-9]/, "Deve conter caractere especial")
})

export const updatePatchUserSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .optional(),

  email: z
    .email('Email inválido')
    .optional(),


  password: z
    .string()
    .min(6, 'Senha mínima de 6 caracteres')
    .regex(/[A-Z]/, "Deve conter letra maiúscula")
    .regex(/[0-9]/, "Deve conter número")
    .regex(/[^A-Za-z0-9]/, "Deve conter caractere especial")
    .optional()
})
export const softDeleteUserSchema = z.object({
  delete_at: z.boolean()
})

export const updateStatusUserSchema = z.object({
  status: z.enum(["active", "inactive"])
})

export const updateRoleUserSchema = z.object({
  role: z.enum(["admin", "user", "moderator"])
})

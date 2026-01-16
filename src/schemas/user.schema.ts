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
})
import { Request, Response } from 'express';
import { db } from '../database/connection';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';

// CREATE
export const createUser = async (req: Request, res: Response) => {
  const { name, email, password }: User = req.body

  // verificar email duplicado
  const [rows]: any = await db.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (rows.length > 0) {
    return res.status(409).json({ error: 'Email já cadastrado' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.execute(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );

  res.status(201).json({ message: 'Usuário criado com sucesso' });
};

// READ ALL
export const getUsers = async (_: Request, res: Response) => {
  const [rows] = await db.execute('SELECT * FROM users');
  res.json(rows);
};

// READ BY ID
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [rows]: any = await db.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );

  res.json(rows[0]);
};

// UPDATE
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password }: User = req.body;

    // verificar email duplicado
    const [rows]: any = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
  
    if (rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.execute(
    'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
    [name, email, hashedPassword, id]
  );

  res.json({ message: 'Usuário atualizado com sucesso' });
};

// PATCH
export const updatePatchUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email }: User = req.body;
  await db.execute(
    'UPDATE users SET name = ?, email = ? WHERE id = ?',
    [name, email, id]
  );

  res.json({ message: 'Usuário atualizado com sucesso' });
};

// DELETE
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [rows]: any = await db.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  )

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  await db.execute('DELETE FROM users WHERE id = ?', [id]);

  res.json({ message: 'Usuário removido com sucesso' });
};

import { Request, Response } from 'express';
import { db } from '../database/connection';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';
import { findUserByEmail, findUserById } from '../repositories/user.repository';

// CREATE
export const createUser = async (req: Request, res: Response) => {
  const { name, email, password }: User = req.body

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
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
  const [rows] = await db.execute('SELECT * FROM users WHERE deleted_at IS NULL');

  res.json(rows);
};

// READ BY ID
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [rows]: any = await db.execute(
    'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
    [id]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: 'Usuário não encontrado' });
  }

  res.json(rows[0]);
};

// UPDATE
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password }: User = req.body;

  const existingUser = await findUserByEmail(email);

  if (existingUser && existingUser.id !== Number(id)) {
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
  const { name, email, password }: User = req.body;

  const [rows]: any = await db.execute(
    "SELECT id FROM users WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  const fields: string[] = [];
  const values: any[] = [];

  if (name) {
    fields.push("name = ?");
    values.push(name);
  }

  if (email) {
    fields.push("email = ?");
    values.push(email);
  }

  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    fields.push("password = ?");
    values.push(hashed);
  }

  if (fields.length === 0) {
    return res.status(400).json({
      message: "Nenhum campo enviado para atualização",
    });
  }

  const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  await db.execute(query, [...values, id]);

  return res.status(200).json({
    message: "Usuário atualizado com sucesso",
  });
};

// SOFT DELETE
export const softDeleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await findUserById(id)

  if (!result) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  if (result.deleted_at) {
    return res.status(400).json({
      message: "Usuário já está deletado",
    });
  }

  await db.execute(
    "UPDATE users SET deleted_at = NOW() WHERE id = ?",
    [id]
  );

  return res.status(200).json({
    message: "Usuário deletado com sucesso (soft delete)",
  });
};

// DELETE
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [result]: any = await db.execute('DELETE FROM users WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  return res.json({ message: 'Usuário removido com sucesso' });
};

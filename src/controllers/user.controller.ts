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

  res.status(201).json({
    message: 'Usuário criado com sucesso',
    "user": {
      "name": name,
      "email": email
    }
  });
};

// READ ALL
export const getUsers = async (_: Request, res: Response) => {
  const [userRows] = await db.execute('SELECT * FROM users WHERE deleted_at IS NULL');

  res.json(userRows);
};

// READ BY ID
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await findUserById(id)

  if (!result || result.deleted_at) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  res.status(200).json(result);
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

  res.json({
    message: 'Usuário atualizado com sucesso',
    "user": {
      "id": id,
      "name": name,
      "email": email
    }
  });
};

// PATCH
export const updatePatchUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password }: User = req.body;
  const [userRow]: any = await db.execute(
    "SELECT id FROM users WHERE id = ?",
    [id]
  );

  if (userRow.length === 0) {
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

  // cria um objeto com os campos atualizados 
  const updatedFields = fields.map((field) => {
    return field.replace(" = ?", "")
  })

  return res.status(200).json({
    message: "Usuário atualizado com sucesso",
    "user": {
      "id": id,
      "updatedFields": updatedFields
    }
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
    "UPDATE users SET deleted_at = NOW(), status='inactive', refresh_token = NULL WHERE id = ?",
    [id]
  );

  return res.status(200).json({
    message: "Usuário desativado e sessão encerrada",
    "user": {
      "id": id
    }
  });
};

// RESTORE USER
export const restoreUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [result]: any = await db.execute(
    "UPDATE users SET deleted_at = NULL, status='active' WHERE id = ?",
    [id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  return res.json({
    message: "Usuário restaurado com sucesso",
    "user": {
      "id": id
    }
  });
};

// DELETE
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [result]: any = await db.execute('DELETE FROM users WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  return res.json({
    message: 'Usuário removido com sucesso',
    "user": {
      "id": id
    }
  });
};

// UPDATE STATUS
export const updateUserStatus = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const { status } = req.body;

  const [userRow]: any = await db.execute(
    `
    SELECT id, status
    FROM users
    WHERE id = ? AND deleted_at IS NULL
    `,
    [id]
  );

  if (userRow.length === 0) {
    return res.status(404).json({
      message: "Usuário não encontrado",
    });
  }

  if (userRow[0].status === status) {
    return res.status(400).json({
      message: "Usuário já está com esse status",
    });
  }

  await db.execute(
    "UPDATE users SET status = ? WHERE id = ?",
    [status, id]
  );

  if (status === "inactive") {
    await db.execute(
      "UPDATE users SET refresh_token = NULL WHERE id = ?",
      [id]
    );
  }

  return res.json({
    message: `Usuário ${status === "active" ? "ativado" : "inativado"} com sucesso`,
    "user": {
      "id": id,
      "status": status
    }
  });
};

export const updateUserRole = async (
  req: Request,
  res: Response
) => {
  const { role } = req.body;
  const targetUserId = Number(req.params.id);
  const loggedUserId = req.userId!;

  // Evita auto-alteração
  if (targetUserId === loggedUserId) {
    return res.status(403).json({
      message: "Você não pode alterar sua própria role",
    });
  }
  // Verifica se usuário existe
  const [userRow]: any = await db.execute(
    `
    SELECT id, role
    FROM users
    WHERE id = ? AND deleted_at IS NULL
    `,
    [targetUserId]
  );

  if (userRow.length === 0) {
    return res.status(404).json({
      message: "Usuário não encontrado",
    });
  }
  // Evita update desnecessário
  if (userRow[0].role === role) {
    return res.status(400).json({
      message: "Usuário já está com esse papel",
    });
  }
  // Atualiza role
  await db.execute(
    "UPDATE users SET role = ? WHERE id = ?",
    [role, targetUserId]
  );

  return res.json({
    message: `Papel do usuário atualizado para ${role} com sucesso`,
    "user": {
      "id": targetUserId,
      "role": role
    }
  });

}

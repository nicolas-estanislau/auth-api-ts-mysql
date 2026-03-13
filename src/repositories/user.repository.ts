import { db } from '../database/connection';

// prefixo a para indicar os argumentos

export const findUserByEmail = async (aEmail: string) => {
    const [userRow]: any = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [aEmail]
    );

    return userRow[0] || null;
};

export const findUserById = async (aId: string) => {
    const [userRow]: any = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [aId]
    )

    return userRow[0] || null;
}

// controller getUsers
export const getAllUsersRepository = async () => {
    const [userRows] = await db.execute('SELECT * FROM users WHERE deleted_at IS NULL');

    return userRows
}

// controller createUser
// argumentos: name, email, hashed password
export const createUserRepository = async (aName: string, aEmail: string, aHashedPassword: string) => {
    const newUser = await db.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [aName, aEmail, aHashedPassword]
      );
}

export const updateUserRepository = async (aName: string, aEmail: string, aHashedPassword: string, aId: string  ) => {
    const updateUser =   await db.execute(
        'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
        [aName, aEmail, aHashedPassword, aId]
      );
}

import { db } from '../database/connection';

export const findUserByEmail = async (email: string) => {
    const [userRow]: any = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );

    return userRow[0] || null;
};

export const findUserById = async (id: string) => {
    const [userRow]: any = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
    )

    return userRow[0] || null;
}
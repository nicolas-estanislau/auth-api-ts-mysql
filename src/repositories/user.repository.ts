import { db } from '../database/connection';

export const findUserByEmail = async (email: string) => {
    const [rows]: any = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );

    return rows[0] || null;
};

export const findUserById = async (id: string) => {
    const [rows]: any = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
    )

    return rows[0] || null;
}
import { Request, Response } from 'express';
import { db } from '../database/connection';
import { loginSchema } from '../schemas/auth.schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// LOGIN
export const login = async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);

        const [rows]: any = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [data.email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(
            data.password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({ token });

    } catch (error: any) {
        return res.status(400).json({ error: error.errors ?? 'Erro ao logar' });
    }
};
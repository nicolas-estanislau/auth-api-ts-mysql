import { Request, Response } from 'express';
import { db } from '../database/connection';
import { loginSchema } from '../schemas/auth.schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

const hashRefreshToken = (token: string) =>
    crypto.createHash('sha256').update(token).digest('hex');

// LOGIN
export const login = async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);

        const [rows]: any = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [data.email]
        );
        if (rows.length === 0 || rows[0].deleted_at) {
            return res.status(401).json({ error: 'Usuário não existe' });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(
            data.password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );


        const refreshTokenHash = hashRefreshToken(refreshToken);

        await db.execute(
            'UPDATE users SET refresh_token = ? WHERE id = ?',
            [refreshTokenHash, user.id]
        );
        return res.json({ token, refreshToken });

    } catch (error: any) {

        return res.status(400).json({ error: error.errors ?? 'Erro ao logar' });
    }
};

// REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token não informado' });
    }

    try {
        const payload = jwt.verify(
            refreshToken,
            REFRESH_TOKEN_SECRET
        ) as { id: number };

        const [rows]: any = await db.execute(
            'SELECT refresh_token FROM users WHERE id = ?',
            [payload.id]
        );

        const incomingHash = hashRefreshToken(refreshToken);

        if (rows[0].refresh_token !== incomingHash) {
            return res.status(403).json({ error: 'Refresh token inválido' });
        }

        const newAccessToken = jwt.sign(
            { id: payload.id },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        return res.json({ accessToken: newAccessToken });

    } catch {
        return res.status(403).json({ error: 'Refresh token expirado ou inválido' });
    }
};

// LOGOUT
export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        const incomingHash = hashRefreshToken(refreshToken);

        if (refreshToken) {
            await db.execute(
                'UPDATE users SET refresh_token = NULL WHERE refresh_token = ?',
                [incomingHash]
            );
        }
        return res.json({ message: 'Logout realizado com sucesso' });

    } catch {

        return res.json({ message: 'Logout realizado com sucesso' });
    }

};

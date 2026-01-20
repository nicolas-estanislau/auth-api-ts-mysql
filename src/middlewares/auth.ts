import { Request, Response, NextFunction } from 'express';
import { db } from '../database/connection';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface TokenPayload {
    id: number;
    email: string;
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        const [rows]: any = await db.execute(
            "SELECT id, deleted_at FROM users WHERE id = ?",
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Usuário não existe" });
        }

        if (rows[0].deleted_at) {
            return res.status(401).json({
                message: "Sessão inválida. Usuário desativado.",
            });
        }
        // manter esse user @types para implementar regras no role admin
        // user @types
        req.user = decoded;
        req.userId = decoded.id;

        next();

    } catch {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

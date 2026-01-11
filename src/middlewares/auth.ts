import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface TokenPayload {
    id: number;
    email: string;
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    // console.log("authHeader: ", authHeader)
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');
    // console.log("token: ", token)

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        // user @types
        // console.log("user: ", req.user)
        if (req.user) {
            req.user = decoded;
        }
        // console.log("user 1: ", req.user)
        // console.log("decoded: ", decoded)
        next();

    } catch {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

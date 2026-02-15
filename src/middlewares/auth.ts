import { Request, Response, NextFunction } from 'express';
import { db } from '../database/connection';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface TokenPayload {
    id: number;
    email: string;
    role: 'admin' | 'user' | 'moderator';
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

        const [userRow]: any = await db.execute(
            "SELECT id, deleted_at, status, role FROM users WHERE id = ?",
            [decoded.id]
        );

        if (userRow.length === 0) {
            return res.status(401).json({ message: "Usuário não existe" });
        }

        if (userRow[0].status !== "active") {
            return res.status(401).json({
                message: "Usuário inativo",
            });
        }

        if (userRow[0].deleted_at) {
            return res.status(401).json({
                message: "Sessão inválida. Usuário desativado.",
            });
        }

        // manter esse user @types para implementar regras no role admin
        // user @types
        req.user = decoded;
        next();

    } catch {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

export const adminMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // quem fez a requisição
    const user = req.user;
    
    if (!user) {
        return res.status(401).json({ message: "Usuário inválido" });
    }

    if (user.role !== "admin") {
        return res.status(403).json({
            message: "Acesso permitido apenas para administradores",
        });
    }

    next();
}

// O canAccessUser é para  Admin acessa qualquer usuário
// Usuário comum acessa apenas o próprio id
// Qualquer outra tentativa é bloqueada
// Por que isso é a melhor abordagem?
// Para segurança forte (auth + authorization)
// Controller sem regra de permissão (user.controller)
// Reutilizável em outras rotas ()
// Escala fácil (ex: admin, manager, support…)
export const canAccessUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
    }

    const loggedUser = req.user;
    const requestedUserId = Number(req.params.id);

    const isAdmin = loggedUser.role === 'admin';
    const isModerator = loggedUser.role === "moderator";
    const isOwner = loggedUser.id === requestedUserId;

    // se não for admin e não for owner e não for moderador
    // true ✅
    // se for admin e for owner e não for moderador
    // false ❌
    // se for admin e não for owner e não for moderador
    // false ❌
    // se não for admin e for onwer e não for moderador
    // false ❌
    // se não for admin e não for onwer e for moderador
    // false ❌
    // se não for admin for onwer e for moderador 
    // false ❌
    if (!isAdmin && !isOwner && !isModerator) {
        return res.status(403).json({ error: 'Acesso negado' });
    }

    next();
};


import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redisClient } from '../datasources/redis';
import { ForbiddenError, UnauthorizedError } from '../errors';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        const error = new UnauthorizedError()
        return res.status(error.statusCode).json(error);
    }

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        const tokens = await redisClient.sMembers(`tokens:${userId}`);
        if (!tokens.includes(token)) {
            return res.status(403).json(new ForbiddenError());
        }

        (req.headers as any).user = decoded;
        next();
    } catch (err) {
        return res.status(403).json(new ForbiddenError());
    }
};

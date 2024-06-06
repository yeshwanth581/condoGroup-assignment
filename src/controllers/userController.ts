import { NextFunction, Request, Response } from 'express';
import { login, registerNewUser } from '../services/authService';
import { UserAttributes } from '../models';

const JWT_SECRET = process.env.JWT_SECRET as string;
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const registeredUser: UserAttributes = await registerNewUser(username, password);
        res.status(201).json({ message: 'User registered successfully', userId: registeredUser.id })
    } catch (error: any) {
        res.status(error.statusCode).json(error)
    }
};


export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const token = await login(username, password)
        res.status(200).json({ token });
    } catch (error: any) {
        res.status(error.statusCode).json(error)
    }
}
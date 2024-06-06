import { tables } from "../datasources/initTables";
import { Models } from "../types/models";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { InternalServerError, ResourceConflictError, UnauthorizedError } from "../errors";
import logger from "../utils/logger";
import { redisClient } from "../datasources/redis";

const JWT_SECRET = process.env.JWT_SECRET as string

export const registerNewUser = async (username: string, password: string) => {
    const { usersTable }: Models = tables

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await usersTable.create({ username, password: hashedPassword });
        return user.toJSON();
    } catch (error: any) {
        let message = error?.errors[0]?.message || 'Something went wrong';
        const errorInfo = message.includes('must be unique') ? new ResourceConflictError(message) : new InternalServerError()
        logger.error('Error while registering user', { error: errorInfo })
        throw errorInfo
    }
}

export const login = async (username: string, password: string) => {
    try {
        const { usersTable }: Models = tables

        const loggedInUser = await usersTable.findOne({ where: { username } });
        const user = loggedInUser?.toJSON()

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedError()
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        await redisClient.sAdd(`tokens:${user.id}`, token);
        return token
    } catch (error) {
        logger.error('Error while trying to login', { error })
        throw new InternalServerError('Something went wrong while logging in')
    }
}
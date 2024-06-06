// src/tests/authService.test.ts

import { registerNewUser, login } from '../../src/services/authService';
import { tables } from '../../src/datasources/initTables';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { redisClient } from '../../src/datasources/redis';
import { InternalServerError, ResourceConflictError, UnauthorizedError } from '../../src/errors';

jest.mock('../../src/datasources/initTables', () => ({
    tables: {
        usersTable: {
            create: jest.fn().mockResolvedValue(true),
            findOne: jest.fn()
        }
    }
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

jest.mock('../../src/datasources/redis', () => ({
    redisClient: {
        sAdd: jest.fn(),
        sMembers: jest.fn()
    }
}));

describe('Auth Service', () => {
    const mockUsersTable = {
        create: jest.fn(),
        findOne: jest.fn()
    };

    beforeAll(() => {
        (tables as any).usersTable = mockUsersTable;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('registerNewUser', () => {
        it('should register a new user and return user data', async () => {
            const username = 'testuser';
            const password = 'testpassword';
            const hashedPassword = 'hashedpassword';
            const user = { id: 1, username, password: hashedPassword };

            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            mockUsersTable.create.mockResolvedValue({ toJSON: () => user });

            const result = await registerNewUser(username, password);

            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(mockUsersTable.create).toHaveBeenCalledWith({ username, password: hashedPassword });
            expect(result).toEqual(user);
        });

        it('should throw ResourceConflictError if username already exists', async () => {
            const username = 'testuser';
            const password = 'testpassword';
            const errorMessage = 'username must be unique';

            mockUsersTable.create.mockRejectedValue({ errors: [{ message: errorMessage }] });

            await expect(registerNewUser(username, password)).rejects.toThrow(ResourceConflictError);
        });

        it('should throw InternalServerError on unexpected error', async () => {
            const username = 'testuser';
            const password = 'testpassword';

            mockUsersTable.create.mockRejectedValue(new Error('Unexpected error'));

            await expect(registerNewUser(username, password)).rejects.toThrow(InternalServerError);
        });
    });

    describe('login', () => {
        it('should log in a user and return a JWT token', async () => {
            const username = 'testuser';
            const password = 'testpassword';
            const hashedPassword = 'hashedpassword';
            const user = { id: 1, username, password: hashedPassword };
            const token = 'jwtToken';

            mockUsersTable.findOne.mockResolvedValue({ toJSON: () => user });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue(token);
            (redisClient.sAdd as jest.Mock).mockResolvedValue(true);

            const result = await login(username, password);

            expect(mockUsersTable.findOne).toHaveBeenCalledWith({ where: { username } });
            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(jwt.sign).toHaveBeenCalledWith({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            expect(redisClient.sAdd).toHaveBeenCalledWith(`tokens:${user.id}`, token);
            expect(result).toEqual(token);
        });

        it('should throw UnauthorizedError if credentials are invalid', async () => {
            const username = 'testuser';
            const password = 'testpassword';

            mockUsersTable.findOne.mockResolvedValue(null);

            await expect(login(username, password)).rejects.toThrow(UnauthorizedError);
        });

        it('should throw InternalServerError on unexpected error', async () => {
            const username = 'testuser';
            const password = 'testpassword';

            mockUsersTable.findOne.mockRejectedValue(new Error('Unexpected error'));

            await expect(login(username, password)).rejects.toThrow(InternalServerError);
        });
    });
});

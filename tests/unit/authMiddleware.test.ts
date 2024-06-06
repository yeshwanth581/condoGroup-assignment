import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../src/middleware/auth';
import { redisClient } from '../../src/datasources/redis';
import { ForbiddenError, UnauthorizedError } from '../../src/errors';

jest.mock('jsonwebtoken');

const mockedJwt = jwt as jest.Mocked<typeof jwt>;

jest.mock('../../src/datasources/redis', () => ({
    redisClient: {
        sMembers: jest.fn().mockResolvedValue([])
    }
}));

describe('authenticateToken middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            headers: {} // Initialize headers as an empty object
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('should return 401 if no token is provided', async () => {
        await authenticateToken(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', async () => {
        req.headers!['authorization'] = 'Bearer invalidtoken';
        mockedJwt.verify.mockImplementation(() => {
            throw new Error();
        });

        await authenticateToken(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.any(ForbiddenError));
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if token is not in Redis', async () => {
        req.headers!['authorization'] = 'Bearer validtoken';
        mockedJwt.verify.mockImplementation(() => {
            return { userId: '1' };
        });

        await authenticateToken(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.any(ForbiddenError));
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next if token is valid and present in Redis', async () => {
        req.headers!['authorization'] = 'Bearer validtoken';
        mockedJwt.verify.mockImplementation(() => {
            return { userId: '1' };
        });
        (redisClient.sMembers as jest.Mock).mockResolvedValue(['validtoken']);

        await authenticateToken(req as Request, res as Response, next);

        expect(redisClient.sMembers).toHaveBeenCalledWith('tokens:1');
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

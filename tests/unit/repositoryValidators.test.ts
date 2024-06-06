import { Request, Response, NextFunction } from 'express';
import { candleStickReqValidator } from '../../src/validators';

describe('candleStickReqValidator', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('should call next() when request params are valid', () => {
        req.query = {
            startDate: '1717433110000',
            endDate: '1717523719000',
            symbol: 'AAPL',
        };

        candleStickReqValidator(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
    });

    it('should return 400 error when startDate or endDate is missing', () => {
        req.query = {
            symbol: 'AAPL',
        };

        candleStickReqValidator(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            name: 'INVALID_REQUEST',
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 error when startDate or endDate is invalid', () => {
        req.query = {
            startDate: 'invalid',
            endDate: '1717523719000',
            symbol: 'AAPL',
        };

        candleStickReqValidator(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            name: 'INVALID_REQUEST',
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 error when startDate is greater than endDate', () => {
        req.query = {
            startDate: '1717523719000',
            endDate: '1717433110000',
            symbol: 'AAPL',
        };

        candleStickReqValidator(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            name: 'INVALID_REQUEST',
        }));
        expect(next).not.toHaveBeenCalled();
    });
});

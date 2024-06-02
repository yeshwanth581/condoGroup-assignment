import { Request, Response, NextFunction } from 'express';
import { fetchAllReposParamsValidator, fetchRepoInfoParamsValidator } from '../../src/validators';

// Mocking the Request, Response, and NextFunction
const mockRequest = (query: any) => {
    return {
        query
    } as Request;
};

const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = () => jest.fn();

describe('validateQueryParams Middleware', () => {
    it('should call next() when the query parameters are valid', () => {
        const req = mockRequest({
            language: 'javascript',
            created: '2023-05-30',
            excludedScoreCriteria: 'stars,forks'
        });
        const res = mockResponse();
        const next = mockNext();

        fetchAllReposParamsValidator(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() when the query parameters are valid without excludedScoreCriteria', () => {
        const req = mockRequest({
            language: 'javascript',
            created: '2023-05-30',
        });
        const res = mockResponse();
        const next = mockNext();

        fetchAllReposParamsValidator(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return an error if language is missing', () => {
        const req = mockRequest({
            created: '2023-05-30',
            excludedScoreCriteria: 'stars,forks'
        });
        const res = mockResponse();
        const next = mockNext();

        fetchAllReposParamsValidator(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: '"language" is required'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should return an error if created date is invalid', () => {
        const req = mockRequest({
            language: 'javascript',
            created: '2023/05/30',
            excludedScoreCriteria: 'stars,forks'
        });
        const res = mockResponse();
        const next = mockNext();

        fetchAllReposParamsValidator(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 400,
            name: 'INVALID_REQUEST'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should return an error if excludedScoreCriteria has more than 2 values', () => {
        const req = mockRequest({
            language: 'javascript',
            created: '2023-05-30',
            excludedScoreCriteria: 'stars,forks,recency'
        });
        const res = mockResponse();
        const next = mockNext();

        fetchAllReposParamsValidator(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('At most two values are allowed')
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should return an error if excludedScoreCriteria contains invalid values', () => {
        const req = mockRequest({
            language: 'javascript',
            created: '2023-05-30',
            excludedScoreCriteria: 'stars,invalid'
        });
        const res = mockResponse();
        const next = mockNext();

        fetchAllReposParamsValidator(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('The valid values are stars,forks,recency. invalid is invalid')
        }));
        expect(next).not.toHaveBeenCalled();
    });


    it('should accept empty params for fetchRepoInfo schema', () => {
        const req = mockRequest({});
        const res = mockResponse();
        const next = mockNext();

        fetchRepoInfoParamsValidator(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should return an error if excludedScoreCriteria contains invalid values for fetchRepoInfo schema', () => {
        const req = mockRequest({
            excludedScoreCriteria: 'stars,invalid'
        });
        const res = mockResponse();
        const next = mockNext();

        fetchRepoInfoParamsValidator(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('The valid values are stars,forks,recency. invalid is invalid')
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should accept valud excludedScoreCriteria for fetchRepoInfo schema', () => {
        const req = mockRequest({
            excludedScoreCriteria: 'stars,recency'
        });
        const res = mockResponse();
        const next = mockNext();

        fetchRepoInfoParamsValidator(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should return an error if excludedScoreCriteria has more than 2 values for fetchRepoInfo schema', () => {
        const req = mockRequest({
            excludedScoreCriteria: 'stars,forks,recency'
        });
        const res = mockResponse();
        const next = mockNext();

        fetchRepoInfoParamsValidator(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('At most two values are allowed')
        }));
        expect(next).not.toHaveBeenCalled();
    });
});

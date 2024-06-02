import { Request } from 'express';
import { extractReqParams } from '../../src/utils/reqParamsExtractor';

describe('extractReqParams', () => {
    it('should extract query and path parameters from request', () => {
        const mockReq = {
            query: {
                param1: 'value1',
                param2: 'value2',
            },
            params: {
                param3: 'value3',
                param4: 'value4',
            },
        } as unknown as Request;

        const result = extractReqParams(mockReq);

        expect(result).toEqual({
            queryParams: {
                param1: 'value1',
                param2: 'value2',
            },
            pathParams: {
                param3: 'value3',
                param4: 'value4',
            },
        });
    });

    it('should handle empty query and path parameters', () => {
        const mockReq = {
            query: {},
            params: {},
        } as Request;

        const result = extractReqParams(mockReq);

        expect(result).toEqual({
            queryParams: {},
            pathParams: {},
        });
    });

    it('should handle undefined query and path parameters', () => {
        const mockReq = {
            query: {
                param1: undefined,
                param2: 'value2',
            },
            params: {
                param3: undefined,
                param4: 'value4',
            },
        } as unknown as Request;

        const result = extractReqParams(mockReq);

        expect(result).toEqual({
            queryParams: {
                param1: '',
                param2: 'value2',
            },
            pathParams: {
                param3: '',
                param4: 'value4',
            },
        });
    });

    it('should handle non-string query and path parameters', () => {
        const mockReq = {
            query: {
                param1: 123,
                param2: true,
            },
            params: {
                param3: null,
                param4: 'value4',
            },
        } as unknown as Request;

        const result = extractReqParams(mockReq);

        expect(result).toEqual({
            queryParams: {
                param1: '123',
                param2: 'true',
            },
            pathParams: {
                param3: '',
                param4: 'value4',
            },
        });
    });
});

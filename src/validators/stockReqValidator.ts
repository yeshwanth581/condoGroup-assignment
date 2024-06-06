import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { InvalidRequestError } from '../errors';
import { extractReqParams } from '../utils/reqParamsExtractor';

const isValidTimestamp = (value: number, helpers: Joi.CustomHelpers) => {
    if (isNaN(new Date(value).getTime())) {
        return helpers.error('any.invalid');
    }
    return value;
};

const getCandleStickDataReqParamsSchema = Joi.object({
    startDate: Joi.number().integer().required().custom(isValidTimestamp, 'timestamp_validation'),
    endDate: Joi.number().integer().required().custom(isValidTimestamp, 'timestamp_validation'),
    symbol: Joi.string().required(),
}).custom((value, helpers) => {
    const { startDate, endDate } = value;
    if (startDate >= endDate) {
        return helpers.error('any.invalid', { customMessage: 'startDate must be earlier than endDate' });
    }
    return value;
});;

export const candleStickReqValidator = (req: Request, res: Response, next: NextFunction) => {
    const { queryParams, pathParams } = extractReqParams(req)
    const { error: validationError } = getCandleStickDataReqParamsSchema.validate({ ...queryParams, ...pathParams }, { abortEarly: false });

    if (validationError) {
        const errorMessage = validationError.details.map(detail => detail.message).join()
        const customMessage = validationError.details.map(detail => detail.context?.customMessage).join()
        const error = new InvalidRequestError(customMessage || errorMessage)

        return res.status(error.statusCode).json(error)
    }
    next();
}


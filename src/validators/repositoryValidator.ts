import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { InvalidRequestError } from '../errors';

const customValidationForScoringCriteria = (value: string, helpers: Joi.CustomHelpers) => {
  const validKeys = ['stars', 'forks', 'recency'];
  const keys = value.split(',');

  if (keys.length > 2) {
    return helpers.error('any.custom', { customMessage: 'At most two values are allowed' });
  }

  for (const key of keys) {
    if (!validKeys.includes(key)) {
      return helpers.error('any.custom', { customMessage: `The valid values are ${validKeys}. ${key} is invalid` });
    }
  }

  return value;
}

const fetchAllReposParamsSchema = Joi.object({
  language: Joi.string().required(),
  created: Joi.string().regex(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])*$/).required(),
  limit: Joi.number().integer().optional(),
  page: Joi.number().integer().optional(),
  order: Joi.string().valid('asc', 'desc').optional(),
  sortBy: Joi.string().valid('stars', 'forks', 'updated').optional(),
  excludedScoreCriteria: Joi.string().custom(customValidationForScoringCriteria, 'custom validation').optional(),
});

const fetchRepoInfoParamsSchema = Joi.object({
  excludedScoreCriteria: Joi.string().custom(customValidationForScoringCriteria, 'custom validation').optional(),
});

export const fetchAllReposParamsValidator = (req: Request, res: Response, next: NextFunction) => {
  const { error: validationError } = fetchAllReposParamsSchema.validate(req.query, { abortEarly: false });

  if (validationError) {
    const errorMessage = validationError.details.map(detail => detail.message).join()
    const customMessage = validationError.details.map(detail => detail.context?.customMessage).join()
    const error = new InvalidRequestError(customMessage || errorMessage)

    return res.status(error.statusCode).json(error)
  }
  next();
};

export const fetchRepoInfoParamsValidator = (req: Request, res: Response, next: NextFunction) => {
  const { error: validationError } = fetchRepoInfoParamsSchema.validate(req.query, { abortEarly: false });

  if (validationError) {
    const errorMessage = validationError.details.map(detail => detail.message).join()
    const customMessage = validationError.details.map(detail => detail.context?.customMessage).join()
    const error = new InvalidRequestError(customMessage || errorMessage)

    return res.status(error.statusCode).json(error)
  }
  next();
};

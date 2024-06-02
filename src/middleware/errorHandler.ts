import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { InternalServerError, NotFoundError } from '../errors'
import { CORRELATION_ID_HEADER } from './correlationIdMiddleware';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, { correlationid: req.headers[CORRELATION_ID_HEADER] });
  const error: InternalServerError = new InternalServerError(err.message)
  res.status(error.statusCode).json(error);
};

export const notFoundErrorHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error: NotFoundError = new NotFoundError('Resource not found')
  logger.error(error.message, { correlationid: req.headers[CORRELATION_ID_HEADER] });
  res.status(error.statusCode).json(error);
  next()
};
import { Request, Response, NextFunction } from "express"
import { v4 as uuidv4 } from "uuid";

export const CORRELATION_ID_HEADER = 'x-correlation-id'

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const correlationId = req.headers[CORRELATION_ID_HEADER] || uuidv4();
    req.headers[CORRELATION_ID_HEADER] = correlationId
    res.setHeader(CORRELATION_ID_HEADER, correlationId)
    next()
}

import { NextFunction, Request, Response } from 'express';
import { extractReqParams } from '../utils/reqParamsExtractor';
import { getAndAggregatedCandleStickData } from '../services/stockService';

export const getCandleStickData = async (req: Request, res: Response, next: NextFunction) => {
    const { queryParams, pathParams } = extractReqParams(req)
    const { startDate, endDate } = queryParams;
    const { symbol } = pathParams

    try {
        const start = new Date(Number(startDate))
        const end = new Date(Number(endDate))

        const resp = await getAndAggregatedCandleStickData(symbol, start, end)
        res.status(200).json(resp);
    } catch (error) {
        res.status(500).json({ error });
    }
};


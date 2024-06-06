import { handleStockData, getAndAggregatedCandleStickData, CandleStick } from '../../src/services/stockService';
import { tables } from '../../src/datasources/initTables';
import { redisClient } from '../../src/datasources/redis';
import logger from '../../src/utils/logger';
import { NotFoundError } from '../../src/errors';

jest.mock('../../src/datasources/initTables');
jest.mock('../../src/utils/logger');

jest.mock('../../src/datasources/redis', () => ({
    redisClient: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(true),
    },
}));

describe('Stock Service', () => {
    const mockStocksTable = {
        findOrCreate: jest.fn(),
        findOne: jest.fn(),
    };
    const mockStockTradesTable = {
        findAll: jest.fn(),
        bulkCreate: jest.fn(),
    };

    beforeAll(() => {
        (tables as any).stocksTable = mockStocksTable;
        (tables as any).stockTradesTable = mockStockTradesTable;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('handleStockData', () => {
        it('should handle stock data and store in Redis and DB', async () => {
            const data = { s: 'AAPL', p: 150, v: 100, t: Date.now() };
            const stock = { id: 1, symbol: 'AAPL', name: 'AAPL', exchangeName: 'NASDAQ' };

            (redisClient.get as jest.Mock).mockResolvedValue(null);
            mockStocksTable.findOrCreate.mockResolvedValue([stock, true]);
            (redisClient.set as jest.Mock).mockResolvedValue('OK');

            await handleStockData(data);

            expect(redisClient.get).toHaveBeenCalledWith('AAPL');
            expect(mockStocksTable.findOrCreate).toHaveBeenCalledWith({
                where: { symbol: 'AAPL' },
                defaults: { symbol: 'AAPL', name: 'AAPL', exchangeName: 'NASDAQ' },
            });
            expect(redisClient.set).toHaveBeenCalledWith('AAPL', JSON.stringify(stock));
        });

        it('should add stock data to the in-memory array', async () => {
            const data = { s: 'AAPL', p: 150, v: 100, t: Date.now() };
            const stock = { id: 1, symbol: 'AAPL', name: 'AAPL', exchangeName: 'NASDAQ' };

            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(stock));

            await handleStockData(data);
        });

        it('should log and throw error on failure', async () => {
            const data = { s: 'AAPL', p: 150, v: 100, t: Date.now() };

            (redisClient.get as jest.Mock).mockRejectedValue(new Error('Redis error'));

            await expect(handleStockData(data)).rejects.toThrowError();
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('getAndAggregatedCandleStickData', () => {
        it('should return aggregated candlestick data', async () => {
            const symbol = 'AAPL';
            const start = new Date('2024-06-04T09:00:00Z');
            const end = new Date('2024-06-04T12:00:00Z');
            const stock = { id: 1, symbol: 'AAPL' };
            const stockTrades = [
                { toJSON: () => ({ price: 100, volume: 10, tradedAt: new Date('2024-06-04T10:30:00Z') }) },
                { toJSON: () => ({ price: 150, volume: 20, tradedAt: new Date('2024-06-04T10:45:00Z') }) },
                { toJSON: () => ({ price: 120, volume: 30, tradedAt: new Date('2024-06-04T11:15:00Z') }) },
                { toJSON: () => ({ price: 130, volume: 40, tradedAt: new Date('2024-06-04T11:30:00Z') }) },
            ];

            mockStockTradesTable.findAll.mockResolvedValue(stockTrades);
            mockStocksTable.findOne.mockResolvedValue(stock);
            mockStocksTable.findOne.mockResolvedValue({ toJSON: () => stock });

            const result = await getAndAggregatedCandleStickData(symbol, start, end);

            const expectedCandlesticks: CandleStick[] = [
                {
                    open: 100,
                    high: 150,
                    low: 100,
                    close: 150,
                    volume: 30,
                    startTime: new Date('2024-06-04T10:00:00Z'),
                },
                {
                    open: 120,
                    high: 130,
                    low: 120,
                    close: 130,
                    volume: 70,
                    startTime: new Date('2024-06-04T11:00:00Z'),
                },
            ];

            console.log(result)
            expect(result).toEqual(expectedCandlesticks);
        });

        it('should throw NotFoundError if stock symbol is not found', async () => {
            const symbol = 'AAPL';
            const start = new Date('2024-06-04T10:00:00Z');
            const end = new Date('2024-06-04T12:00:00Z');

            mockStocksTable.findOne.mockResolvedValue(null);

            await expect(getAndAggregatedCandleStickData(symbol, start, end)).rejects.toThrow(NotFoundError);
        });

        it('should log and throw error on failure', async () => {
            const symbol = 'AAPL';
            const start = new Date('2024-06-04T10:00:00Z');
            const end = new Date('2024-06-04T12:00:00Z');

            mockStocksTable.findOne.mockRejectedValue(new Error('DB error'));

            await expect(getAndAggregatedCandleStickData(symbol, start, end)).rejects.toThrowError();
            expect(logger.error).toHaveBeenCalled();
        });
    });

});

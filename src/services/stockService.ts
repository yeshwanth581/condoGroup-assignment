import { tables } from '../datasources/initTables'
import { redisClient } from '../datasources/redis';
import { Models } from '../types/models';
import { StockTradesCreationAttributes } from '../models'
import logger from '../utils/logger';
import { Op, Optional } from 'sequelize';
import { InternalServerError, NotFoundError } from '../errors';

interface StockMessageData {
    s: string;  // stock symbol
    p: number;  // price
    v: number;  // volume
    t: number;  // timestamp
}

const MAX_WAIT_TIME = 1000 * 60 * 10 // 10min
const MAX_BATCH_SIZE = 50

export interface CandleStick {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    startTime: Date;
}

const initTimeout = () => setTimeout(() => batchInsertStockTrades(), MAX_WAIT_TIME)
let timeout = initTimeout()
let stockTrades: Optional<StockTradesCreationAttributes, "id">[] = []

export const handleStockData = async (data: StockMessageData) => {
    const { stocksTable }: Models = tables
    const { s: symbol, p: price, v: volume, t: tradedAt } = data;

    try {
        let stock = await redisClient.get(symbol);

        if (!stock) {
            // Fetch or create the stock in the StockList table. This is the reason why I didn't used joins to fetch data directly by symbol
            // Also in order to update the symbol it would be enough to do in a single place.
            const [stockRecord] = await stocksTable.findOrCreate({
                where: { symbol },
                defaults: { symbol, name: symbol, exchangeName: 'NASDAQ' } // Assuming NASDAQ for simplicity
            });
            stock = JSON.stringify(stockRecord);
            await redisClient.set(symbol, stock);
        }

        const stockData = JSON.parse(stock);

        stockTrades.push({ stockId: stockData.id, price, volume, tradedAt: new Date(tradedAt) });
        (stockTrades.length === MAX_BATCH_SIZE) && await batchInsertStockTrades()
    } catch (error) {
        logger.error('Error saving stock data:', error);
        throw error
    }
};

export const getAndAggregatedCandleStickData = async (symbol: string, start: Date, end: Date) => {
    try {
        const { stocksTable, stockTradesTable }: Models = tables
        const stock = await stocksTable.findOne({ where: { symbol } });

        if (!stock) {
            throw new NotFoundError(`Stock with symbol ${symbol} not found`);
        }

        // it would be better 
        const stockTrades = await stockTradesTable.findAll({
            where: {
                stockId: stock.toJSON().id,
                tradedAt: {
                    [Op.between]: [start, end],
                },
            },
            order: [['tradedAt', 'ASC']],
        });

        const candlesticks: CandleStick[] = [];
        let currentCandle: CandleStick | null = null;
        let currentWindowStartTime = new Date(start);

        for (const stockTrade of stockTrades) {
            const trade = stockTrade.toJSON()
            const tradeTime = new Date(trade.tradedAt);

            // Check if the trade time exceeds the current window end time
            if (!currentCandle || tradeTime >= new Date(currentWindowStartTime.getTime() + 60 * 60 * 1000)) {
                if (currentCandle) {
                    candlesticks.push(currentCandle);
                }

                // Advance the window start time by 1 hour to include the current trade
                currentWindowStartTime = new Date(currentWindowStartTime.getTime() + 60 * 60 * 1000);
                while (tradeTime >= new Date(currentWindowStartTime.getTime() + 60 * 60 * 1000)) {
                    currentWindowStartTime = new Date(currentWindowStartTime.getTime() + 60 * 60 * 1000);
                }

                currentCandle = {
                    open: trade.price,
                    high: trade.price,
                    low: trade.price,
                    close: trade.price,
                    volume: trade.volume,
                    startTime: currentWindowStartTime,
                };
            } else {
                currentCandle.high = Math.max(currentCandle.high, trade.price);
                currentCandle.low = Math.min(currentCandle.low, trade.price);
                currentCandle.close = trade.price;
                currentCandle.volume += trade.volume;
            }
        }

        if (currentCandle) {
            candlesticks.push(currentCandle);
        }


        return candlesticks
    } catch (error: any) {
        logger.error('An error occurred while fetching candle stick data:', {
            payload: { error, symbol, start, end }
        });

        throw ((error?.statusCode === 404) ? error : new InternalServerError('Something went wrong'))
    }
}

const resetCheckpoints = () => {
    stockTrades = []
    clearTimeout(timeout)
    timeout = initTimeout()
}

const batchInsertStockTrades = async () => {
    const toBeInsertedData = [...stockTrades]
    resetCheckpoints();

    const { stockTradesTable } = tables
    try {
        await stockTradesTable.bulkCreate(toBeInsertedData);
    } catch (error) {
        logger.error('Error saving stock trades data:', { payload: { toBeInsertedData }, error });
        throw new InternalServerError('Error while bulk inserting data')
    }
}

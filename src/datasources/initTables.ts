import logger from '../utils/logger';
import { createStockTradesModel, createStocksModel, createUserModel } from '../models';
import { db } from './db';
import { Models } from '../types/models';

let stocksTable = createStocksModel(db);
let stockTradesTable = createStockTradesModel(db, createStocksModel);
let usersTable = createUserModel(db)

export const tables: Models = { stockTradesTable, stocksTable, usersTable }

const initAndSyncTables = async () => {
    try {
        await stocksTable.sync();// create and sync stocks table
        await stockTradesTable.sync(); // create and sync stockTrades table. Connects to stocks table via foreign ref key
        await usersTable.sync();
    } catch (error) {
        logger.error('Error while syncing tables models', error)
        process.exit(1);
    }
}

export default initAndSyncTables
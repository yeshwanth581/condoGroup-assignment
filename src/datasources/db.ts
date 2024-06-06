import { Sequelize } from 'sequelize';
import logger from '../utils/logger';

const dbName: string = process.env.DB_NAME || ''
const dbUser: string = process.env.DB_USER || ''
const dbPassword: string = process.env.DB_PASSWORD || ''
const dbPort: number = Number(process.env.DB_PORT || '5432')
const dbHost: string = process.env.DB_HOST || 'postgres'

const db: Sequelize = new Sequelize(
    dbName, dbUser, dbPassword,
    {
        host: dbHost,
        port: dbPort,
        dialect: 'postgres',
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
    }
);

const initializeDatabase = async () => {
    try {
        await db.authenticate();
        logger.info('Connection has been established successfully.');
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        await closeDatabaseConnection();
        process.exit(1); // Exit the process with failure code
    }
};

const closeDatabaseConnection = async () => {
    try {
        await db.close();
        logger.info('Database connection closed successfully.');
    } catch (error) {
        logger.error('Error closing the database connection:', error);
    }
};

export { db, initializeDatabase, closeDatabaseConnection };

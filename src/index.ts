// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './utils/logger';

import { initializeDatabase, closeDatabaseConnection } from './datasources/db';
import { connectRedis, closeRedisConnection } from './datasources/redis'
import { IncomingMessage, Server, ServerResponse } from 'http';
import initAndSyncTables from './datasources/initTables';
import { connectWebSocket } from './datasources/finnhubWebSocket';

const PORT = process.env.PORT || 3000;
let server: Server<typeof IncomingMessage, typeof ServerResponse>

// Event listener for HTTP server "error" event.
const onError = (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

    // Handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            logger.error(`${bind} requires elevated privileges`, { code: error.code });
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(`${bind} is already in use`, { code: error.code });
            process.exit(1);
            break;
        default:
            logger.error('Unexpected error while starting the server', { payload: error });
            throw error;
    }
}

const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    await closeDatabaseConnection();
    await closeRedisConnection();

    server.close(() => {
        logger.info('Closed out remaining connections.');
        process.exit(0);
    });

    // Force shutdown if connections are still open after 10 seconds
    setTimeout(() => {
        logger.error('Could not close connections in time, forcing shutdown');
        process.exit(1);
    }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception error', { error: error.message, stack: error.stack })
});

// Start the server and handle errors
const startApp = async () => {
    await initializeDatabase();
    await initAndSyncTables();
    await connectRedis();
    connectWebSocket();
    server = app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    server.on('error', onError);
}

startApp();
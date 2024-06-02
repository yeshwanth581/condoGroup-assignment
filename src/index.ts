// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './utils/logger';
import { closeCacheDB } from './providers/cacheProvider';

const PORT = process.env.PORT || 3000;

// Start the server and handle errors
const server = app.listen(PORT, onListening);
server.on('error', onError);

// Event listener for HTTP server "listening" event.
function onListening() {
    logger.info(`Listening on port ${PORT}`);
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception error', { error: error.message, stack: error.stack })
});

// Event listener for HTTP server "error" event.
function onError(error: NodeJS.ErrnoException) {
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

async function gracefulShutdown(signal: string) {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    await closeCacheDB()

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

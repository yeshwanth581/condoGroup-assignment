import logger from '../utils/logger';
import { closeDatabaseConnection } from './db';
import { handleStockData } from '../services/stockService';

const FINNHUB_API_KEY = process.env.FINHUB_API_KEY as string;
let ws: WebSocket

const connectWebSocket = () => {
    ws = new WebSocket(
        `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`,
    );

    ws.addEventListener("open", function (event) {
        ws.send(JSON.stringify({ type: "subscribe", symbol: "AAPL" }));
    });

    // Listen for messages
    ws.addEventListener("message", async function (event: MessageEvent) {
        const message = JSON.parse(event.data.toString());
        if (message.type === 'trade') {
            await handleStockData(message.data[0]);
        }
    });

    ws.addEventListener('error', async (error) => {
        logger.error('WebSocket error:', error);
        await closeDatabaseConnection();
        process.exit(1); // Exit the process with failure code
    });

    ws.addEventListener('close', async () => {
        logger.info('WebSocket connection closed');
        // Reconnect after a delay
        setTimeout(() => connectWebSocket(), 10000);
    });
};

const closeWebSocketConnection = () => {
    if (ws) {
        ws.close();
        logger.info('WebSocket connection closed.');
    }
};

export { connectWebSocket, closeWebSocketConnection };

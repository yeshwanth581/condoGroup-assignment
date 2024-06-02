import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import router from './routes/index';
import { errorHandler, notFoundErrorHandler, correlationIdMiddleware } from './middleware';

const app = express();

app.use(express.json());
app.use(correlationIdMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());
app.use(cors());

app.use('/api/v1', router);

app.use(errorHandler);
app.use(notFoundErrorHandler)

export default app;

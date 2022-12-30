import { config } from 'dotenv';

import { Response } from 'express';
import * as express from 'express';

import * as https from 'https';
import * as fs from 'fs';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';

import * as db from './lib/db';
import { logInfo, initLogger, LogLevel } from './lib/logger';

import authRouter from './routes/auth';
import mapRouter from './routes/maps';
import replayRouter from './routes/replays';
import authorizeRouter from './routes/authorize';
import logoutRouter from './routes/logout';
import meRouter from './routes/me';
import userRouter from './routes/users';

import authMiddleware from './middleware/auth';
import setupLoggerMiddleware from './middleware/setupLogger';
import reqResLoggerMiddleware from './middleware/reqResLogger';
import globalErrorHandler from './middleware/globalErrorHandler';
import corsConfig from './lib/cors';

config();

// Initialize the logger with the provided level first
initLogger(process.env.LOG_LEVEL || LogLevel.debug);

// Setup Express App
const app = express();

// Cross-origin resource sharing (CORS) middleware
app.use(cors(corsConfig));

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cookie Parser middleware
app.use(cookieParser());

// Response compression (using fastest compression preset)
app.use(compression({ level: 1 }));

// Initialize DB connection
db.initDB();

// App Middleware
app.use(setupLoggerMiddleware);
app.use(authMiddleware);
app.use(reqResLoggerMiddleware);

// Set up app routes
app.use('/auth', authRouter);
app.use('/authorize', authorizeRouter);
app.use('/logout', logoutRouter);
app.use('/maps', mapRouter);
app.use('/users', userRouter);
app.use('/me', meRouter);
app.use('/replays', replayRouter);

// Ping route for response time
app.use('/ping', (_, res: Response) => res.status(200).send('pong'));

// Global error handler middleware
app.use(globalErrorHandler);

// Start server for HTTP or HTTPS
if (process.env.USE_CERTIFICATES === 'true') {
    https
        .createServer(
            {
                key: fs.readFileSync('./key.pem'),
                cert: fs.readFileSync('./cert.pem'),
            },
            app,
        )
        .listen(Number(process.env.HTTPS_PORT) || 443);
}

const defaultPort = Number(process.env.HTTP_PORT) || 80;
app.listen(defaultPort, () => {
    logInfo(`App listening on port ${defaultPort}`);
});

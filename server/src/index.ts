import { config } from 'dotenv';

import { Request, Response } from 'express';
import * as express from 'express';

import * as https from 'https';
import * as fs from 'fs';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';

import * as promBundle from 'express-prom-bundle';
import * as basicAuth from 'express-basic-auth';
import * as db from './lib/db';
import { logError, logInfo, initLogger } from './lib/logger';

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

config();

// initialize the logger with the provided level first
initLogger(process.env.LOG_LEVEL);

const app = express();
app.use(
    cors({
        origin: [
            'http://localhost:4200', // local UI dev environment
            'http://localhost:3000', // local UI dev environment
            'https://tmdojo.com', // live UI
            /https:\/\/tm-dojo-.*\.vercel\.app/, // Vercel preview environments
        ],
        credentials: true,
    }),
);

// Prometheus metrics
if (process.env.PROMETHEUS_PASSWORD) {
    app.use('/metrics', basicAuth({ users: { admin: process.env.PROMETHEUS_PASSWORD } }));
}
app.use(promBundle({
    includeMethod: true,
    includePath: true,
    buckets: [0.01, 0.025, 0.05, 0.075, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2.5, 5, 7.5, 10],
    urlValueParser: {
        extraMasks: [
            /[0-9,a-z,A-Z,_]{24,28}/, // Map UID (ranges from 25-27 in practice, add 1 shorter and longer just in case)
        ],
    },
}));

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cookie Parser middleware
app.use(cookieParser());

// Response compression (using fastest compression preset)
app.use(compression({ level: 1 }));

// initialize DB connection
db.initDB();

// global error handler (requires 'next' even if it's not used)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: Function) => {
    logError(err.stack);
    res.status(500).send('Internal server error');
});

// App Middleware
app.use(setupLoggerMiddleware);
app.use(authMiddleware);
app.use(reqResLoggerMiddleware);

// set up routes
app.use('/auth', authRouter);
app.use('/authorize', authorizeRouter);
app.use('/logout', logoutRouter);
app.use('/maps', mapRouter);
app.use('/users', userRouter);
app.use('/me', meRouter);
app.use('/replays', replayRouter);

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

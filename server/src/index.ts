import { config } from 'dotenv';

import { Request, Response } from 'express';
import * as express from 'express';
import * as http from 'http';

import * as https from 'https';
import * as fs from 'fs';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

import * as dayjs from 'dayjs';
import * as db from './lib/db';

import authRouter from './routes/auth';
import mapRouter from './routes/maps';
import replayRouter from './routes/replays';
import authorizeRouter from './routes/authorize';
import logoutRouter from './routes/logout';
import meRouter from './routes/me';
import userRouter from './routes/users';

import authMiddleware from './middleware/auth';
import setupWebSocketServer from './lib/websocket';

config();

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

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cookie Parser middleware
app.use(cookieParser());

// initialize DB connection
db.initDB();

// request and response logger
app.use((req: Request, res: Response, next: Function) => {
    const getDateStr = () => dayjs().format('DD/MM/YYYY, HH:mm:ss.SSS');
    console.log(`[${getDateStr()}] REQ: ${req.method} ${req.originalUrl}`);

    // override end() for logging
    const oldEnd = res.end;
    res.end = (data: any) => {
    // data contains the response body
        console.log(`[${getDateStr()}] RES: ${req.method} ${req.originalUrl} - ${res.statusCode}`);
        oldEnd.apply(res, [data]);
    };

    next();
});

// global error handler (requires 'next' even if it's not used)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).send('Internal server error');
});

// App middleware
app.use(authMiddleware);

// set up routes
app.use('/auth', authRouter);
app.use('/authorize', authorizeRouter);
app.use('/logout', logoutRouter);
app.use('/maps', mapRouter);
app.use('/users', userRouter);
app.use('/me', meRouter);
app.use('/replays', replayRouter);

const server = http.createServer(app);

// initialize the WebSocket server instance
setupWebSocketServer(server);

server.listen(defaultPort, () => {
    console.log(`App listening on port ${defaultPort}`);
});

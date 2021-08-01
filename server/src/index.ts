import { config } from 'dotenv';

import { Request, Response } from 'express';
import * as express from 'express';

import * as https from 'https';
import * as fs from 'fs';
import * as cors from 'cors';

import * as db from './lib/db';

import authRouter from './routes/auth';
import mapRouter from './routes/maps';
import replayRouter from './routes/replays';

config();

// ensure storage directories exist
if (!fs.existsSync('maps')) {
    fs.mkdirSync('maps');
}
if (!fs.existsSync('mapBlocks')) {
    fs.mkdirSync('mapBlocks');
}

const app = express();
app.use(
    cors({
        origin: [
            'http://localhost:4200', // local UI dev environment
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
app.listen(defaultPort, () => {
    console.log(`App listening on port ${defaultPort}`);
});

// initialize DB connection
db.initDB();

// request and response logger
app.use((req: Request, res: Response, next: Function) => {
    console.log(`REQ: ${req.method} ${req.originalUrl}`);

    // override end() for logging
    const oldEnd = res.end;
    res.end = (data : any) => {
    // data contains the response body
        console.log(`RES: ${req.method} ${req.originalUrl} - ${res.statusCode}`);
        oldEnd.apply(res, [data]);
    };

    next();
});

// global error handler (requires 'next' even if it's not used)
// eslint-disable-next-line no-unused-vars
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).send('Internal server error');
});

// set up routes
app.use('/auth', authRouter);
app.use('/maps', mapRouter);
app.use('/replays', replayRouter);

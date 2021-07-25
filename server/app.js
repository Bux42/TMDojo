require('dotenv').config();

const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./lib/db');

const authRouter = require('./routes/auth');
const authorizeRouter = require('./routes/authorize');
const mapRouter = require('./routes/maps');
const replayRouter = require('./routes/replays');

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
        .listen(443);
}

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const defaultPort = 80;
app.listen(defaultPort, () => {
    console.log(`App listening on port ${defaultPort}`);
});

// initialize DB connection
db.initDB();

// request and response logger
app.use((req, res, next) => {
    console.log(`REQ: ${req.method} ${req.originalUrl}`);

    // override end() for logging
    const oldEnd = res.end;
    res.end = (data) => {
    // data contains the response body
        console.log(`RES: ${req.method} ${req.originalUrl} - ${res.statusCode}`);
        oldEnd.apply(res, [data]);
    };

    next();
});

// global error handler (requires 'next' even if it's not used)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal server error');
});

// set up routes
app.use('/auth', authRouter);
app.use('/authorize', authorizeRouter);
app.use('/maps', mapRouter);
app.use('/replays', replayRouter);

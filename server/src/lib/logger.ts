import { Request } from 'express';
import * as dayjs from 'dayjs';
import { createLogger, format, transports } from 'winston';

const logLevels = {
    info: 'info',
    warn: 'warn',
    error: 'error',
    debug: 'debug',
};

interface LogFormat {
    level: string;
    message: string;
    timestamp: string;
}

const logFormat = format.printf(
    ({ level, message, timestamp }: LogFormat) => {
        const formattedTime = dayjs(timestamp).format('DD/MM/YYYY HH:mm:ss.SSS');
        return `${formattedTime} ${level.toUpperCase()} ${message}`;
    },
);

const logger = createLogger({
    level: logLevels.debug,
    format: format.combine(
        format.timestamp(),
        logFormat,
    ),
    transports: [
        new transports.Console(),
    ],
});

// main logger utility
const log = (message: string|object, level: string, req?: Request) => {
    let logMessage = '';

    // add request elements
    if (req) {
        let reqMessage = '';
        if (req.requestId) {
            reqMessage = `[${req.requestId}] `;
        }
        if (req.user) {
            reqMessage += `${req.user.playerName}/${req.user.webId} `;
        }
        logMessage += reqMessage;
    }

    if (typeof message === 'string') {
        logMessage += `- ${message}`;
    } else {
        // object logging requires stringifying which may be slow and can fail
        try {
            logMessage += `- ${JSON.stringify(message, null, 4)}`;
        } catch (error) {
            // just log the object normally and let console.log handle the formatting
            // eslint-disable-next-line no-console -- special back-up case for logger
            return console.log(message);
        }
    }

    if (level === logLevels.error) {
        return logger.error(logMessage);
    }
    if (level === logLevels.warn) {
        return logger.warn(logMessage);
    }
    if (level === logLevels.debug) {
        return logger.debug(logMessage);
    }
    return logger.info(logMessage);
};

// global log helpers for when there is no request object available
export const logInfo = (message: string|object) => log(message, logLevels.info);
export const logWarn = (message: string|object) => log(message, logLevels.warn);
export const logError = (message: string|object) => log(message, logLevels.error);
export const logDebug = (message: string|object) => log(message, logLevels.debug);

// helper function to assign logger to request object
export const getRequestLogger = (req: Request) => ({
    info: (message: string|object) => log(message, logLevels.info, req),
    warn: (message: string|object) => log(message, logLevels.warn, req),
    error: (message: string|object) => log(message, logLevels.error, req),
    debug: (message: string|object) => log(message, logLevels.debug, req),
});

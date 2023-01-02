import { Request } from 'express';
import * as dayjs from 'dayjs';
import {
    createLogger, format, transports, Logger,
} from 'winston';

export enum LogLevel {
    info = 'info',
    warn = 'warn',
    error = 'error',
    debug = 'debug',
}

const logFormat = format.printf(
    ({ level, message, timestamp }) => {
        const formattedTime = dayjs(timestamp).format('DD/MM/YYYY HH:mm:ss.SSS');
        return `${formattedTime} ${level.toUpperCase()} ${message}`;
    },
);

// logger gets configured at startup in initLogger
let logger: Logger;

// main logger utility
const log = (message: string | object, level: LogLevel, req?: Request) => {
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

    if (level === LogLevel.error) {
        return logger.error(logMessage);
    }
    if (level === LogLevel.warn) {
        return logger.warn(logMessage);
    }
    if (level === LogLevel.debug) {
        return logger.debug(logMessage);
    }
    return logger.info(logMessage);
};

// global log helpers for when there is no request object available
export const logInfo = (message: string | object) => log(message, LogLevel.info);
export const logWarn = (message: string | object) => log(message, LogLevel.warn);
export const logError = (message: string | object) => log(message, LogLevel.error);
export const logDebug = (message: string | object) => log(message, LogLevel.debug);

// helper function to assign logger to request object
export const getRequestLogger = (req: Request) => ({
    info: (message: string | object) => log(message, LogLevel.info, req),
    warn: (message: string | object) => log(message, LogLevel.warn, req),
    error: (message: string | object) => log(message, LogLevel.error, req),
    debug: (message: string | object) => log(message, LogLevel.debug, req),
});

export const initLogger = (logLevel: string) => {
    let defaultLogLevel = logLevel;
    if (!Object.values(LogLevel).includes(defaultLogLevel as LogLevel)) {
        // default level is debug if not overridden by another valid level
        defaultLogLevel = LogLevel.debug;
    }

    logger = createLogger({
        level: defaultLogLevel,
        format: format.combine(
            format.timestamp(),
            logFormat,
        ),
        transports: [
            new transports.Console(),
        ],
    });

    logInfo(`Logger initialized with level "${defaultLogLevel}"`);
};

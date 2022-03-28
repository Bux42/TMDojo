import { Request, Response } from 'express';

/**
 * Logs request and response information.
 */
const reqResLoggerMiddleware = async (req: Request, res: Response, next: Function) => {
    req.log.info(`REQUEST: ${req.method} ${req.originalUrl}`);

    // override end() for logging
    const oldEnd = res.end;
    res.end = (data: any) => {
        // data contains the response body
        req.log.info(`RESPONSE: ${req.method} ${req.originalUrl} - ${res.statusCode}`);
        oldEnd.apply(res, [data]);
    };

    return next();
};

export default reqResLoggerMiddleware;

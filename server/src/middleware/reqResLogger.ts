import { Request, Response } from 'express';

/**
 * Logs request and response information.
 */
const reqResLoggerMiddleware = async (req: Request, res: Response, next: Function) => {
    // Plugin version as string: ' (plugin v0.0.1)' or '' if not defined
    const pluginVersionStr = req.query.pluginVersion ? ` (plugin v${req.query.pluginVersion})` : '';

    req.log.info(`REQUEST${pluginVersionStr}: ${req.method} ${req.originalUrl}`);

    // override end() for logging
    const oldEnd = res.end;
    res.end = (data: any) => {
        // data contains the response body
        req.log.info(`RESPONSE${pluginVersionStr}: ${req.method} ${req.originalUrl} - ${res.statusCode}`);
        oldEnd.apply(res, [data]);
    };

    return next();
};

export default reqResLoggerMiddleware;

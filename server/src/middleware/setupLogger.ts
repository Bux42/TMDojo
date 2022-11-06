import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getRequestLogger } from '../lib/logger';

/**
 * Assigns the logger and request ID to the incoming request.
 */
const setupLoggerMiddleware = async (req: Request, res: Response, next: Function) => {
    req.log = getRequestLogger(req);
    req.requestId = uuid();
    return next();
};

export default setupLoggerMiddleware;

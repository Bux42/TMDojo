import { Request, Response } from 'express';
import { HttpError } from '../lib/httpErrors';

// Global error handler (requires 'next' even if it's not used)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler = (err: Error, req: Request, res: Response, next: Function) => {
    if (err instanceof HttpError) {
        const errorResponseBody = err.responseBody();
        req.log.error(`Global error handler: Received HTTP Error "${err.statusName}" (${err.status})`);
        req.log.error(`Global error handler: Sending response: ${JSON.stringify(errorResponseBody)}`);
        res.status(err.status).send(errorResponseBody);
        return;
    }

    req.log.error(err.stack);
    res.status(500).send({ status: 500, message: 'Internal server error' });
};

export default globalErrorHandler;

import { Injectable, NestMiddleware } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';
import { MyLogger } from '../logger/my-logger.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    constructor(
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext('HTTP');
    }

    use(request: Request, response: Response, next: NextFunction): void {
        const {
            method, originalUrl: url, body, query,
        } = request;

        const reqInfo = `${method} ${url}`;
        let reqBody = '';
        if (query && Object.keys(query).length > 0) {
            reqBody += `\n${JSON.stringify({ query }, null, 2)}`;
        }
        if (body && Object.keys(body).length > 0) {
            reqBody += `\n${JSON.stringify({ body }, null, 2)}`;
        }

        const reqMsg = reqInfo + reqBody;

        this.logger.log(`Req: ${reqMsg}`);

        response.on('close', () => {
            const { statusCode } = response;
            const responseContentLength = response.get('content-length');
            const contentLength = responseContentLength ? parseInt(responseContentLength, 10) : 0;
            // const contentLengthKb = (contentLength / 1024).toFixed(1);

            const resInfo = `Res: [${statusCode}] ${contentLength} bytes`;

            const resMsg = resInfo;

            this.logger.log(resMsg);
        });

        next();
    }
}

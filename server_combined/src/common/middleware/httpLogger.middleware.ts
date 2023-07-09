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
            ip, method, originalUrl: url, body, query,
        } = request;
        const userAgent = request.get('user-agent') || '';

        const reqInfo = `${method} ${url} - ${userAgent} ${ip}`;
        let reqBody = '';
        if (query && Object.keys(query).length > 0) {
            reqBody += `\n${JSON.stringify({ query }, null, 2)}`;
        }
        if (body && Object.keys(body).length > 0) {
            reqBody += `\n${JSON.stringify({ body }, null, 2)}`;
        }

        const reqMsg = reqInfo + reqBody;

        this.logger.log(`REQ: ${reqMsg}`);

        response.on('close', () => {
            const { statusCode } = response;
            const contentLength = parseInt(response.get('content-length'), 10);
            // const contentLengthKb = (contentLength / 1024).toFixed(1);

            const resInfo = `RES: [${statusCode}] ${contentLength} bytes`;

            const resMsg = resInfo;

            this.logger.log(resMsg);
        });

        next();
    }
}

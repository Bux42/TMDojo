import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MyLogger } from '../logger/my-logger.service';

declare global {
    namespace Express {
        interface Request {
            requestId: string | undefined;
        }
    }
}

@Injectable()
export class SetRequestIdMiddleware implements NestMiddleware {
    constructor(
        private readonly logger: MyLogger,
    ) { }

    use(request: Request, _: Response, next: NextFunction): void {
        request.requestId = uuidv4();
        this.logger.setRequestId(request.requestId);
        next();
    }
}

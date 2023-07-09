import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
    namespace Express {
        interface Request {
            requestId: string | undefined;
        }
    }
}

@Injectable()
export class SetRequestIdMiddleware implements NestMiddleware {
    use(request: Request, _: Response, next: NextFunction): void {
        request.requestId = uuidv4();
        next();
    }
}

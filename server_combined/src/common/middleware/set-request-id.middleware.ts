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
        request.requestId = this.generateRequestId();
        this.logger.setRequestId(request.requestId);
        next();
    }

    private generateRequestId(): string {
        const uuid = uuidv4();
        const hexString = uuid.replace(/-/g, ''); // Remove '-' from uuid to keep only hex chars
        const base64String = Buffer.from(hexString, 'hex')
            .toString('base64') // Convert to base64
            .replaceAll('=', ''); // Remove padding chars
        return base64String;
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line import/no-unresolved
import { Express } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
    interface Request {
        rawBody?: string,
        secure: boolean,
        // any | undefined seems unintuitive, but any will change into the actual type of user
        user: any | undefined
    }

    interface IncomingMessage {
        rawBody?: string,
        originalUrl: string
    }

    interface Response {
    }
}

declare global {
    namespace Express {
        interface Request {
            log: {
                info: (message: string|object) => void,
                warn: (message: string|object) => void,
                error: (message: string|object) => void,
                debug: (message: string|object) => void
            }
            requestId: string,
        }
    }
}

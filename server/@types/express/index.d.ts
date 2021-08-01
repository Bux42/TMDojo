/* eslint-disable no-unused-vars */
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

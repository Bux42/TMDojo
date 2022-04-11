/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { RequestLogger } from '../../src/lib/logger';

export const voidLogger: RequestLogger = {
    info: (message: string|object) => {},
    warn: (message: string|object) => {},
    error: (message: string|object) => {},
    debug: (message: string|object) => {},
};

export const consoleLogger: RequestLogger = {
    info: (message: string|object) => console.log(message),
    warn: (message: string|object) => console.log(message),
    error: (message: string|object) => console.log(message),
    debug: (message: string|object) => console.log(message),
};

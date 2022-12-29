// Based on https://github.com/blakeembrey/async-middleware/blob/master/src/index.ts
// Simplified by removing support for wrapping error handlers

export interface NextFunction {
    (err?: Error): void
}

export interface Handler <Req, Res> {
    (req: Req, res: Res, next: NextFunction): any
}

function isPromise <T>(v: T | Promise<T>): v is Promise<T> {
    return typeof v === 'object' && typeof (v as Promise<T>).then === 'function';
}

const handle = <T>(result: Promise<T> | T, next: NextFunction): T | Promise<T | void> => {
    if (isPromise(result)) {
        return result.then().catch(next);
    }

    return result;
};

export function wrap <Req, Res>(fn: Handler<Req, Res>): Handler<Req, Res> {
    return (req: Req, res: Res, next: NextFunction) => handle((fn as Handler<Req, Res>)(req, res, next), next);
}

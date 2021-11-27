import { Request, Response } from 'express';
import * as db from '../lib/db';

/**
 * Ensures upcoming request handlers have a database connection.
 * Main use is to have a database connection when using serverless lambda functions.
 */
const ensureDbConnection = async (req: Request, res: Response, next: Function) => {
    if (!db.isConnected()) {
        console.log('[Middleware] Connecting to database...');
        try {
            await db.initDB();
            next();
        } catch (e: any) {
            next(e);
        }
    } else {
        console.log('[Middleware] Database connection already established.');
        next();
    }
};

export default ensureDbConnection;

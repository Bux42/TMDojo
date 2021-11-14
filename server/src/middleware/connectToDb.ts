import { Request, Response } from 'express';
import * as db from '../lib/db';

/**
 * Initializes database connection if not done yet.
 * Main use is to have a database connection when using serverless lambda functions.
 */
const connectToDbMiddleware = async (req: Request, res: Response, next: Function) => {
    if (!db.isConnected()) {
        try {
            await db.initDB();
        } catch (e: any) {
            res.status(503).json({ message: 'Failed to connect to database.' });
        }
    }
    return next();
};

export default connectToDbMiddleware;

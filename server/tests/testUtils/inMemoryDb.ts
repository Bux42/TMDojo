import { MongoMemoryServer } from 'mongodb-memory-server';
import * as db from '../../src/lib/db';

export const initInMemoryDb = async (): Promise<MongoMemoryServer> => {
    const server = await MongoMemoryServer.create();
    const url = await server.getUri();
    await db.initDB(url);
    return server;
};

export const stopInMemoryDb = async (server: MongoMemoryServer) => {
    await server.stop();
};

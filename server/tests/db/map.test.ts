import {
    afterEach, beforeAll, beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import axios from 'axios';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as db from '../../src/lib/db';
import { initInMemoryDb, stopInMemoryDb } from '../testUtils/inMemoryDb';
import tmioSummer202101Data from '../testUtils/tmioData';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DB Map Methods', () => {
    let server: MongoMemoryServer | undefined;

    beforeAll(() => {
        // TODO: properly mock only the tm.io fetches, this will mock every single axios request
        mockedAxios.get.mockResolvedValue({ data: tmioSummer202101Data });
    });

    beforeEach(async () => {
        server = await initInMemoryDb();
    });

    it('Save map metadata', async () => {
        const mapData = {
            mapName: 'Summer 2021 - 01',
            mapUId: '7fsfRSUCQ7YwfBEdRk_GivW6qzj',
            authorName: 'Nadeo',
        };

        await db.saveMap(mapData);
        const map = await db.getMapByUId(mapData.mapUId);

        expect(map.mapName).toBe(mapData.mapName);
        expect(map.mapUId).toBe(mapData.mapUId);
        expect(map.authorName).toBe(mapData.authorName);
    });

    it('Save tm.io extra in map documents', async () => {
        const mapData = {
            mapName: 'Summer 2021 - 01',
            mapUId: '7fsfRSUCQ7YwfBEdRk_GivW6qzj',
            authorName: 'Nadeo',
        };

        await db.saveMap(mapData);
        const map = await db.getMapByUId(mapData.mapUId);

        expect(map.extra).not.toBeUndefined();
        expect(map.extra).not.toBe({});

        expect(map.extra.mapUid).toBe(mapData.mapUId);
    });

    afterEach(async () => {
        await stopInMemoryDb(server);
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { beforeEach, describe, it } from '@jest/globals';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/replays (GET)', () => request(app.getHttpServer())
        .get('/replays')
        .expect(200)
        .expect(['Replay 1', 'Replay 2', 'Replay 3']));
});

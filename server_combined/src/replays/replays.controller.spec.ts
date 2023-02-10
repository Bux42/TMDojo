import {
    beforeEach, describe, expect, it,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ReplaysService } from './replays.service';
import { ReplaysController } from './replays.controller';

describe('ReplaysController', () => {
    let replaysController: ReplaysController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [ReplaysController],
            providers: [ReplaysService],
        }).compile();

        replaysController = app.get<ReplaysController>(ReplaysController);
    });

    describe('replaysController', () => {
        it('to be defined', () => {
            expect(replaysController).toBeDefined();
        });
    });
});

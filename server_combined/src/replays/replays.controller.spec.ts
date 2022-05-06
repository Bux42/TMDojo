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

    describe('getReplays', () => {
        it('should return the replays', () => {
            expect(replaysController.getReplays())
                .toStrictEqual(['Replay 1', 'Replay 2', 'Replay 3']);
        });
    });

    describe('getReplayById', () => {
        it('should return the replay with ID', () => {
            expect(replaysController.getReplayById('555'))
                .toBe('Replay with id: 555');
        });
    });
});

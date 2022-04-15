import {
    beforeEach, describe, expect, it,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ReplaysService } from '../replays/replays.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
    let usersController: UsersController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [UsersService, ReplaysService],
        }).compile();

        usersController = app.get<UsersController>(UsersController);
    });

    describe('getUserInfo', () => {
        it('should return the user info', () => {
            expect(usersController.getUserInfo('555'))
                .toBe('User info with id 555');
        });
    });

    describe('getUserReplays', () => {
        it('should return the user replays', () => {
            expect(usersController.getUserReplays('100'))
                .toStrictEqual(['Replay 1 from 100', 'Replay 2 from 100', 'Replay 3 from 100']);
        });
    });
});

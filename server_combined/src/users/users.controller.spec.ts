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

    describe('usersController', () => {
        it('to be defined', () => {
            expect(usersController).toBeDefined();
        });
    });
});

import {
    beforeEach, describe, expect, it,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizeController } from './authorize.controller';
import { AuthorizeService } from './authorize.service';

describe('AuthorizeController', () => {
    let controller: AuthorizeController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthorizeController],
            providers: [AuthorizeService],
        }).compile();

        controller = module.get<AuthorizeController>(AuthorizeController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});

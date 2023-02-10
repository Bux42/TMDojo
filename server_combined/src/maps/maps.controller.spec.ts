import {
    beforeEach, describe, expect, it,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

describe('MapController', () => {
    let mapsController: MapsController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [MapsController],
            providers: [MapsService],
        }).compile();

        mapsController = app.get<MapsController>(MapsController);
    });

    describe('mapsController', () => {
        it('to be defined', () => {
            expect(mapsController).toBeDefined();
        });
    });
});

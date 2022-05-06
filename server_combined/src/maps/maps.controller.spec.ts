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

    describe('getMaps', () => {
        it('should return maps', () => {
            expect(mapsController.getMaps()).toStrictEqual(['Map 1', 'Map 2', 'Map 3']);
        });
    });

    describe('getMap', () => {
        it('should return maps', () => {
            expect(mapsController.getMap('100')).toBe('Map with id 100');
        });
    });
});

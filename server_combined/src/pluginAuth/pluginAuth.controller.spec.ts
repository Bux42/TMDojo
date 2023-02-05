import {
    beforeEach, describe, expect, it,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PluginAuthController } from './pluginAuth.controller';
import { PluginAuthService } from './pluginAuth.service';

describe('PluginAuthController', () => {
    let pluginAuthController: PluginAuthController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [PluginAuthController],
            providers: [PluginAuthService],
        }).compile();

        pluginAuthController = app.get<PluginAuthController>(PluginAuthController);
    });

    describe('pluginAuthController', () => {
        it('should be defined', () => {
            expect(pluginAuthController).toBeDefined();
        });
    });
});

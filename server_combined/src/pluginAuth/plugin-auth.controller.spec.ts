import {
    beforeEach, describe, expect, it,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PluginAuthController } from './plugin-auth.controller';
import { PluginAuthService } from './plugin-auth.service';

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

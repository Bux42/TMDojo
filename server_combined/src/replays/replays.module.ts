import { Module } from '@nestjs/common';
import { ReplaysService } from './replays.service';
import { ReplaysController } from './replays.controller';

@Module({
    imports: [],
    controllers: [ReplaysController],
    providers: [ReplaysService],
    exports: [ReplaysService],
})
export class ReplaysModule {}

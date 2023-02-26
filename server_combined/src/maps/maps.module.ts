import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TmApiModule } from '../common/services/tmApi/tmApi.module';
import { TmIoApiModule } from '../common/services/tmIoApi/tmIoApi.module';
import { Replay, ReplaySchema } from '../replays/schemas/replay.schema';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';
import { Map, MapSchema } from './schemas/map.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Map.name, schema: MapSchema }]),
        MongooseModule.forFeature([{ name: Replay.name, schema: ReplaySchema }]),
        TmApiModule,
        TmIoApiModule,
    ],
    controllers: [MapsController],
    providers: [MapsService],
    exports: [MapsService],
})
export class MapsModule { }

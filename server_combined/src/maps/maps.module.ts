import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TmApiModule } from '../common/modules/tm-api/tm-api.module';
import { TmIoApiModule } from '../common/modules/tm-io-api/tm-io-api.module';
import { Replay, ReplaySchema } from '../replays/schemas/replay.schema';
import { MapsCacheService } from './caching/maps-cache.service';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';
import { Map, MapSchema } from './schemas/map.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Map.name, schema: MapSchema }]),
        MongooseModule.forFeature([{ name: Replay.name, schema: ReplaySchema }]),
        TmApiModule,
        TmIoApiModule,
        CacheModule.register(),
    ],
    controllers: [MapsController],
    providers: [MapsService, MapsCacheService],
    exports: [MapsService],
})
export class MapsModule { }

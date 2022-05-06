import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Map } from 'mongodb';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';
import { MapSchema } from './schemas/map.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Map.name, schema: MapSchema }])],
    controllers: [MapsController],
    providers: [MapsService],
    exports: [MapsService],
})
export class MapsModule {}

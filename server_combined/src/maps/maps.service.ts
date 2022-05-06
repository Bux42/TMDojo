import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Map, MapDocument } from './schemas/map.schema';

@Injectable()
export class MapsService {
    constructor(@InjectModel(Map.name) private mapModel: Model<MapDocument>) {}

    findAll(): Promise<Map[]> {
        return this.mapModel.find().exec();
    }

    findByMapUId(mapUId: string): Promise<Map> {
        return this.mapModel.findOne({ mapUId }).exec();
    }
}

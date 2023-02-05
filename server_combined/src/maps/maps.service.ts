import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Map, MapDocument } from './schemas/map.schema';
import { Replay, ReplayDocument } from '../replays/schemas/replay.schema';

@Injectable()
export class MapsService {
    constructor(
        @InjectModel(Map.name) private mapModel: Model<MapDocument>,
        @InjectModel(Replay.name) private replayModel: Model<ReplayDocument>,
    ) { }

    findAll(): Promise<Map[]> {
        return this.mapModel.find().exec();
    }

    findAllWithReplayCounts(mapName?: string): Promise<any[]> {
        return this.replayModel.aggregate()
            .group({
                _id: '$mapRef',
                count: { $sum: 1 },
                lastUpdate: { $max: '$date' }, // pass the highest date (i.e. latest replay's timestamp)
            })
            .lookup({
                from: 'maps',
                localField: '_id',
                foreignField: '_id',
                as: 'map',
            })
            .unwind('$map')
            .replaceRoot({
                $mergeObjects: ['$map', '$$ROOT'],
            })
            .match(mapName === undefined ? {} : {
                mapName: { $regex: `.*${mapName}.*`, $options: 'i' },
            })
            .project({
                _id: 0,
                map: 0,
            })
            .exec();
    }

    findByMapUId(mapUId: string) {
        return this.mapModel.findOne({ mapUId }).exec();
    }
}

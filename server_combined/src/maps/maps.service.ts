import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Map, MapDocument } from './schemas/map.schema';
import { Replay, ReplayDocument } from '../replays/schemas/replay.schema';
import { TmIoApiService } from '../common/services/tmIoApi/tmIoApi.service';

@Injectable()
export class MapsService {
    constructor(
        @InjectModel(Map.name) private mapModel: Model<MapDocument>,
        @InjectModel(Replay.name) private replayModel: Model<ReplayDocument>,
        private readonly tmIoApiService: TmIoApiService,
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

    async findOrCreateByMapUId(mapUId: string) {
        let map = await this.findByMapUId(mapUId);

        if (!map) {
            map = await this.createMapByMapUId(mapUId);
        }

        return map;
    }

    async createMapByMapUId(mapUId: string) {
        const mapInfo = await this.tmIoApiService.getMapInfo(mapUId);

        if (!mapInfo) {
            return null;
        }

        const {
            name, authorplayer, fileUrl, thumbnailUrl, bronzeScore, silverScore, goldScore, authorScore,
        } = mapInfo;

        return this.mapModel.create({
            mapUId,
            mapName: name,
            authorName: authorplayer.name,
            fileUrl,
            thumbnailUrl,
            medals: {
                bronze: bronzeScore,
                silver: silverScore,
                gold: goldScore,
                author: authorScore,
            },
        });
    }
}

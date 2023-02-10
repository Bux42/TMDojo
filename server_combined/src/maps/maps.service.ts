import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Map } from './schemas/map.schema';
import { Replay } from '../replays/schemas/replay.schema';
import { TmIoApiService } from '../common/services/tmIoApi/tmIoApi.service';
import { ListMapsDto } from './dto/ListMaps.dto';
import { regexPartialLowercaseStr as matchPartialLowercaseString } from '../common/db/filterRegex';
import { calculateSkip } from '../common/db/pagination';

@Injectable()
export class MapsService {
    logger: Logger;

    constructor(
        @InjectModel(Map.name) private mapModel: Model<Map>,
        @InjectModel(Replay.name) private replayModel: Model<Replay>,
        private readonly tmIoApiService: TmIoApiService,
    ) {
        this.logger = new Logger(MapsService.name);
    }

    findAll(listMapsDto: ListMapsDto) {
        const {
            mapName, mapUId, limit, skip, skipPage,
        } = listMapsDto;

        // Create filter
        const filter: FilterQuery<Map> = {};
        if (mapName !== undefined) filter.mapName = matchPartialLowercaseString(mapName);
        if (mapUId !== undefined) filter.mapUId = mapUId;

        return this.mapModel
            .find(filter, { mapName: 1 })
            .limit(limit)
            .skip(calculateSkip({ limit, skip, skipPage }))
            .exec();
    }

    aggregateReplaysByMap(listMapsDto: ListMapsDto) {
        const {
            mapName, mapUId, limit, skip, skipPage,
        } = listMapsDto;
        const calculatedSkip = calculateSkip({ limit, skip, skipPage });

        const filter: FilterQuery<Map> = {};
        if (mapName !== undefined) filter.mapName = matchPartialLowercaseString(mapName);
        if (mapUId !== undefined) filter.mapUId = mapUId;

        let agg = this.replayModel.aggregate()
            .group({
                _id: '$mapRef',
                count: { $sum: 1 },
                lastUpdate: { $max: '$date' }, // pass the highest date (i.e. latest replay's timestamp)
            })
            .lookup({
                from: Map.name,
                localField: '_id',
                foreignField: '_id',
                as: 'map',
            })
            .unwind('$map')
            .replaceRoot({
                $mergeObjects: ['$map', '$$ROOT'],
            })
            .match(filter);

        // Apply optional limit and skip
        if (limit !== undefined) agg = agg.limit(limit);
        if (calculatedSkip !== undefined) agg = agg.skip(calculatedSkip);

        return agg
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

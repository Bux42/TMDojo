import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Map } from './schemas/map.schema';
import { Replay } from '../replays/schemas/replay.schema';
import { TmIoApiService } from '../common/modules/tm-io-api/tm-io-api.service';
import { ListMapsDto } from './dto/list-maps.dto';
import { regexPartialLowercaseStr as matchPartialLowercaseString } from '../common/util/db/filter-regex';
import { calculateSkip } from '../common/util/db/pagination';
import { MyLogger } from '../common/logger/my-logger.service';

@Injectable()
export class MapsService {
    constructor(
        @InjectModel(Map.name) private mapModel: Model<Map>,
        @InjectModel(Replay.name) private replayModel: Model<Replay>,
        private readonly tmIoApiService: TmIoApiService,
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(MapsService.name);
    }

    findAll(listMapsDto: ListMapsDto) {
        const {
            mapName, mapUId, limit, skip, skipPage,
        } = listMapsDto;

        const calculatedSkip = calculateSkip({ limit, skip, skipPage });

        // Create filter
        const filter: FilterQuery<Map> = {};
        if (mapName !== undefined) filter.mapName = matchPartialLowercaseString(mapName);
        if (mapUId !== undefined) filter.mapUId = mapUId;

        // Build and perform query
        let query = this.mapModel
            .find(filter);

        if (calculatedSkip) {
            query = query.skip(calculatedSkip);
        }
        if (limit) {
            query = query.limit(limit);
        }

        return query.exec();
    }

    aggregateReplaysByMap(listMapsDto: ListMapsDto) {
        const {
            mapName, mapUId, limit, skip, skipPage,
        } = listMapsDto;

        const calculatedSkip = calculateSkip({ limit, skip, skipPage });

        const filter: FilterQuery<Map> = {};
        if (mapName !== undefined) filter.mapName = matchPartialLowercaseString(mapName);
        if (mapUId !== undefined) filter.mapUId = mapUId;

        // Build and execute query
        let query = this.replayModel
            .aggregate()
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
            .match(filter)
            .sort({ lastUpdate: -1 });

        if (calculatedSkip) {
            query = query.skip(calculatedSkip);
        }
        if (limit) {
            query = query.limit(limit);
        }

        return query
            .project({
                _id: 0,
                map: 0,
            })
            .exec();
    }

    findByMapUId(mapUId: string) {
        this.logger.debug(`Finding map with mapUId: ${mapUId}`);
        return this.mapModel
            .findOne({ mapUId })
            .exec();
    }

    async findOrCreateByMapUId(mapUId: string) {
        this.logger.debug(`Find or create map with mapUId: ${mapUId}`);

        let map = await this.findByMapUId(mapUId);

        if (!map) {
            this.logger.debug(`Map not found, creating map with mapUId: '${mapUId}'`);
            map = await this.createMapByMapUId(mapUId);
        }

        return map;
    }

    async createMapByMapUId(mapUId: string) {
        const mapInfo = await this.tmIoApiService.getMapInfo(mapUId);

        if (mapInfo === null) {
            return null;
        }

        const {
            // eslint-disable-next-line max-len
            name, exchangeid, authorplayer, fileUrl, thumbnailUrl, bronzeScore, silverScore, goldScore, authorScore, timestamp,
        } = mapInfo;

        return this.mapModel.create({
            mapUId,
            exchangeId: exchangeid,
            mapName: name,
            authorName: authorplayer.name,
            authorId: authorplayer.id,
            fileUrl,
            thumbnailUrl,
            timestamp,
            medals: {
                bronze: bronzeScore,
                silver: silverScore,
                gold: goldScore,
                author: authorScore,
            },
        });
    }
}

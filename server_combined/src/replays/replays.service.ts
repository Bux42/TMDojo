// import { Express } from 'express';
import {
    NotFoundException, Injectable, Inject, forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { calculateSkip } from '../common/util/db/pagination';
import { MapsService } from '../maps/maps.service';
import { Map } from '../maps/schemas/map.schema';
import { User } from '../users/schemas/user.schema';
import { FindReplaysDto } from './dto/find-replays.dto';
import { UploadReplayDto } from './dto/upload-replay.dto';
import { Replay } from './schemas/replay.schema';
import { UserRo } from '../users/dto/user.ro';
import { MyLogger } from '../common/logger/my-logger.service';
import { ReplayUploadedEvent } from './events/replay-uploaded.event';
import { ArtefactsService } from '../common/modules/artefacts/artefacts.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReplaysService {
    constructor(
        @InjectModel(Replay.name) private replayModel: Model<Replay>,
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,
        private readonly mapsService: MapsService,
        private readonly artefactsService: ArtefactsService,
        private readonly logger: MyLogger,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.logger.setContext(ReplaysService.name);
    }

    async findAll(findReplayOptions: FindReplaysDto): Promise<Replay[]> {
        const {
            mapUId, userWebId, limit, skip, skipPage, raceFinished,
        } = findReplayOptions;

        this.logger.debug(`Finding replays with options: ${JSON.stringify(findReplayOptions)}`);

        // Handle map filter option
        let map;
        if (mapUId) {
            map = await this.mapsService.findByMapUId(mapUId);
            if (map == null) {
                this.logger.debug(`Map not found with ID: ${mapUId}`);
                return [];
            }
        }

        // Handle user filter option
        let user;
        if (userWebId) {
            user = await this.usersService.findByWebId(userWebId);
            if (user == null) {
                this.logger.debug(`User not found with webId: ${userWebId}`);
                return [];
            }
        }

        // Build filter query
        const filter: FilterQuery<Replay> = {};
        if (map !== undefined) filter.mapRef = map._id; // TODO: check if ._id works, otherwise use .id
        if (user !== undefined) filter.userRef = user._id; // TODO: check if ._id works, otherwise use .id
        if (raceFinished !== undefined && (raceFinished === 0 || raceFinished === 1)) {
            filter.raceFinished = raceFinished;
        }

        this.logger.debug(`Filter query: ${JSON.stringify(filter)}`);

        // TODO: implement other query parameters for replayModel query

        return this.replayModel
            .find(filter)
            .sort({ date: -1 })
            .limit(limit)
            .skip(calculateSkip({ limit, skip, skipPage }))
            .populate<{ map: Map }>('map')
            .populate<{ user: User }>('user')
            .exec();
    }

    findById(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;

        return this.replayModel
            .findById(id)
            .populate<{ map: Map }>('map')
            .populate<{ user: User }>('user')
            .exec();
    }

    // TODO: replace this with a getReplays method with all filters
    //     This was made temporarily to complete the /users/:webId/replays endpoint
    async findReplaysFromUser(webId: string) {
        const user = await this.usersService.findByWebId(webId);

        if (user === null) {
            return [];
        }

        return this.replayModel
            .find({ userRef: user.id })
            .populate<{ map: Map }>('map')
            .populate<{ user: User }>('user')
            .exec();
    }

    countReplays(filter: FilterQuery<Replay> = {}): Promise<number> {
        return this.replayModel.count(filter).exec();
    }

    async uploadReplay(loggedInUser: UserRo, uploadReplayDto: UploadReplayDto, replayBuffer: Buffer): Promise<Replay> {
        const {
            mapUId, raceFinished, endRaceTime, pluginVersion, sectorTimes,
        } = uploadReplayDto;
        this.logger.log(`Uploading replay for user '${loggedInUser.webId}' on map '${mapUId}'`);

        const map = await this.mapsService.findOrCreateByMapUId(mapUId);
        if (!map) {
            throw new NotFoundException(`Map not found with ID: ${mapUId}`);
        }

        // eslint-disable-next-line max-len
        const base64Decoded = Buffer.from(replayBuffer.toString('utf-8'), 'base64');
        // eslint-disable-next-line max-len
        const storeReplayObjectResponse = await this.artefactsService.storeReplayObject(uploadReplayDto, map, loggedInUser, base64Decoded);

        const replay = await this.replayModel.create({
            mapRef: map._id,
            userRef: loggedInUser._id,
            date: Date.now(),
            raceFinished,
            endRaceTime,
            pluginVersion,
            sectorTimes,
            // Only one of the following will be set, depending on whether FS or S3 is used
            objectPath: storeReplayObjectResponse.objectPath ?? undefined,
            filePath: storeReplayObjectResponse.filePath ?? undefined,
        });

        this.logger.debug(`Replay uploaded: '${JSON.stringify(replay)}`);

        this.eventEmitter.emit(
            ReplayUploadedEvent.KEY,
            new ReplayUploadedEvent(
                replay,
                loggedInUser,
                map,
            ),
        );

        return replay;
    }

    async deleteReplay(replay: Replay) {
        const deleteReplayObjectResult = await this.artefactsService.deleteReplayObject(replay);

        if ('error' in deleteReplayObjectResult) {
            this.logger.error(`Replay deletion failed, reason: ${deleteReplayObjectResult.error}`);
            throw new Error('Failed to delete replay object');
        }

        await this.replayModel.findByIdAndDelete(replay._id);

        return replay;
    }
}

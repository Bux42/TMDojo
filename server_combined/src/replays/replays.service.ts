// import { Express } from 'express';
import { NotFoundException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { calculateSkip } from '../common/db/pagination';
import { MapsService } from '../maps/maps.service';
import { Map } from '../maps/schemas/map.schema';
import { User } from '../users/schemas/user.schema';
import { ListReplaysDto } from './dto/ListReplays.dto';
import { UploadReplayDto } from './dto/UploadReplay.dto';
import { Replay } from './schemas/replay.schema';
import { ArtefactsService } from '../artefacts/artefacts.service';
import { UserRo } from '../users/dto/user.ro';
import { MyLogger } from '../common/logger/my-logger.service';

@Injectable()
export class ReplaysService {
    constructor(
        @InjectModel(Replay.name) private replayModel: Model<Replay>,
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly mapsService: MapsService,
        private readonly artefactsService: ArtefactsService,
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(ReplaysService.name);
    }

    async findAll(listReplayOptions: ListReplaysDto) {
        const {
            mapUId, userWebId, limit, skip, skipPage, raceFinished,
        } = listReplayOptions;

        this.logger.debug(`Finding replays with options: ${JSON.stringify(listReplayOptions)}`);

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
            user = await this.userModel.findOne({ webId: userWebId }).exec();
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
            .populate<{ user: User }>('user', '-clientCode')
            .lean()
            .exec();
    }

    findById(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;

        return this.replayModel
            .findById(id)
            .populate<{ map: Map }>('map')
            .populate<{ user: User }>('user', '-clientCode')
            .lean()
            .exec();
    }

    // TODO: replace this with a getReplays method with all filters
    //     This was made temporarily to complete the /users/:webId/replays endpoint
    async findReplaysFromUser(webId: string) {
        const user = await this.userModel.findOne({ webId }).exec();

        if (user === null) {
            return [];
        }

        return this.replayModel
            .find({ userRef: user.id })
            .populate<{ map: Map }>('map')
            .populate<{ user: User }>('user', '-clientCode')
            .lean()
            .exec();
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

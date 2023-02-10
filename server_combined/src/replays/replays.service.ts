import { Logger, NotFoundException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { calculateSkip } from '../common/db/pagination';
import { MapsService } from '../maps/maps.service';
import { Map } from '../maps/schemas/map.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ListReplaysDto } from './dto/ListReplays.dto';
import { UploadReplayDto } from './dto/UploadReplay.dto';
import { Replay, ReplayDocument } from './schemas/replay.schema';

@Injectable()
export class ReplaysService {
    logger: Logger;

    constructor(
        @InjectModel(Replay.name) private replayModel: Model<ReplayDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly mapsService: MapsService,
    ) {
        this.logger = new Logger(ReplaysService.name);
    }

    async findAll(listReplayOptions: ListReplaysDto) {
        const {
            mapUId, userWebId, limit, skip, skipPage, raceFinished,
        } = listReplayOptions;

        // Handle map filter option
        let map;
        if (mapUId) {
            map = await this.mapsService.findByMapUId(mapUId);
            if (map == null) return [];
        }

        // Handle user filter option
        let user;
        if (userWebId) {
            user = await this.userModel.findOne({ webId: userWebId }).exec();
            if (user == null) return [];
        }

        // Build filter query
        const filter: FilterQuery<Replay> = {};
        if (map !== undefined) filter.mapRef = map._id; // TODO: check if ._id works, otherwise use .id
        if (user !== undefined) filter.userRef = user._id; // TODO: check if ._id works, otherwise use .id
        if (raceFinished !== undefined) filter.raceFinished = raceFinished;

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
            .populate<{ user: User }>('user')
            .lean()
            .exec();
    }

    // TODO: replace this with a getReplays method with all filters
    //     This was made temporarily to complete the /users/:webId/replays endpoint
    async findReplaysFromUser(webId: string) {
        const user = await this.userModel.findOne({ webId }).exec();

        console.log(user);

        if (user === null) {
            return [];
        }

        console.log(user.id);

        return this.replayModel
            .find({ userRef: user.id })
            .lean()
            .exec();
    }

    async uploadReplay({
        webId, mapUId, raceFinished, endRaceTime, pluginVersion, sectorTimes,
    }: UploadReplayDto): Promise<Replay> {
        const map = await this.mapsService.findOrCreateByMapUId(mapUId);
        if (!map) {
            throw new NotFoundException('Map not found');
        }

        // TODO: Use UsersModule, fix circular dependency
        const user = await this.userModel.findOne({ webId }).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.replayModel.create({
            mapRef: map._id,
            userRef: user._id,
            date: Date.now(),
            raceFinished,
            endRaceTime,
            pluginVersion,
            sectorTimes,
        });
    }

    async deleteReplay(replayId: string) {
        if (!mongoose.Types.ObjectId.isValid(replayId)) return null;

        const replay = await this.replayModel.findByIdAndDelete(replayId);
        return replay;
    }
}

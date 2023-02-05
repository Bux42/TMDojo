import { NotFoundException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapsService } from '../maps/maps.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ListReplaysDto } from './dto/ListReplays.dto';
import { UploadReplayDto } from './dto/UploadReplay.dto';
import { Replay, ReplayDocument } from './schemas/replay.schema';

@Injectable()
export class ReplaysService {
    constructor(
        @InjectModel(Replay.name) private replayModel: Model<ReplayDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly mapsService: MapsService,
    ) { }

    async findAll(listReplayOptions: ListReplaysDto): Promise<Replay[]> {
        const { mapUId, maxResults } = listReplayOptions;

        let map;
        if (mapUId) {
            map = await this.mapsService.findByMapUId(mapUId);
        }

        // TODO: implement other query parameters for replayModel query

        return this.replayModel
            .find(map && { mapRef: map._id })
            // .find({ mapName })
            .sort({ date: -1 })
            .limit(maxResults)
            .exec();
    }

    findById(id: string): Promise<Replay> {
        return this.replayModel.findById(id).exec();
    }

    // TODO: replace this with a getReplays method with all filters
    //     This was made temporarily to complete the /users/:webId/replays endpoint
    async findUserReplaysByWebId(webId: string): Promise<Replay[]> {
        const user = await this.userModel.findOne({ webId }).exec();

        if (user === null) {
            return [];
        }

        return this.replayModel.find({ userRef: user._id }).exec();
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
}

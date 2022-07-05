import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Map, MapDocument } from '../maps/schemas/map.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ListReplaysDto } from './dto/ListReplays.dto';
import { Replay, ReplayDocument } from './schemas/replay.schema';

@Injectable()
export class ReplaysService {
    constructor(
        @InjectModel(Replay.name) private replayModel: Model<ReplayDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Map.name) private mapModel: Model<MapDocument>,
    ) {}

    async findAll(query: ListReplaysDto): Promise<Replay[]> {
        let map;

        if (query.mapUId) {
            map = await this.mapModel.findOne({ mapUId: query.mapUId }).exec();
        }

        // TODO: implement other query parameters for replayModel query

        return this.replayModel
            .find(map && { mapRef: map._id })
            .sort({ date: -1 })
            .limit(1000)
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
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapsService } from '../maps/maps.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ListReplaysDto } from './dto/ListReplays.dto';
import { Replay, ReplayDocument } from './schemas/replay.schema';

@Injectable()
export class ReplaysService {
    constructor(
        @InjectModel(Replay.name) private replayModel: Model<ReplayDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly mapsService: MapsService,
    ) { }

    async findAll(listReplayOptions: ListReplaysDto): Promise<Replay[]> {
        const { mapUId } = listReplayOptions;

        let map;
        if (mapUId) {
            map = await this.mapsService.findByMapUId(mapUId);
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

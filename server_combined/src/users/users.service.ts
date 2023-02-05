import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    findAll() {
        return this.userModel.find().exec();
    }

    findUserByWebId(webId: string) {
        return this.userModel.findOne({ webId }).exec();
    }

    async createUserWithClientCode(webId: string, playerName: string, clientCode: string): Promise<User> {
        return this.userModel.create({ webId, playerName, clientCode });
    }

    async updateUserWithClientCode(webId: string, clientCode: string) {
        return this.userModel
            .updateOne(
                { webId },
                { clientCode },
            );
    }

    async upsertUserWithClientCode(webId: string, playerName: string, clientCode: string): Promise<User> {
        return this.userModel
            .findOneAndUpdate(
                { webId },
                { webId, playerName, clientCode },
                { upsert: true, new: true },
            );
    }
}

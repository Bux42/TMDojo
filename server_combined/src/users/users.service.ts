import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    findAll(projection?: ProjectionType<UserDocument>) {
        return this.userModel
            .find({}, projection)
            .exec();
    }

    findById(webId: string, projection?: ProjectionType<UserDocument>) {
        return this.userModel
            .findById(
                webId,
                projection,
            )
            .exec();
    }

    findByWebId(webId: string, projection?: ProjectionType<UserDocument>) {
        return this.userModel
            .findOne(
                { webId },
                projection,
            )
            .exec();
    }

    createUser(user: User) {
        return this.userModel.create(user);
    }

    upsertUser(user: User) {
        return this.userModel.findOneAndUpdate(
            { webId: user.webId },
            user,
            { upsert: true, new: true },
        );
    }

    updateUserClientCode(webId: string, clientCode?: string) {
        return this.userModel.updateOne(
            { webId },
            { clientCode },
            clientCode === undefined ? { $unset: clientCode } : {},
        );
    }
}

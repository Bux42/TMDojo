import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

    findAll(projection?: ProjectionType<User>) {
        return this.userModel
            .find({}, projection)
            .exec();
    }

    findById(userId: string, projection?: ProjectionType<User>) {
        return this.userModel
            .findById(
                userId,
                projection,
            )
            .exec();
    }

    findByWebId(webId: string, projection?: ProjectionType<User>) {
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

    // Omitting _id because we search user by webId
    upsertUser(user: Omit<User, '_id'>) {
        return this.userModel.findOneAndUpdate(
            { webId: user.webId }, // Find user by web id
            user, // Data to upsert with
            { upsert: true, new: true }, // Settings to define upsert behavior
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

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType } from 'mongoose';
import { UserReplaysRo } from './dto/user-replays.ro';
import { UserCreatedEvent } from './events/new-user.event';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly eventEmitter: EventEmitter2,
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

    count() {
        return this.userModel.countDocuments().exec();
    }

    async createUser(user: Omit<User, '_id' | 'toRo'>) {
        const createdUser = await this.userModel.create(user);

        this.eventEmitter.emit(
            UserCreatedEvent.KEY,
            new UserCreatedEvent(createdUser),
        );

        return createdUser;
    }

    updatePlayerNameByWebId({ webId, playerName }: { webId: string, playerName: string }) {
        return this.userModel.findOneAndUpdate(
            { webId },
            { playerName },
        );
    }

    // Omitting _id because we search user by webId
    upsertUser(user: Omit<User, '_id' | 'toRo'>) {
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

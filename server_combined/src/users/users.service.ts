import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../sessions/schemas/session.schema';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    ) {}

    findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    findUserByWebId(webId: string): Promise<User> {
        return this.userModel.findOne({ webId }).exec();
    }

    async findUserBySessionId(sessionId: string): Promise<User> {
        const session = await this.sessionModel
            .findOne({ sessionId })
            .populate('userRef')
            .exec();

        if (session === null) {
            return null;
        }

        return session.userRef;
    }
}

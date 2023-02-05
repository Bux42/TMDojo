import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';

@Injectable()
export class SessionsService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    ) { }

    async findSessionByClientCode(clientCode: string) {
        return this.sessionModel
            .findOne({ clientCode })
            .exec();
    }

    async removeClientCodeFromSession(sessionId: string) {
        await this.sessionModel
            .updateOne(
                { _id: sessionId },
                { $unset: { clientCode: 1 } },
            )
            .exec();
    }

    async findUserBySessionId(sessionId: string) {
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

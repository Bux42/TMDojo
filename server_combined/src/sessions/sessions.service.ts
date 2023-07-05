import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { User } from '../users/schemas/user.schema';
import { Session } from './schemas/session.schema';

@Injectable()
export class SessionsService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<Session>,
    ) { }

    async createSession(userRef: string) {
        const sessionId = uuid();

        return this.sessionModel.create({
            sessionId,
            userRef,
        });
    }

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
            .populate<{ user: User }>('user')
            .exec();

        if (session === null) {
            return null;
        }

        return session.user;
    }

    private setSessionCookieWithAge(req: Request, res: Response, sessionId: string, age: number) {
        res.cookie('sessionId', sessionId, {
            path: '/',
            secure: req.secure,
            maxAge: age,
            domain: process.env.NODE_ENV === 'prod' ? 'tmdojo.com' : 'localhost',
        });
    }

    setSessionCookie(req: Request, res: Response, sessionId: string) {
        const age = 1000 * 60 * 60 * 24 * 365; // 365 days
        this.setSessionCookieWithAge(req, res, sessionId, age);
    }

    expireSessionCookie(req: Request, res: Response) {
        this.setSessionCookieWithAge(req, res, '', -1);
    }
}

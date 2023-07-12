/* eslint-disable indent */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({
    versionKey: false,
})
export class Session {
    @Prop({ required: true })
    sessionId: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: User.name })
    userRef: string;

    @Prop()
    clientCode?: string;
}

export type SessionDocument = Session & Document;

export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.virtual('user', {
    ref: User.name,
    localField: 'userRef',
    foreignField: '_id',
    justOne: true,
});

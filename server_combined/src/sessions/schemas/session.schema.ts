import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema()
export class Session {
    @Prop({ required: true })
    sessionId: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    userRef: User;

    @Prop()
    clientCode?: string;
}

export type SessionDocument = Session & Document;

export const SessionSchema = SchemaFactory.createForClass(Session);

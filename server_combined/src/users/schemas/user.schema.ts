import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({
    versionKey: false,
    // TODO: add `timestamps: true` and confirm results
})
export class User {
    @Prop({ type: mongoose.Schema.Types.ObjectId, _id: true, auto: true })
    _id: string;

    @Prop({ required: true })
    webId: string;

    @Prop({ required: true })
    playerName: string;

    @Prop()
    clientCode?: string;

    @Prop()
    createdAt?: number;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

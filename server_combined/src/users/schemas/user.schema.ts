/* eslint-disable indent */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { UserRo } from '../dto/user.ro';

@Schema({
    versionKey: false,
    // TODO: add `timestamps: true` and confirm results (mind that the current DB has another format of createdAt)
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

    toRo: () => UserRo;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.toRo = function toRo(this: User): UserRo {
    return {
        _id: this._id,
        webId: this.webId,
        playerName: this.playerName,
    };
};

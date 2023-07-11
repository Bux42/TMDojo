/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Map } from '../../maps/schemas/map.schema';
import { ReplayRo } from '../dto/replay.ro';

@Schema({
    versionKey: false,
})
export class Replay {
    @Prop({ type: mongoose.Schema.Types.ObjectId, _id: true, auto: true })
    _id: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Map.name })
    mapRef: string;
    map?: Map;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    userRef: string;
    user?: User;

    @Prop({ required: true })
    date: number;

    @Prop({ required: true })
    raceFinished: number;

    @Prop({ required: true })
    endRaceTime: number;

    @Prop()
    pluginVersion?: string;

    @Prop({ type: [Number], required: false })
    sectorTimes?: number[] | null;

    @Prop()
    objectPath?: string;

    @Prop()
    filePath?: string;

    toRo: () => ReplayRo;
}

export type ReplayDocument = Replay & Document;

export const ReplaySchema = SchemaFactory.createForClass(Replay);

ReplaySchema.virtual('map', {
    ref: Map.name,
    localField: 'mapRef',
    foreignField: '_id',
    justOne: true,
});

ReplaySchema.virtual('user', {
    ref: User.name,
    localField: 'userRef',
    foreignField: '_id',
    justOne: true,
});

ReplaySchema.methods.toRo = function toRo(this: Replay): ReplayRo {
    return {
        _id: this._id,
        mapRef: this.mapRef,
        map: this.map?.toRo(),
        userRef: this.userRef,
        user: this.user?.toRo(),
        date: this.date,
        raceFinished: this.raceFinished,
        endRaceTime: this.endRaceTime,
        pluginVersion: this.pluginVersion,
        sectorTimes: this.sectorTimes,
    };
};

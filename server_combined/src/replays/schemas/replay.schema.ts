/* eslint-disable max-classes-per-file */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Map } from '../../maps/schemas/map.schema';
// import { ReplayRo } from '../ro/Replay.ro';

@Schema({
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Replay {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Map.name })
    mapRef: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    userRef: string;

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

    // toRo: () => ReplayRo;
}

export class ReplayWithMap extends Replay {
    map: Map;
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

// ReplaySchema.method('toRo', function toRo(this: mongoose.HydratedDocument<Replay>): ReplayRo {
//     return {
//         _id: this._id,
//         mapRef: this.mapRef instanceof Map ? this.mapRef.toRo() : undefined,
//         date: this.date,
//         raceFinished: this.raceFinished,
//         endRaceTime: this.endRaceTime,
//         pluginVersion: this.pluginVersion,
//         sectorTimes: this.sectorTimes,
//     };
// });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Map } from '../../maps/schemas/map.schema';

@Schema()
export class Replay {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Map.name })
    mapRef: Map;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    userRef: User;

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
}

export type ReplayDocument = Replay & Document;

export const ReplaySchema = SchemaFactory.createForClass(Replay);

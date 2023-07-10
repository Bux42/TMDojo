import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { MapRo } from '../ro/Map.ro';

@Schema({
    versionKey: false,
    timestamps: true,
})
export class Map {
    @Prop({ type: mongoose.Schema.Types.ObjectId, _id: true, auto: true })
    _id: string;

    @Prop({ required: true })
    mapName: string;

    @Prop({ required: true })
    mapUId: string;

    @Prop({ required: true })
    exchangeId: number;

    @Prop({ required: true })
    authorName: string;

    @Prop({ required: true })
    authorId: string;

    @Prop({ required: true })
    fileUrl: string;

    @Prop({ required: true })
    thumbnailUrl: string;

    @Prop({ required: true })
    timestamp: string;

    @Prop({ required: true, type: 'object' })
    medals: {
        bronze: number;
        silver: number;
        gold: number;
        author: number;
    };

    @Prop({ required: true })
    createdAt: Date;

    @Prop({ required: true })
    updatedAt: Date;

    toRo: () => MapRo;
}

export type MapDocument = Map & Document;

export const MapSchema = SchemaFactory.createForClass(Map);

MapSchema.methods.toRo = function toRo(this: Map): MapRo {
    return {
        _id: this._id,
        mapName: this.mapName,
        mapUId: this.mapUId,
        exchangeId: this.exchangeId,
        authorName: this.authorName,
        authorId: this.authorId,
        fileUrl: this.fileUrl,
        thumbnailUrl: this.thumbnailUrl,
        timestamp: this.timestamp,
        medals: this.medals,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

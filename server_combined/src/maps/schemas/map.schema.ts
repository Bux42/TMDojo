import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MapRo } from '../ro/Map.ro';

export type Medals = {
    bronze: number;
    silver: number;
    gold: number;
    author: number;
}

@Schema({
    versionKey: false,
})
export class Map {
    _id: string;

    @Prop({ required: true })
    mapName: string;

    @Prop({ required: true })
    mapUId: string;

    @Prop({ required: true })
    authorName: string;

    @Prop({ required: true })
    fileUrl: string;

    @Prop({ required: true })
    thumbnailUrl: string;

    @Prop({ required: true, type: 'object' })
    medals: {
        bronze: number;
        silver: number;
        gold: number;
        author: number;
    }

    static toRo(map: Map): MapRo {
        return {
            _id: map._id,
            mapName: map.mapName,
            mapUId: map.mapUId,
            authorName: map.authorName,
            fileUrl: map.fileUrl,
            thumbnailUrl: map.thumbnailUrl,
            medals: map.medals,
        };
    }
}

export type MapDocument = Map & Document;

export const MapSchema = SchemaFactory.createForClass(Map);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Map {
    @Prop({ required: true })
    mapName: string;

    @Prop({ required: true })
    mapUId: string;

    @Prop({ required: true })
    authorName: string;
}

export type MapDocument = Map & Document;

export const MapSchema = SchemaFactory.createForClass(Map);

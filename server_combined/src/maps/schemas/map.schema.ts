import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// import { MapRo } from '../ro/Map.ro';

@Schema({
    versionKey: false,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
})
export class Map extends Document {
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
    };

    // toRo: () => MapRo;
}

export const MapSchema = SchemaFactory.createForClass(Map);

// MapSchema.methods.toRo = function toRo(this: HydratedDocument<Map>): MapRo {
//     console.log('Running toRo');

//     return {
//         _id: this._id,
//         mapName: this.mapName,
//         mapUId: this.mapUId,
//         authorName: this.authorName,
//         fileUrl: this.fileUrl,
//         thumbnailUrl: this.thumbnailUrl,
//         medals: this.medals,
//     };
// };

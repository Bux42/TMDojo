import {
    Schema, model,
} from 'mongoose';

// TypeScript Definitions
export interface MapType {
    mapName: string;
    mapUId: string;
    authorName: string;
}

// Mongoose Schema Definitions
const MapSchema = new Schema<MapType>({
    mapName: {
        type: String,
        required: true,
    },
    mapUId: {
        type: String,
        required: true,
    },
    authorName: {
        type: String,
        required: true,
    },
});

// Mongoose Model
const MapModel = model<MapType>('Map', MapSchema);

export default MapModel;

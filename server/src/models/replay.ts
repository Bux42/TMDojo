import {
    Schema, model, Types,
} from 'mongoose';

// TypeScript Definitions
interface Replay {
    mapRef: Types.ObjectId;
    userRef: Types.ObjectId;
    filePath?: string;
    objectPath?: string;
    date: Date;
    raceFinished: boolean;
    endRaceTime: number;
}

// Mongoose Schema Definitions
const ReplaySchema = new Schema<Replay>({
    mapRef: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Map',
    },
    userRef: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    filePath: String,
    objectPath: String,
    date: {
        type: Date,
        required: true,
    },
    raceFinished: {
        type: Boolean,
        required: true,
    },
    endRaceTime: {
        type: Schema.Types.Number,
        required: true,
    },
});

// Mongoose Model
const ReplayModel = model<Replay>('Replay', ReplaySchema);

export default ReplayModel;

import {
    Schema, model,
} from 'mongoose';

// TypeScript Definitions
export interface Session {
    sessionId: string;
    userRef: Schema.Types.ObjectId;
    clientCode?: string;
}

// Mongoose Schema Definitions
const SesssionSchema = new Schema<Session>({
    sessionId: {
        type: String,
        required: true,
    },
    userRef: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    clientCode: String,
});

// Mongoose Model
const SessionModel = model<Session>('Session', SesssionSchema);

export default SessionModel;

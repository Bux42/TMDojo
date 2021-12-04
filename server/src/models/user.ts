import {
    Schema, model,
} from 'mongoose';

// TypeScript Definitions
export interface User {
    webId: string;
    playerLogin: string;
    playerName: string;
    // Disable camelcase rule since it is currently stored using an underscore
    // eslint-disable-next-line camelcase
    last_active: Date;
    clientCode?: string;
}

// Mongoose Schema Definitions
const UserSchema = new Schema<User>({
    webId: { type: String, required: true },
    playerLogin: { type: String, required: true },
    playerName: { type: String, required: true },
    last_active: { type: Date, required: true },
    clientCode: String,
});

// Mongoose Model
const UserModel = model<User>('User', UserSchema);

export default UserModel;

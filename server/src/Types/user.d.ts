import { Document } from 'mongoose';

export interface IUser extends Document {
	webId: string,
	playerLogin: string,
	playerName: string,
	last_active: number,
}

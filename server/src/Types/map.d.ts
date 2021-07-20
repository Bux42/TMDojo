import { Document } from 'mongoose';

export interface IMap extends Document {
	mapName: string,
	mapUId: string,
	authorName: string,
}

import { Document } from 'mongoose';

import { IMap } from './map';
import { IUser } from './user';

export interface IReplay extends Document {
	map: string | IMap,
	user: number | IUser,
	filePath: string,
	date: number,
	raceFinished: number,
	endRaceTime: number,
}

import { Schema, model } from 'mongoose';


import { IReplay } from '../Types/replay';

export const ReplaySchema = new Schema(
	{
		map: {type: Schema.Types.ObjectId, required: true, ref: 'map'},
		user: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
		filePath: {type: String, required: true},
		date: {type: Number, required: true},
		raceFinished: {type: Number, required: true},
		endRaceTime: {type: Number, required: true},
	},
  	{
  		timestamps: {
  			createdAt: true
  		}
  	}
);


export { IReplay };

export const ReplayModel = model<IReplay>('replay', ReplaySchema, 'replay');


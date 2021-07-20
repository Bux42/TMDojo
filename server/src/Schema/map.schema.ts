import { Schema, model } from 'mongoose';


import { IMap } from '../Types/map';

export const MapSchema = new Schema(
	{
		mapName: {type: String, required: true},
		mapUId: {type: String, required: true},
		authorName: {type: String, required: true},
	},
  	{
  		timestamps: {
  			createdAt: true
  		}
  	}
);


export { IMap };

export const MapModel = model<IMap>('map', MapSchema, 'map');


import { Schema, model } from 'mongoose';


import { IUser } from '../Types/user';

export const UserSchema = new Schema(
	{
		webId: {type: String, required: true},
		playerLogin: {type: String, required: true},
		playerName: {type: String, required: true},
		last_active: {type: Number, required: true},
	},
  	{
  		timestamps: {
  			createdAt: true
  		}
  	}
);


export { IUser };

export const UserModel = model<IUser>('user', UserSchema, 'user');


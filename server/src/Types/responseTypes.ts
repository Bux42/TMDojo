// import { Schema } from 'mongoose';
import { HttpStatusCode } from './httpStatus';

export type TResponder = (IResponseType: IResponseType) => void

export interface IResponseType {
	status: HttpStatusCode,
	message?: string,
	code: string,
	payload?: object
};

export var ResponseType = {
	OK: {status: HttpStatusCode.OK, code: 'OK'},

	NO_CONTENT: {status: HttpStatusCode.NO_CONTENT, code: 'NO_CONTENT'},

	BAD_REQUEST: {status: HttpStatusCode.BAD_REQUEST, message:'bad request', code:'BAD_REQUEST'},

	NOT_FOUND: {status: HttpStatusCode.NOT_FOUND, message:'resource not found', code:'NOT_FOUND'},

	INTERNAL_SERVER_ERROR: {status: HttpStatusCode.INTERNAL_SERVER_ERROR, message:'internal server error', code:'INTERNAL_SERVER_ERROR'},

	UNDOCUMENT_ERROR: (e : Error) => ({status: HttpStatusCode.INTERNAL_SERVER_ERROR, message:`${e.message}`, code:'UNDOCUMENT_ERROR'}),

	BAD_REQUEST_NOT_FOUND: (attemptedMethod : string, attemptedRequest : string) : IResponseType => ({status: HttpStatusCode.NOT_FOUND, message:`endpoint not found : ${attemptedMethod} ${attemptedRequest}`, code: 'BAD_REQUEST_NOT_FOUND'}),

};
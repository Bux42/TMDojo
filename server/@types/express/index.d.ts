import { Express } from "express-serve-static-core";
import { TResponder } from '../../src/Types/responseTypes'

declare module 'express-serve-static-core' {
	interface Request {
		rawBody?: string,
	}

	interface IncomingMessage {
		rawBody?: string,
		originalUrl: string
	}

	interface Response {
		backResponse: TResponder
	}
}
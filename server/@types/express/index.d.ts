import { Express } from "express-serve-static-core";

declare module 'express-serve-static-core' {
	interface Request {
		rawBody?: string,
	}

	interface IncomingMessage {
		rawBody?: string,
		originalUrl: string
	}

	interface Response {
	}
}
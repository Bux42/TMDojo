import type { Request } from 'express';
import { AnyZodObject, z } from 'zod';
import { HttpError } from './httpErrors';

const zParseRequest = <T extends AnyZodObject>(
    schema: T,
    req: Request,
): z.infer<T> => {
    try {
        return schema.parse(req);
    } catch (err) {
        if (err instanceof z.ZodError) {
            // Error is a ZodError, something went wrong while parsing
            req.log.error(`zParseRequest: ZodError during parsing: ${JSON.stringify(err.issues)}`);

            const readableIssues = err.issues.map((issue) => ({
                path: issue.path,
                message: issue.message,
            }));

            throw new HttpError(400, { issues: readableIssues });
        }

        throw err;
    }
};

export default zParseRequest;

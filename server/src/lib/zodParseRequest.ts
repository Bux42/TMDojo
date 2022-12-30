import type { Request } from 'express';
import { AnyZodObject, z } from 'zod';
import { HttpError } from './httpErrors';

/**
 * Formats a path array of strings and number indices into a string
 * Normal strings are separated by dots, number indices are formatted with brackets around to indicate array indices
 */
const formatPath = (path: (string | number)[]) => {
    if (path.length === 0) return '';

    let res = `${path[0]}`;

    for (let i = 1; i < path.length; i++) {
        if (typeof path[i] === 'number') {
            res += `[${path[i]}]`;
        } else {
            res += `.${path[i]}`;
        }
    }

    return res;
};

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
                path: formatPath(issue.path),
                message: issue.message,
            }));

            throw new HttpError(400, { issues: readableIssues });
        }

        throw err;
    }
};

export default zParseRequest;

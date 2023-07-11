import { Readable } from "stream";

export const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('error', (err: Error) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

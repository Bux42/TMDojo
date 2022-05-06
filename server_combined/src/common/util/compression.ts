import * as zlib from 'zlib';

export const compress = (input: string|Buffer): Buffer => zlib.gzipSync(input);
export const decompress = (input: Buffer): Buffer => zlib.unzipSync(input);

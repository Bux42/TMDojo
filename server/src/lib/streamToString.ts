import { Readable } from 'stream';

const streamToString = async (stream: Readable): Promise<string> => {
    let completeData = '';

    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => { completeData += chunk; });
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(completeData));
    });
};

export default streamToString;

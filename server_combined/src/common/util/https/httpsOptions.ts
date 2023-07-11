import { readFileSync } from 'fs';
import { MyLogger } from '../../logger/my-logger.service';

const KEY_PATH = '../../../../key.pem';
const CERT_PATH = '../../../../cert.pem';

const tryGetFile = (path: string) => {
    try {
        return readFileSync(path);
    } catch (e) {
        if (e instanceof Object && 'code' in e && e.code === 'ENOENT' && 'path' in e) {
            const logger = new MyLogger('HttpsOptions');
            logger.warn(`File not found: ${e.path}`);
        }
        return undefined;
    }
};

export const tryGetHttpsOptions = () => {
    const key = tryGetFile(KEY_PATH);
    const cert = tryGetFile(CERT_PATH);

    if (!key || !cert) {
        return undefined;
    }

    return { key, cert };
};

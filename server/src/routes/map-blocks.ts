import { Request, Response } from 'express';
import * as express from 'express';

import { retrieveObject, StorageType, uploadObject } from '../lib/artefacts';

const router = express.Router();
router.get('/', async (req: Request, res: Response, next: Function) => {
    const paramNames = ['mapUId'];

    // make sure all required parameters are present
    let requestValid = true;
    paramNames.forEach((paramName) => {
        if (!Object.prototype.hasOwnProperty.call(req.query, paramName)) {
            requestValid = false;
        }
    });
    if (!requestValid) {
        return res.status(400).send('Request is missing one or more parameters');
    }

    try {
        const filePath = `mapBlocks/${req.query.mapUId}.gz`;

        const buffer = await retrieveObject(StorageType.FileStorage, filePath);

        return res.send(buffer);
    } catch (err) {
        return next(err);
    }
});

router.post('/', (req: Request, res: Response, next: Function): any => {
    const paramNames = ['mapUId'];

    // make sure all required parameters are present
    let requestValid = true;
    paramNames.forEach((paramName) => {
        if (!Object.prototype.hasOwnProperty.call(req.query, paramName)) {
            requestValid = false;
        }
    });
    if (!requestValid) {
        return res.status(400).send('Request is missing one or more parameters');
    }

    let completeData = '';
    req.on('data', (data: string | Buffer) => {
        completeData += data;
    });

    req.on('end', async () => {
        try {
            const filePath = `mapBlocks/${req.query.mapUId}.gz`;

            const dataBuffer = Buffer.from(completeData, 'base64');
            await uploadObject(StorageType.FileStorage, filePath, dataBuffer);

            return res.send();
        } catch (err) {
            return next(err);
        }
    });

    req.on('error', (err) => next(err));
});

export default router;

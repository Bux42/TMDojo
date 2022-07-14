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
        // With decompression
        // const filePath = `mapBlocks/${req.query.mapUId}.json.gz`;
        // const buffer = await retrieveObject(StorageType.FileStorage, filePath);

        const filePath = `mapBlocks/${req.query.mapUId}.json`;
        const buffer = await retrieveObject(StorageType.FileStorage, filePath, false);

        return res.send(buffer);
    } catch (err) {
        return next(err);
    }
});

router.post('/', async (req: Request, res: Response, next: Function): Promise<any> => {
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

    // TODO: error catching for invalid JSON
    const parsed = JSON.stringify(req.body);

    try {
        const filePath = `mapBlocks/${req.query.mapUId}.json.gz`;

        await uploadObject(StorageType.FileStorage, filePath, parsed);

        // Add uncompressed version for debugging purposes
        await uploadObject(StorageType.FileStorage, filePath.replace('.gz', ''), parsed, false);

        return res.send();
    } catch (err) {
        return next(err);
    }
});

export default router;

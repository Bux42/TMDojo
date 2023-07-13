import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { MyLogger } from '../../logger/my-logger.service';
import { TmIoMapDataRo } from './dto/tm-io-map-data.ro';

@Injectable()
export class TmIoApiService {
    constructor(
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(TmIoApiService.name);
    }

    async getMapInfo(mapUId: string): Promise<TmIoMapDataRo | null> {
        // Trim map UId to make sure we don't request empty strings
        // This redirects to the tm.io page instead of requesting through the API
        const trimmedMapUId = mapUId.trim();
        if (trimmedMapUId === '') {
            return null;
        }

        try {
            const res = await axios.get(`https://trackmania.io/api/map/${trimmedMapUId}`, {
                withCredentials: true,
                headers: { 'User-Agent': 'TMDojo API - https://github.com/Bux42/TMDojo' },
            });

            if (!res.data) {
                return null;
            }

            if (res.status !== 200) {
                return null;
            }

            return res.data;
        } catch (e) {
            this.logger.error(e);
            return null;
        }
    }
}

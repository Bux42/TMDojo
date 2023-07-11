import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { MyLogger } from '../../logger/my-logger.service';
import { TmIoMapDataDto } from './dto/tm-io-map-data.dto';

@Injectable()
export class TmIoApiService {
    constructor(
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(TmIoApiService.name);
    }

    async getMapInfo(mapUId: string): Promise<TmIoMapDataDto | null> {
        try {
            const res = await axios.get(`https://trackmania.io/api/map/${mapUId}`, {
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

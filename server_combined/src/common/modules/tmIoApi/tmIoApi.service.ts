import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { TmIoMapDataDto } from './dto/TmIoMapData.dto';
import { MyLogger } from '../../logger/my-logger.service';

@Injectable()
export class TmIoApiService {
    constructor(
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(TmIoApiService.name);
    }

    async getMapInfo(mapUId: string): Promise<TmIoMapDataDto> {
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

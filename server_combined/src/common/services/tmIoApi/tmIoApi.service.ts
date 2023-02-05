import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { TmIoMapDataDto } from '../../../maps/dto/TmIoMapData.dto';

@Injectable()
export class TmIoApiService {
    async getMapInfo(mapUId: string): Promise<TmIoMapDataDto> {
        const res = await axios.get(`https://trackmania.io/api/map/${mapUId}`, {
            withCredentials: true,
            headers: { 'User-Agent': 'TMDojo API - https://github.com/Bux42/TMDojo' },
        });

        if (!res.data) {
            return null;
        }

        return res.data;
    }
}

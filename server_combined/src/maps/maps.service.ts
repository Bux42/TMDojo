import { Injectable } from '@nestjs/common';

@Injectable()
export class MapsService {
    getMaps(): string[] {
        return ['Map 1', 'Map 2', 'Map 3'];
    }

    getMapById(id: string): string {
        return `Map with id ${id}`;
    }

    getMapInfoById(id: string): string {
        return `Map info of map with id ${id}`;
    }
}

import {
    Controller, Get, NotFoundException, Param, Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MapsService } from './maps.service';
import { Map } from './schemas/map.schema';

@ApiTags('maps')
@Controller('maps')
export class MapsController {
    constructor(private readonly mapsService: MapsService) {}

    @Get()
    getMapsWithReplayCounts(@Query('mapName') mapName: string): Promise<any[]> {
        return this.mapsService.findAllWithReplayCounts(mapName);
    }

    @Get([':mapUId', ':mapUId/info'])
    async getMap(@Param('mapUId') mapUId: string): Promise<Map> {
        const map = await this.mapsService.findByMapUId(mapUId);

        if (map === null) {
            throw new NotFoundException(`Map not found: ${mapUId}`);
        }

        return map;
    }
}
